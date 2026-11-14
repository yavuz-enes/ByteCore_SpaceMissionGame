import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MissionState, FlightStage } from '../../types/mission';

interface ModularSpacecraftProps {
  missionState: MissionState;
  flightStage: FlightStage;
  showCenterOfMass?: boolean;
  showThermalOverlay?: boolean;
}

export const ModularSpacecraft: React.FC<ModularSpacecraftProps> = ({
  missionState,
  flightStage,
  showCenterOfMass = false,
  showThermalOverlay = false,
}) => {
  const solarWingLeftRef = useRef<THREE.Group>(null!);
  const solarWingRightRef = useRef<THREE.Group>(null!);
  const ionGlowRef = useRef<THREE.Mesh>(null!);
  const chemicalFlameRef = useRef<THREE.Mesh>(null!);

  const {
    busId,
    powerId,
    propulsionId,
    antennaId,
    selectedInstrumentIds,
  } = missionState;

  // Flight progression animations
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    // Solar array unfolding animation
    const isDeployed = [
      'solar-deploy',
      'science-pass',
      'mission-complete',
      'cruise',
      'design',
    ].includes(flightStage);

    const targetWingRot = isDeployed ? 0 : Math.PI / 2;
    if (solarWingLeftRef.current && solarWingRightRef.current) {
      solarWingLeftRef.current.rotation.y = THREE.MathUtils.lerp(
        solarWingLeftRef.current.rotation.y,
        targetWingRot,
        0.05
      );
      solarWingRightRef.current.rotation.y = THREE.MathUtils.lerp(
        solarWingRightRef.current.rotation.y,
        -targetWingRot,
        0.05
      );
    }

    // Chemical thruster flare
    if (chemicalFlameRef.current) {
      const isBurning = flightStage === 'liftoff' || flightStage === 'orbital-burn';
      chemicalFlameRef.current.visible = isBurning;
      if (isBurning) {
        const flicker = 0.85 + Math.sin(time * 35) * 0.25;
        chemicalFlameRef.current.scale.set(flicker, flicker, flicker * 1.6);
      }
    }

    // Ion engine plasma pulse
    if (ionGlowRef.current) {
      const isIonActive = propulsionId === 'prop-ion' && (flightStage === 'orbital-burn' || flightStage === 'science-pass' || flightStage === 'design');
      ionGlowRef.current.visible = isIonActive;
      if (isIonActive) {
        const pulse = 0.9 + Math.sin(time * 8) * 0.15;
        ionGlowRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  return (
    <group>
      {/* 1. BUS CHASSIS SELECTION */}
      {busId === 'bus-cubesat' && (
        /* 12U CubeSat: compact rectangular body with corner rails and gold anodized faceplates */
        <group>
          <mesh>
            <boxGeometry args={[0.32, 0.32, 0.65]} />
            <meshStandardMaterial color="#2d3038" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Gold Kapton Foil Side Plate */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.28, 0.28, 0.64]} />
            <meshStandardMaterial color="#e5a93b" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Rails on 4 corners */}
          {[-0.15, 0.15].map((x, xi) =>
            [-0.15, 0.15].map((y, yi) => (
              <mesh key={`rail-${xi}-${yi}`} position={[x, y, 0]}>
                <boxGeometry args={[0.02, 0.02, 0.67]} />
                <meshStandardMaterial color="#1a1c22" metalness={0.9} roughness={0.2} />
              </mesh>
            ))
          )}
        </group>
      )}

      {busId === 'bus-smallsat' && (
        /* ESPA SmallSat: Box chassis with silver MLI foil and star tracker tube */
        <group>
          <mesh>
            <boxGeometry args={[0.52, 0.44, 0.54]} />
            <meshStandardMaterial color="#d4d8e2" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Star tracker baffle tube */}
          <mesh position={[0.22, 0.22, 0.2]} rotation={[0.4, 0.2, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.12, 16]} />
            <meshStandardMaterial color="#1f232e" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      )}

      {busId === 'bus-medium' && (
        /* Deep Space Explorer: Octagonal bus with gold multi-layer insulation */
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.65, 8]} />
            <meshStandardMaterial color="#e6a836" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Reaction Wheel Housing Rim */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.43, 0.43, 0.12, 16]} />
            <meshStandardMaterial color="#545864" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      )}

      {busId === 'bus-flagship' && (
        /* Flagship Jupiter Vault: Heavy dual-tier titanium chassis with thick radiation vault */
        <group>
          {/* Lower propulsion deck */}
          <mesh position={[0, 0, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.52, 0.52, 0.35, 12]} />
            <meshStandardMaterial color="#707684" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Upper radiation shielded avionics vault */}
          <mesh position={[0, 0, 0.18]}>
            <boxGeometry args={[0.46, 0.42, 0.38]} />
            <meshStandardMaterial color="#e5a93b" metalness={0.9} roughness={0.12} />
          </mesh>
          {/* Reinforced tantalum corner pillars */}
          {[-0.22, 0.22].map((x, xi) =>
            [-0.2, 0.2].map((y, yi) => (
              <mesh key={`pillar-${xi}-${yi}`} position={[x, y, 0.18]}>
                <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
                <meshStandardMaterial color="#1a1c22" metalness={0.95} roughness={0.1} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* 2. POWER SYSTEM / SOLAR ARRAY CONFIGURATION */}
      {powerId === 'power-body' && (
        /* Body-mounted solar cells: Flat dark-blue photovoltaic tiles on the sides, no wings */
        <group>
          {[-0.27, 0.27].map((x, i) => (
            <mesh key={`body-panel-${i}`} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.45, 0.38]} />
              <meshStandardMaterial color="#1a2b6d" metalness={0.7} roughness={0.2} />
            </mesh>
          ))}
        </group>
      )}

      {powerId === 'power-deployable' && (
        /* Twin deployable rectangular solar wings with carbon fiber frames */
        <group>
          {/* Left Wing */}
          <group ref={solarWingLeftRef} position={[-0.28, 0, 0]}>
            <mesh position={[-0.45, 0, 0]}>
              <boxGeometry args={[0.85, 0.32, 0.02]} />
              <meshStandardMaterial color="#1e3a8a" metalness={0.65} roughness={0.2} />
            </mesh>
            {/* Array Hinge Joint */}
            <mesh position={[-0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
              <meshStandardMaterial color="#858b98" metalness={0.9} />
            </mesh>
          </group>

          {/* Right Wing */}
          <group ref={solarWingRightRef} position={[0.28, 0, 0]}>
            <mesh position={[0.45, 0, 0]}>
              <boxGeometry args={[0.85, 0.32, 0.02]} />
              <meshStandardMaterial color="#1e3a8a" metalness={0.65} roughness={0.2} />
            </mesh>
            {/* Array Hinge Joint */}
            <mesh position={[0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
              <meshStandardMaterial color="#858b98" metalness={0.9} />
            </mesh>
          </group>
        </group>
      )}

      {powerId === 'power-gallium' && (
        /* Advanced Gallium UltraFlex Circular Fan Arrays */
        <group>
          {/* Left UltraFlex Disc */}
          <group ref={solarWingLeftRef} position={[-0.32, 0, 0]}>
            <mesh position={[-0.45, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <cylinderGeometry args={[0.48, 0.48, 0.015, 12]} />
              <meshStandardMaterial color="#945f1e" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
          {/* Right UltraFlex Disc */}
          <group ref={solarWingRightRef} position={[0.32, 0, 0]}>
            <mesh position={[0.45, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <cylinderGeometry args={[0.48, 0.48, 0.015, 12]} />
              <meshStandardMaterial color="#945f1e" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>
      )}

      {powerId === 'power-rtg' && (
        /* Multi-Mission Radioisotope Thermoelectric Generator (RTG): No solar wings, cylindrical finned body with heat glow */
        <group position={[-0.4, -0.15, 0]} rotation={[0, 0, -Math.PI / 6]}>
          {/* Mounting boom */}
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, 0.28, 8]} />
            <meshStandardMaterial color="#545864" metalness={0.8} />
          </mesh>
          {/* RTG Core Cylinder */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.32, 12]} />
            <meshStandardMaterial color="#2d3038" metalness={0.9} roughness={0.3} />
          </mesh>
          {/* Cooling Fins (Radial heat radiators) */}
          {[0, Math.PI / 3, (2 * Math.PI) / 3].map((rot, ri) => (
            <mesh key={`rtg-fin-${ri}`} rotation={[0, 0, rot]}>
              <boxGeometry args={[0.28, 0.012, 0.28]} />
              <meshStandardMaterial color="#1a1c22" metalness={0.8} />
            </mesh>
          ))}
          {/* Internal Radiogenic Heat Core Glow */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ff5511" />
          </mesh>
        </group>
      )}

      {/* 3. PROPULSION SYSTEM SELECTION */}
      {propulsionId === 'prop-coldgas' && (
        /* Cold Gas RCS Quads on 4 corners */
        <group>
          {[-0.22, 0.22].map((x, xi) =>
            [-0.22, 0.22].map((y, yi) => (
              <mesh key={`rcs-${xi}-${yi}`} position={[x, y, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.03, 0.06, 8]} />
                <meshStandardMaterial color="#cfd5e0" metalness={0.9} />
              </mesh>
            ))
          )}
        </group>
      )}

      {propulsionId === 'prop-monoprop' && (
        /* Hydrazine Monopropellant Conical Nozzle */
        <group position={[0, 0, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <coneGeometry args={[0.13, 0.22, 16]} />
            <meshStandardMaterial color="#545864" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Active Thruster Plume */}
          <mesh ref={chemicalFlameRef} position={[0, -0.22, 0]} rotation={[Math.PI, 0, 0]} visible={false}>
            <coneGeometry args={[0.15, 0.45, 12]} />
            <meshBasicMaterial color="#ff9a3c" transparent opacity={0.8} />
          </mesh>
        </group>
      )}

      {propulsionId === 'prop-biprop' && (
        /* Dual Chemical Engine Bells */
        <group position={[0, 0, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[-0.08, 0, 0]}>
            <coneGeometry args={[0.09, 0.2, 16]} />
            <meshStandardMaterial color="#3b3f4a" metalness={0.95} roughness={0.2} />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <coneGeometry args={[0.09, 0.2, 16]} />
            <meshStandardMaterial color="#3b3f4a" metalness={0.95} roughness={0.2} />
          </mesh>
          {/* Active Thruster Plume */}
          <mesh ref={chemicalFlameRef} position={[0, -0.25, 0]} rotation={[Math.PI, 0, 0]} visible={false}>
            <coneGeometry args={[0.22, 0.55, 12]} />
            <meshBasicMaterial color="#ff7a1a" transparent opacity={0.85} />
          </mesh>
        </group>
      )}

      {propulsionId === 'prop-ion' && (
        /* NEXT-C Xenon Ion Electric Engine with glowing blue plasma grid */
        <group position={[0, 0, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
          {/* Thruster Body Cylinder */}
          <mesh>
            <cylinderGeometry args={[0.13, 0.13, 0.14, 16]} />
            <meshStandardMaterial color="#707684" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Ion Accelerator Grid Ring */}
          <mesh position={[0, -0.07, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.02, 16]} />
            <meshStandardMaterial color="#2d3038" metalness={0.8} />
          </mesh>
          {/* Glowing Xenon Plasma Plume */}
          <mesh ref={ionGlowRef} position={[0, -0.28, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.11, 0.45, 16]} />
            <meshBasicMaterial color="#54b9ff" transparent opacity={0.75} />
          </mesh>
        </group>
      )}

      {/* 4. ANTENNA & COMMUNICATIONS SELECTION */}
      {antennaId === 'ant-omni' && (
        /* Low-Gain Omni Whip Antennas */
        <group position={[0.18, 0.22, 0.22]}>
          <mesh rotation={[0.2, 0.2, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.35, 6]} />
            <meshStandardMaterial color="#ffd493" metalness={0.9} />
          </mesh>
        </group>
      )}

      {antennaId === 'ant-horn' && (
        /* Medium-Gain Brass Pyramidal Horn Antenna */
        <group position={[0, 0.24, 0.15]} rotation={[-Math.PI / 4, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.03, 0.16, 4]} />
            <meshStandardMaterial color="#d4a359" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      )}

      {antennaId === 'ant-dish-hga' && (
        /* 2.4-Meter High-Gain Cassegrain Dish */
        <group position={[0, 0.32, 0]} rotation={[-Math.PI / 4, 0, 0]}>
          {/* Parabolic reflector bowl */}
          <mesh>
            <sphereGeometry args={[0.26, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
            <meshStandardMaterial color="#f0f4f8" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          {/* Sub-reflector feed horn tripod */}
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.16, 8]} />
            <meshStandardMaterial color="#545864" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#3b3f4a" metalness={0.9} />
          </mesh>
        </group>
      )}

      {antennaId === 'ant-laser' && (
        /* Deep Space Optical Communications (DSOC) Laser Turret */
        <group position={[0, 0.26, 0.1]} rotation={[-Math.PI / 4, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.14, 16]} />
            <meshStandardMaterial color="#1f232e" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Optical aperture mirror */}
          <mesh position={[0, 0.075, 0]}>
            <circleGeometry args={[0.06, 16]} />
            <meshStandardMaterial color="#4bf3c8" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
      )}

      {/* 5. SCIENTIFIC INSTRUMENTS PAYLOAD MOUNTING */}
      {/* High-Resolution Optical Camera */}
      {selectedInstrumentIds.includes('inst-camera-hires') && (
        <group position={[0.12, -0.22, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.06, 0.2, 16]} />
            <meshStandardMaterial color="#f0f4f8" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Lens aperture */}
          <mesh position={[0, 0.105, 0]}>
            <circleGeometry args={[0.045, 16]} />
            <meshStandardMaterial color="#0b1329" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* Subsurface Radar Sounding Dipole Antennas */}
      {selectedInstrumentIds.includes('inst-radar-subsurface') && (
        <group position={[0, 0, -0.15]}>
          {/* Left dipole wire boom */}
          <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 1.2, 6]} />
            <meshStandardMaterial color="#ffd493" metalness={0.9} />
          </mesh>
          {/* Right dipole wire boom */}
          <mesh position={[0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 1.2, 6]} />
            <meshStandardMaterial color="#ffd493" metalness={0.9} />
          </mesh>
        </group>
      )}

      {/* Magnetometer Boom: Deployable 1.3m lattice boom extending into space */}
      {selectedInstrumentIds.includes('inst-magnetometer') && (
        <group position={[0, -0.15, -0.25]} rotation={[0.4, 0, 0]}>
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 1.2, 6]} />
            <meshStandardMaterial color="#ffd493" metalness={0.9} />
          </mesh>
          {/* Sensor Pod at boom tip */}
          <mesh position={[0, -1.22, 0]}>
            <boxGeometry args={[0.06, 0.06, 0.06]} />
            <meshStandardMaterial color="#e5a93b" metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* Infrared Spectrometer Sensor Box */}
      {selectedInstrumentIds.includes('inst-spectrometer-ir') && (
        <group position={[-0.14, -0.22, 0.12]}>
          <mesh>
            <boxGeometry args={[0.1, 0.1, 0.12]} />
            <meshStandardMaterial color="#cfd5e0" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Cryo-radiator plate */}
          <mesh position={[0, 0, 0.065]}>
            <planeGeometry args={[0.08, 0.08]} />
            <meshStandardMaterial color="#1a1c22" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. CENTER OF MASS (CoM) INDICATOR (AEROSPACE STANDARD) */}
      {/* ------------------------------------------------------------- */}
      {showCenterOfMass && (
        <group position={[0, -0.04, 0]}>
          {/* Yellow/Black Quartered Sphere */}
          <mesh>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#ffd493" metalness={0.3} roughness={0.4} />
          </mesh>
          {/* Crosshair ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.09, 0.008, 8, 24]} />
            <meshBasicMaterial color="#0c0f19" />
          </mesh>
          {/* CoM Principal Axis Line */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.6, 6]} />
            <meshBasicMaterial color="#ffd493" />
          </mesh>
          {/* CoM Telemetry Tag */}
          <Html position={[0, 0.12, 0]} center pointerEvents="none">
            <div className="bg-abyss/90 border border-amber/70 px-2 py-0.5 rounded-full font-mono text-[9px] text-amber whitespace-nowrap shadow-md pointer-events-none select-none">
              CoM [0, -0.04, 0]
            </div>
          </Html>
        </group>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. SURFACE THERMAL DISTRIBUTION OVERLAY (HOT SUN / COLD SHADOW) */}
      {/* ------------------------------------------------------------- */}
      {showThermalOverlay && (
        <group>
          {/* Sunward Hot Surface Thermal Shell */}
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.56, 0.48, 0.58]} />
            <meshBasicMaterial
              color="#ef4444"
              wireframe
              transparent
              opacity={0.65}
            />
          </mesh>
          {/* Sunward Heat Glow */}
          <mesh position={[0, 0, 0.28]}>
            <planeGeometry args={[0.5, 0.4]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.35} />
          </mesh>
          {/* Anti-Sun Cryogenic Shadow Shell */}
          <mesh position={[0, 0, -0.28]}>
            <planeGeometry args={[0.5, 0.4]} />
            <meshBasicMaterial color="#0284c7" transparent opacity={0.45} />
          </mesh>
          {/* Thermal Equilibrium Label */}
          <Html position={[0, 0.45, 0]} center pointerEvents="none">
            <div className="bg-abyss/95 border border-plasma-blue/70 px-2.5 py-1 rounded-full font-mono text-[9px] text-lunar-white whitespace-nowrap shadow-lg flex items-center space-x-1.5 pointer-events-none select-none">
              <span className="text-red-400 font-bold">+118°C SUN</span>
              <span className="text-gunmetal">|</span>
              <span className="text-plasma-blue font-bold">-85°C UMBRA</span>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};
