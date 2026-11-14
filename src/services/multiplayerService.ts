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
      // Open Relay Project (Metered) Public STUN & TURN Relay Servers
      { urls: 'stun:openrelay.metered.ca:80' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turns:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
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
  private localChannel: BroadcastChannel | null = null;
  private keepAliveInterval: any = null;
  
  public isHost: boolean = false;
  public roomCode: string = '';
  public myPeerId: string = '';
  public isConnected: boolean = false;

  public normalizeRoomCode(code: string): string {
    return (code || '')
      .trim()
      .replace(/ı/g, 'I')
      .replace(/i/g, 'I')
      .replace(/İ/g, 'I')
      .replace(/ş/g, 'S')
      .replace(/Ş/g, 'S')
      .replace(/ğ/g, 'G')
      .replace(/Ğ/g, 'G')
      .replace(/ü/g, 'U')
      .replace(/Ü/g, 'U')
      .replace(/ö/g, 'O')
      .replace(/Ö/g, 'O')
      .replace(/ç/g, 'C')
      .replace(/Ç/g, 'C')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  private generatePeerId(code: string, isHost: boolean): string {
    const cleanCode = this.normalizeRoomCode(code);
    if (isHost) {
      return `bytecore-mission-${cleanCode}-host`;
    }
    const rand = Math.random().toString(36).substring(2, 7);
    return `bytecore-mission-${cleanCode}-client-${rand}`;
  }

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (this.peer && !this.peer.destroyed && (this.peer as any).socket) {
        try {
          (this.peer as any).socket._send({ type: 'PING' });
        } catch (e) {
          // ignore
        }
      }
    }, 15000);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private setupLocalChannel() {
    if (typeof BroadcastChannel === 'undefined') return;
    if (this.localChannel) return;

    try {
      this.localChannel = new BroadcastChannel('bytecore_mission_control_mesh');
      this.localChannel.onmessage = (event) => {
        const msg = event.data;
        if (!msg || msg.roomCode !== this.roomCode || msg.senderPeerId === this.myPeerId) {
          return;
        }

        const packet = msg.packet as NetworkPacket;
        if (this.isHost) {
          if (packet.type === 'PLAYER_JOIN') {
            this.notifyHandlers(packet);
            return;
          }
        }
        this.notifyHandlers(packet);
      };
    } catch (e) {
      console.warn('BroadcastChannel not initialized:', e);
    }
  }

  private sendLocalPacket(packet: NetworkPacket) {
    if (this.localChannel && this.roomCode) {
      try {
        this.localChannel.postMessage({
          roomCode: this.roomCode,
          senderPeerId: this.myPeerId,
          packet,
        });
      } catch (e) {
        // ignore
      }
    }
  }

  public createRoom(roomCode: string, hostPlayer: PlayerInfo): Promise<string> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.isHost = true;
      const cleanCode = this.normalizeRoomCode(roomCode);
      if (!cleanCode) {
        reject(new Error('Lütfen geçerli bir oda kodu giriniz (Harf veya rakam).'));
        return;
      }
      this.roomCode = cleanCode;
      const hostId = this.generatePeerId(this.roomCode, true);
      this.myPeerId = hostId;

      this.setupLocalChannel();

      let hasResolved = false;
      const timeoutId = setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          this.disconnect();
          reject(new Error('Sinyal sunucusuna bağlanılamadı (Zaman aşımı). Lütfen internet bağlantınızı kontrol edin.'));
        }
      }, 20000);

      try {
        this.peer = new Peer(hostId, PEER_CONFIG);

        this.peer.on('open', (id) => {
          if (hasResolved) return;
          hasResolved = true;
          clearTimeout(timeoutId);
          this.isConnected = true;
          this.myPeerId = id;
          this.startKeepAlive();
          resolve(id);
        });

        this.peer.on('disconnected', () => {
          console.warn('PeerJS Host disconnected from cloud signal, attempting reconnect...');
          if (this.peer && !this.peer.destroyed) {
            this.peer.reconnect();
          }
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
              reject(new Error(`Oda kodu (${this.roomCode}) sunucuda şu an kullanımda veya yakın zamanda kapatılmış. Lütfen 30 saniye bekleyin veya farklı bir kod seçin.`));
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
      const cleanCode = this.normalizeRoomCode(roomCode);
      if (!cleanCode) {
        reject(new Error('Lütfen geçerli bir oda kodu giriniz.'));
        return;
      }
      this.roomCode = cleanCode;
      const clientId = this.generatePeerId(this.roomCode, false);
      const hostId = this.generatePeerId(this.roomCode, true);
      this.myPeerId = clientId;
      clientPlayer.peerId = clientId;

      let hasResolved = false;

      // 1. Setup local inter-tab broadcast immediately (Instant multi-tab connection on same computer)
      this.setupLocalChannel();
      
      const localJoinListener = (packet: NetworkPacket) => {
        if (!hasResolved && (packet.type === 'ROOM_STATE_SYNC' || packet.type === 'MISSION_STATE_UPDATE')) {
          hasResolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };
      this.onPacket(localJoinListener);

      // Ping local host right away
      const initialJoinPacket = {
        type: 'PLAYER_JOIN' as const,
        player: {
          ...clientPlayer,
          peerId: clientId,
        },
      };
      this.sendLocalPacket(initialJoinPacket);
      setTimeout(() => {
        if (!hasResolved) this.sendLocalPacket(initialJoinPacket);
      }, 300);

      // 2. Global WebRTC connection for cross-network / separate computers
      const timeoutId = setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          this.disconnect();
          reject(new Error(`Kaptana bağlanılamadı (${this.roomCode}). Kaptanın odayı kurduğundan ve kodun doğru olduğundan emin olun.`));
        }
      }, 20000);

      try {
        this.peer = new Peer(clientId, PEER_CONFIG);

        this.peer.on('open', () => {
          this.isConnected = true;
          this.startKeepAlive();
          
          const attemptConnect = (retriesLeft = 3) => {
            if (hasResolved || !this.peer || this.peer.destroyed) return;

            const conn = this.peer.connect(hostId);
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
                setTimeout(() => attemptConnect(retriesLeft - 1), 1200);
              } else if (!hasResolved) {
                hasResolved = true;
                clearTimeout(timeoutId);
                reject(err);
              }
            });

            conn.on('close', () => {
              if (!hasResolved && retriesLeft > 0) {
                setTimeout(() => attemptConnect(retriesLeft - 1), 1200);
              }
            });
          };

          attemptConnect(3);
        });

        this.peer.on('disconnected', () => {
          console.warn('PeerJS Client disconnected, attempting reconnect...');
          if (this.peer && !this.peer.destroyed) {
            this.peer.reconnect();
          }
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
    this.sendLocalPacket(packet);
    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeerId && conn.open) {
        try {
          conn.send(packet);
        } catch (e) {
          console.warn('Failed to send packet to peer', peerId, e);
        }
      }
    });
  }

  public sendPacket(packet: NetworkPacket) {
    this.sendLocalPacket(packet);
    if (this.isHost) {
      this.broadcastPacket(packet);
    } else if (this.hostConnection) {
      if (this.hostConnection.open) {
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
    this.stopKeepAlive();
    if (this.localChannel) {
      try {
        this.localChannel.close();
      } catch (e) {
        // ignore
      }
      this.localChannel = null;
    }
    this.connections.forEach((c) => {
      try {
        c.close();
      } catch (e) {
        // ignore
      }
    });
    this.connections.clear();
    if (this.hostConnection) {
      try {
        this.hostConnection.close();
      } catch (e) {
        // ignore
      }
      this.hostConnection = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {
        // ignore
      }
      this.peer = null;
    }
    this.isConnected = false;
    this.isHost = false;
    this.roomCode = '';
  }
}

export const multiplayerService = new MultiplayerService();
