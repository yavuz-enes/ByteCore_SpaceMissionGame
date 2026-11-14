import Peer, { DataConnection } from 'peerjs';
import { PlayerInfo, NetworkPacket, ChatMessage, BudgetProposal } from '../types/multiplayer';
import { MissionState, PlayerRole } from '../types/mission';

type PacketHandler = (packet: NetworkPacket) => void;

// High-Performance STUN & TURN Relay Infrastructure for Global NAT/Firewall Traversal
const PEER_CONFIG = {
  debug: 1,
  config: {
    iceServers: [
      // Google Fast STUN
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' },
      // Open Relay Project (Metered) Public STUN & TURN Relay Servers (Port 80 and 443 TCP & UDP for Symmetric NAT traversal)
      { urls: 'stun:openrelay.metered.ca:80' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayprojectsecret',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayprojectsecret',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayprojectsecret',
      },
    ],
    iceCandidatePoolSize: 10,
  },
};

class MultiplayerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  private packetHandlers: Set<PacketHandler> = new Set();
  
  public isHost: boolean = false;
  public roomCode: string = '';
  public myPeerId: string = '';
  public isConnected: boolean = false;

  private generatePeerId(code: string, isHost: boolean): string {
    const cleanCode = code
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    if (isHost) {
      return `bytecore-mission-${cleanCode}-host`;
    }
    const rand = Math.random().toString(36).substring(2, 7);
    return `bytecore-mission-${cleanCode}-client-${rand}`;
  }

  public createRoom(roomCode: string, hostPlayer: PlayerInfo): Promise<string> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.isHost = true;
      this.roomCode = roomCode.toUpperCase();
      const hostId = this.generatePeerId(this.roomCode, true);
      this.myPeerId = hostId;

      let hasResolved = false;
      const timeoutId = setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          this.disconnect();
          reject(new Error('Sinyal sunucusuna bağlanılamadı (Zaman aşımı). Lütfen internet bağlantınızı kontrol edin.'));
        }
      }, 25000);

      try {
        this.peer = new Peer(hostId, PEER_CONFIG);

        this.peer.on('open', (id) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(timeoutId);
          this.isConnected = true;
          this.myPeerId = id;
          resolve(id);
        });

        this.peer.on('connection', (conn) => {
          this.setupConnection(conn);
        });

        this.peer.on('error', (err: any) => {
          console.warn('PeerJS Host Error:', err);
          if (!hasResolved) {
            hasResolved = true;
            clearTimeout(timeoutId);
            if (err?.type === 'unavailable-id') {
              reject(new Error('Bu oda kodu şu anda kullanımda. Lütfen başka bir kod seçin veya mevcut odanın kapanmasını bekleyin.'));
            } else {
              reject(err);
            }
          }
        });
      } catch (e) {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(timeoutId);
          reject(e);
        }
      }
    });
  }

  public joinRoom(roomCode: string, clientPlayer: PlayerInfo): Promise<void> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.isHost = false;
      this.roomCode = roomCode.toUpperCase();
      const clientId = this.generatePeerId(this.roomCode, false);
      const hostId = this.generatePeerId(this.roomCode, true);
      this.myPeerId = clientId;
      clientPlayer.peerId = clientId;

      let hasResolved = false;
      const timeoutId = setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          this.disconnect();
          reject(new Error('Kaptana bağlanılamadı (Zaman aşımı). Kaptanın odayı kurduğundan ve kodun doğru olduğundan emin olun.'));
        }
      }, 25000);

      try {
        this.peer = new Peer(clientId, PEER_CONFIG);

        this.peer.on('open', () => {
          this.isConnected = true;
          
          const attemptConnect = (retriesLeft = 3) => {
            if (hasResolved || !this.peer || this.peer.destroyed) return;

            const conn = this.peer.connect(hostId, {
              reliable: true,
            });
            this.hostConnection = conn;

            conn.on('open', () => {
              if (hasResolved) return;
              hasResolved = true;
              clearTimeout(timeoutId);
              this.setupConnection(conn);

              const joinPacket = {
                type: 'PLAYER_JOIN' as const,
                player: {
                  ...clientPlayer,
                  peerId: clientId,
                },
              };

              this.sendPacket(joinPacket);
              setTimeout(() => {
                this.sendPacket(joinPacket);
              }, 300);

              resolve();
            });

            conn.on('error', (err) => {
              console.warn('Connection to Host error:', err);
              if (retriesLeft > 0 && !hasResolved) {
                setTimeout(() => attemptConnect(retriesLeft - 1), 1500);
              } else if (!hasResolved) {
                hasResolved = true;
                clearTimeout(timeoutId);
                reject(err);
              }
            });

            conn.on('close', () => {
              if (!hasResolved && retriesLeft > 0) {
                setTimeout(() => attemptConnect(retriesLeft - 1), 1500);
              }
            });
          };

          attemptConnect(3);
        });

        this.peer.on('error', (err: any) => {
          console.warn('PeerJS Client Error:', err);
          if (!hasResolved) {
            hasResolved = true;
            clearTimeout(timeoutId);
            if (err?.type === 'peer-unavailable') {
              reject(new Error(`Oda (${this.roomCode}) bulunamadı. Kaptanın odayı kurduğundan ve kodun doğru olduğundan emin olun.`));
            } else {
              reject(err);
            }
          }
        });
      } catch (e) {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(timeoutId);
          reject(e);
        }
      }
    });
  }

  private setupConnection(conn: DataConnection) {
    const onReady = () => {
      this.connections.set(conn.peer, conn);
    };

    if (conn.open) {
      onReady();
    } else {
      conn.on('open', onReady);
    }

    conn.on('data', (data) => {
      try {
        const packet = data as NetworkPacket;
        if (this.isHost) {
          if (packet.type === 'PLAYER_JOIN') {
            packet.player.peerId = conn.peer;
            this.connections.set(conn.peer, conn);
          }
          if (packet.type === 'READY_TOGGLE') {
            packet.peerId = conn.peer;
          }
        }
        this.notifyHandlers(packet);

        // If host, rebroadcast certain packets to all other clients
        if (this.isHost) {
          if (
            packet.type === 'MISSION_STATE_UPDATE' ||
            packet.type === 'ROLE_CLAIM' ||
            packet.type === 'READY_TOGGLE' ||
            packet.type === 'CHAT_MSG' ||
            packet.type === 'BUDGET_PROPOSAL' ||
            packet.type === 'BUDGET_VOTE' ||
            packet.type === 'ANOMALY_VOTE' ||
            packet.type === 'ANOMALY_TRIGGERED' ||
            packet.type === 'ANOMALY_RESOLVED' ||
            packet.type === 'TECH_CLEARANCE_REQUEST' ||
            packet.type === 'TECH_CLEARANCE_RESPONSE' ||
            packet.type === 'ASYMMETRIC_ANOMALY_INIT' ||
            packet.type === 'ASYMMETRIC_ANOMALY_SOLVED' ||
            packet.type === 'TEAMMATE_ASSISTANCE_PING' ||
            packet.type === 'CAMPAIGN_QUEUE_UPDATE' ||
            packet.type === 'LAUNCH_POLL_INIT' ||
            packet.type === 'LAUNCH_POLL_VOTE' ||
            packet.type === 'LAUNCH_MODAL_SYNC'
          ) {
            this.broadcastPacket(packet, conn.peer);
          }
        }
      } catch (e) {
        console.error('Failed to parse network packet', e);
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.notifyHandlers({
        type: 'PLAYER_LEAVE',
        peerId: conn.peer,
      });
    });

    conn.on('error', (err) => {
      console.warn('DataConnection error:', err);
    });
  }

  public broadcastPacket(packet: NetworkPacket, excludePeerId?: string) {
    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeerId && conn.open) {
        conn.send(packet);
      }
    });
  }

  public sendPacket(packet: NetworkPacket) {
    if (this.isHost) {
      // Host sends to all connected clients
      this.broadcastPacket(packet);
    } else if (this.hostConnection) {
      if (this.hostConnection.open) {
        // Client sends to host
        this.hostConnection.send(packet);
      } else {
        const onOpen = () => {
          this.hostConnection?.send(packet);
        };
        this.hostConnection.on('open', onOpen);
      }
    }
  }

  public onPacket(handler: PacketHandler) {
    this.packetHandlers.add(handler);
    return () => {
      this.packetHandlers.delete(handler);
    };
  }

  private notifyHandlers(packet: NetworkPacket) {
    this.packetHandlers.forEach((handler) => handler(packet));
  }

  public disconnect() {
    this.connections.forEach((c) => c.close());
    this.connections.clear();
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.isConnected = false;
    this.isHost = false;
    this.roomCode = '';
  }
}

export const multiplayerService = new MultiplayerService();
