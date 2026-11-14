import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMissionStore } from '../../store/missionStore';
import {
  getLocalizedScenarios,
  getLocalizedOrbitProfiles,
  TARGET_TRANSLATIONS,
} from '../../i18n/missionsLocale';
import { TRANSLATIONS } from '../../i18n/translations';
import { getProceduralPlanetTexture, getProceduralCloudsTexture } from './proceduralTextures';
import { ModularSpacecraft } from './ModularSpacecraft';

// ---------------------------------------------------------------------------
// 1. Procedural Realistic Celestial Body with Bump, Clouds & Rim Glow
// ---------------------------------------------------------------------------
interface CelestialBodyProps {
  target: string;
}

const CelestialBody: React.FC<CelestialBodyProps> = ({ target }) => {
  const planetRef = useRef<THREE.Mesh>(null!);
  const cloudsRef = useRef<THREE.Mesh>(null!);
  const atmosphereRef = useRef<THREE.Mesh>(null!);

  const { map, bump } = useMemo(() => getProceduralPlanetTexture(target), [target]);
  const cloudsTexture = useMemo(
    () => (target === 'Earth' || target === 'Mars' ? getProceduralCloudsTexture(target === 'Mars') : null),
    [target]
  );

  const config = useMemo(() => {
    switch (target) {
      case 'Moon':
        return {
          radius: 2.2,
          roughness: 0.92,
          metalness: 0.08,
          bumpScale: 0.05,
          hasClouds: false,
          hasAtmosphere: false,
          atmosphereColor: '#000000',
        };
      case 'Mars':
        return {
          radius: 2.5,
          roughness: 0.82,
          metalness: 0.15,
          bumpScale: 0.06,
          hasClouds: true,
          hasAtmosphere: true,
          atmosphereColor: '#ff7043',
        };
      case 'Europa':
        return {
          radius: 2.1,
          roughness: 0.35,
          metalness: 0.25,
          bumpScale: 0.03,
          hasClouds: false,
          hasAtmosphere: true,
          atmosphereColor: '#70c5ff',
        };
      case 'Asteroid':
        return {
          radius: 1.6,
          roughness: 0.95,
          metalness: 0.35,
          bumpScale: 0.08,
          hasClouds: false,
          hasAtmosphere: false,
          atmosphereColor: '#000000',
        };
      default: // Earth
        return {
          radius: 2.8,
          roughness: 0.55,
          metalness: 0.2,
          bumpScale: 0.04,
          hasClouds: true,
          hasAtmosphere: true,
          atmosphereColor: '#38bdf8',
        };
    }
  }, [target]);

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.08;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Planet Sphere */}
      <mesh ref={planetRef}>
        {target === 'Asteroid' ? (
          <dodecahedronGeometry args={[config.radius, 2]} />
        ) : (
          <sphereGeometry args={[config.radius, 64, 64]} />
        )}
        <meshStandardMaterial
          map={map}
          bumpMap={bump}
          bumpScale={config.bumpScale}
          roughness={config.roughness}
          metalness={config.metalness}
          wireframe={false}
        />
      </mesh>

      {/* Rotating Clouds for Earth / Mars dust haze */}
      {config.hasClouds && cloudsTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[config.radius * 1.025, 48, 48]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={target === 'Mars' ? 0.3 : 0.65}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Atmospheric Rim Light (Inverted Fresnel Glow) */}
      {config.hasAtmosphere && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[config.radius * 1.045, 48, 48]} />
          <meshStandardMaterial
            color={config.atmosphereColor}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
};

// ---------------------------------------------------------------------------
// 2. Close-up Orbit Trajectory with Apoapsis & Periapsis Waypoints
// ---------------------------------------------------------------------------
interface OrbitTrajectoryProps {
  radius: number;
  inclinationDeg: number;
  altitudeKm: number;
  tLabels: {
    apoapsis: string;
    periapsis: string;
  };
}

const OrbitTrajectory: React.FC<OrbitTrajectoryProps> = ({
  radius,
  inclinationDeg,
  altitudeKm,
  tLabels,
}) => {
  const radInc = (inclinationDeg * Math.PI) / 180;
  const semiMajor = radius * 1.08;
  const semiMinor = radius * 0.94;

  // 1. Orbital Spline Loop
  const lineObject = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = semiMajor * Math.cos(theta);
      const z = semiMinor * Math.sin(theta) * Math.cos(radInc);
      const y = semiMinor * Math.sin(theta) * Math.sin(radInc);
      pts.push(new THREE.Vector3(x, y, z));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const material = new THREE.LineBasicMaterial({
      color: '#54b9ff',
      transparent: true,
      opacity: 0.55,
    });
    return new THREE.Line(geometry, material);
  }, [semiMajor, semiMinor, radInc]);

  // 2. Semi-Major Axis Line (connecting AP and PE through center)
  const axisLine = useMemo(() => {
    const pts = [
      new THREE.Vector3(-semiMajor, 0, 0),
      new THREE.Vector3(semiMajor, 0, 0),
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const material = new THREE.LineDashedMaterial({
      color: '#545864',
      dashSize: 0.2,
      gapSize: 0.1,
      transparent: true,
      opacity: 0.4,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
  }, [semiMajor]);

  // Coordinate for Apoapsis (AP)
  const apX = -semiMajor;
  const apY = 0;
  const apZ = 0;

  // Coordinate for Periapsis (PE)
  const peX = semiMajor;
  const peY = 0;
  const peZ = 0;

  return (
    <group>
      <primitive object={lineObject} />
      <primitive object={axisLine} />

      {/* Apoapsis (AP) Waypoint Marker */}
      <group position={[apX, apY, apZ]}>
        <mesh>
          <octahedronGeometry args={[0.08, 0]} />
          <meshBasicMaterial color="#acafff" />
        </mesh>
        <Html distanceFactor={14} center pointerEvents="none">
          <div className="bg-abyss/90 border border-ultraviolet/60 px-1.5 py-0.5 rounded-full font-mono text-[9px] text-ultraviolet whitespace-nowrap shadow-md pointer-events-none select-none">
            {tLabels.apoapsis}: {(altitudeKm * 1.08).toFixed(0)} km
          </div>
        </Html>
      </group>

      {/* Periapsis (PE) Waypoint Marker */}
      <group position={[peX, peY, peZ]}>
        <mesh>
          <octahedronGeometry args={[0.08, 0]} />
          <meshBasicMaterial color="#4bf3c8" />
        </mesh>
        <Html distanceFactor={14} center pointerEvents="none">
          <div className="bg-abyss/90 border border-aurora-mint/60 px-1.5 py-0.5 rounded-full font-mono text-[9px] text-aurora-mint whitespace-nowrap shadow-md pointer-events-none select-none">
            {tLabels.periapsis}: {(altitudeKm * 0.94).toFixed(0)} km
          </div>
        </Html>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 3. Orbiting Modular Satellite Controller with Velocity Vector
// ---------------------------------------------------------------------------
interface OrbitingSpacecraftProps {
  radius: number;
  inclinationDeg: number;
}

const OrbitingSpacecraft: React.FC<OrbitingSpacecraftProps> = ({
  radius,
  inclinationDeg,
}) => {
  const probeGroupRef = useRef<THREE.Group>(null!);
  const { missionState, flightStage, showCenterOfMass, showThermalOverlay } = useMissionStore();

  const radInc = (inclinationDeg * Math.PI) / 180;
  const semiMajor = radius * 1.08;
  const semiMinor = radius * 0.94;

  useFrame(({ clock }) => {
    // True anomaly speed variation (Keplerian approximation)
    const t = clock.getElapsedTime() * 0.35;
    const x = semiMajor * Math.cos(t);
    const z = semiMinor * Math.sin(t) * Math.cos(radInc);
    const y = semiMinor * Math.sin(t) * Math.sin(radInc);

    if (probeGroupRef.current) {
      probeGroupRef.current.position.set(x, y, z);

      // Tangent velocity orientation
      const dt = 0.05;
      const nextX = semiMajor * Math.cos(t + dt);
      const nextZ = semiMinor * Math.sin(t + dt) * Math.cos(radInc);
      const nextY = semiMinor * Math.sin(t + dt) * Math.sin(radInc);

      probeGroupRef.current.lookAt(nextX, nextY, nextZ);
    }
  });

  return (
    <group ref={probeGroupRef}>
      <ModularSpacecraft
        missionState={missionState}
        flightStage={flightStage}
        showCenterOfMass={showCenterOfMass}
        showThermalOverlay={showThermalOverlay}
      />

      {/* Tangent Velocity Vector Arrow Indicator */}
      <mesh position={[0, 0, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.04, 0.14, 8]} />
        <meshBasicMaterial color="#4bf3c8" />
      </mesh>
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.36, 6]} />
        <meshBasicMaterial color="#4bf3c8" />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------------------
// 4. Master SpaceCanvas Component (Focused Viewport & Key Telemetry)
// ---------------------------------------------------------------------------
export const SpaceCanvas: React.FC = () => {
  const {
    missionState,
    locale,
  } = useMissionStore();
  const controlsRef = useRef<any>(null!);

  const t = TRANSLATIONS[locale].canvas;
  const scenarios = getLocalizedScenarios(locale);
  const orbits = getLocalizedOrbitProfiles(locale);

  const currentScenario = scenarios.find((s) => s.id === missionState.scenarioId) || scenarios[0];
  const currentOrbit = orbits.find((o) => o.id === missionState.orbitId) || orbits[0];
  const targetName = TARGET_TRANSLATIONS[locale][currentScenario.target] || currentScenario.target;

  const orbitRadius = useMemo(() => {
    switch (currentScenario.target) {
      case 'Moon':
        return 3.6;
      case 'Mars':
        return 4.2;
      case 'Europa':
        return 4.8;
      case 'Asteroid':
        return 3.0;
      default:
        return 4.5;
    }
  }, [currentScenario.target]);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-singularity rounded-2xl overflow-hidden flex flex-col">
      {/* Top HUD Telemetry Pill (Pure Status Only) */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none select-none">
        <div className="flex items-center space-x-2 bg-[#0E1422]/90 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-mono text-white shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse" />
          <span>
            {t.target}: <strong>{targetName.toUpperCase()}</strong>
          </span>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <Canvas
        camera={{ position: [0, 3.8, 8.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Directional Sunlight with Day/Night Terminator Shadows */}
        <directionalLight position={[14, 5, 10]} intensity={2.2} color="#ffffff" />
        <ambientLight intensity={0.15} />
        <pointLight position={[-12, -4, -8]} intensity={0.25} color="#acafff" />

        {/* Deep Space Starfield */}
        <Stars radius={120} depth={60} count={4000} factor={4.5} saturation={0} fade speed={1.2} />

        {/* Orbit View: Celestial Body, AP/PE Trajectory Markers & Modular Satellite */}
        <group>
          <CelestialBody target={currentScenario.target} />

          <OrbitTrajectory
            radius={orbitRadius}
            inclinationDeg={currentOrbit.inclinationDeg}
            altitudeKm={currentOrbit.altitudeKm}
            tLabels={{
              apoapsis: t.apoapsis,
              periapsis: t.periapsis,
            }}
          />

          <OrbitingSpacecraft
            radius={orbitRadius}
            inclinationDeg={currentOrbit.inclinationDeg}
          />
        </group>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableRotate={true}
          enableZoom={true}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={25}
        />
      </Canvas>
    </div>
  );
};
