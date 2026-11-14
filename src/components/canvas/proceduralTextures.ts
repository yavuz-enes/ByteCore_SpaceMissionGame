import * as THREE from 'three';

// Cache generated textures to avoid recreating on each render
const textureCache: Record<string, { map: THREE.CanvasTexture; bump?: THREE.CanvasTexture }> = {};

/**
 * Procedurally generates authentic, high-fidelity planetary surface textures
 * using 2D canvas synthesis with craters, maria, ice fissures, and canyon rifts.
 */
export function getProceduralPlanetTexture(target: string): {
  map: THREE.CanvasTexture;
  bump?: THREE.CanvasTexture;
} {
  if (textureCache[target]) {
    return textureCache[target];
  }

  const width = 1024;
  const height = 512;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  if (target === 'Mars') {
    // 1. Base Mars Reddish-Ochre Terrain
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#e8f0fe'); // North polar ice cap
    grad.addColorStop(0.08, '#d46538');
    grad.addColorStop(0.5, '#ba4b27'); // Equatorial rust
    grad.addColorStop(0.92, '#c85a2d');
    grad.addColorStop(1, '#f4f8fe'); // South polar ice cap
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Bump base
    bumpCtx.fillStyle = '#808080';
    bumpCtx.fillRect(0, 0, width, height);

    // Dark Basaltic Plains (Syrtis Major, Acidalia Planitia, Sinus Sabaeus)
    ctx.fillStyle = '#3f2115';
    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 40; i++) {
      const cx = (Math.sin(i * 1.7) * 0.5 + 0.5) * width;
      const cy = (Math.cos(i * 2.3) * 0.3 + 0.5) * height;
      const r = 40 + (i % 7) * 22;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.6, r * 0.9, (i * 0.4), 0, Math.PI * 2);
      ctx.fill();

      // Bump depression
      bumpCtx.fillStyle = '#404040';
      bumpCtx.globalAlpha = 0.35;
      bumpCtx.beginPath();
      bumpCtx.ellipse(cx, cy, r * 1.6, r * 0.9, (i * 0.4), 0, Math.PI * 2);
      bumpCtx.fill();
    }

    // Valles Marineris Canyon Rift (Dramatic deep equatorial canyon)
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = '#261009';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(width * 0.32, height * 0.52);
    ctx.bezierCurveTo(width * 0.45, height * 0.51, width * 0.55, height * 0.56, width * 0.68, height * 0.53);
    ctx.stroke();

    // Canyon bump rift
    bumpCtx.globalAlpha = 0.9;
    bumpCtx.strokeStyle = '#101010';
    bumpCtx.lineWidth = 8;
    bumpCtx.beginPath();
    bumpCtx.moveTo(width * 0.32, height * 0.52);
    bumpCtx.bezierCurveTo(width * 0.45, height * 0.51, width * 0.55, height * 0.56, width * 0.68, height * 0.53);
    bumpCtx.stroke();

    // Impact craters across highlands
    ctx.globalAlpha = 0.3;
    bumpCtx.globalAlpha = 0.5;
    for (let c = 0; c < 120; c++) {
      const cx = (c * 89.3) % width;
      const cy = height * 0.2 + ((c * 43.7) % (height * 0.6));
      const rad = 3 + (c % 8) * 2.5;

      ctx.fillStyle = '#2b120a';
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();

      // Bump crater rim
      bumpCtx.strokeStyle = '#e0e0e0';
      bumpCtx.lineWidth = 2;
      bumpCtx.beginPath();
      bumpCtx.arc(cx, cy, rad, 0, Math.PI * 2);
      bumpCtx.stroke();
      bumpCtx.fillStyle = '#202020';
      bumpCtx.fill();
    }
  } else if (target === 'Europa') {
    // 1. Base Pale Icy Sheen
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f2efe9');
    grad.addColorStop(0.3, '#d8d4cb');
    grad.addColorStop(0.7, '#e8e5dc');
    grad.addColorStop(1, '#dad5ca');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    bumpCtx.fillStyle = '#909090';
    bumpCtx.fillRect(0, 0, width, height);

    // Chaos Terrain & Russet Lineae Fissures (Intertwined global fracture network)
    ctx.globalAlpha = 0.75;
    bumpCtx.globalAlpha = 0.7;

    for (let f = 0; f < 35; f++) {
      const startX = (f * 137.5) % width;
      const startY = (f * 79.1) % height;
      const endX = (startX + 280 + Math.sin(f) * 160) % width;
      const endY = (startY + 200 + Math.cos(f) * 140) % height;

      // Double parallel fracture line
      ctx.strokeStyle = '#8d472b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + Math.sin(f) * 100,
        startY + Math.cos(f) * 80,
        endX - Math.cos(f) * 80,
        endY + Math.sin(f) * 60,
        endX,
        endY
      );
      ctx.stroke();

      bumpCtx.strokeStyle = '#202020';
      bumpCtx.lineWidth = 3;
      bumpCtx.beginPath();
      bumpCtx.moveTo(startX, startY);
      bumpCtx.bezierCurveTo(
        startX + Math.sin(f) * 100,
        startY + Math.cos(f) * 80,
        endX - Math.cos(f) * 80,
        endY + Math.sin(f) * 60,
        endX,
        endY
      );
      bumpCtx.stroke();
    }

    // Ice mottling & lenticulae (upwelling ice domes)
    ctx.fillStyle = '#b06542';
    ctx.globalAlpha = 0.25;
    for (let m = 0; m < 50; m++) {
      const mx = (m * 211) % width;
      const my = (m * 97) % height;
      ctx.beginPath();
      ctx.arc(mx, my, 8 + (m % 10) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (target === 'Moon') {
    // 1. Lunar Highland Anorthosite Base
    ctx.fillStyle = '#9ca2af';
    ctx.fillRect(0, 0, width, height);

    bumpCtx.fillStyle = '#808080';
    bumpCtx.fillRect(0, 0, width, height);

    // Lunar Maria (Dark Basalt Plains: Tranquillitatis, Serenitatis, Imbrium)
    ctx.fillStyle = '#4c525f';
    ctx.globalAlpha = 0.55;
    bumpCtx.fillStyle = '#404040';
    bumpCtx.globalAlpha = 0.5;

    const mariaLocations = [
      { x: 0.35, y: 0.42, rx: 90, ry: 75 },
      { x: 0.48, y: 0.36, rx: 70, ry: 60 },
      { x: 0.28, y: 0.28, rx: 110, ry: 90 },
      { x: 0.62, y: 0.46, rx: 65, ry: 80 },
      { x: 0.22, y: 0.62, rx: 80, ry: 70 },
    ];

    for (const m of mariaLocations) {
      ctx.beginPath();
      ctx.ellipse(m.x * width, m.y * height, m.rx, m.ry, 0.2, 0, Math.PI * 2);
      ctx.fill();

      bumpCtx.beginPath();
      bumpCtx.ellipse(m.x * width, m.y * height, m.rx, m.ry, 0.2, 0, Math.PI * 2);
      bumpCtx.fill();
    }

    // Craters & Ejecta Rays (Tycho, Copernicus, Kepler)
    ctx.globalAlpha = 0.4;
    bumpCtx.globalAlpha = 0.6;
    for (let cr = 0; cr < 140; cr++) {
      const cx = (cr * 71.3) % width;
      const cy = (cr * 37.9) % height;
      const r = 3 + (cr % 9) * 2;

      ctx.fillStyle = '#282c35';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // White ejecta rays for major craters
      if (cr % 15 === 0) {
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.35;
        for (let ray = 0; ray < 8; ray++) {
          const ang = (ray * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ang) * (r * 7), cy + Math.sin(ang) * (r * 7));
          ctx.stroke();
        }
        ctx.globalAlpha = 0.4;
      }

      // Bump rim
      bumpCtx.strokeStyle = '#f3f4f6';
      bumpCtx.lineWidth = 2;
      bumpCtx.beginPath();
      bumpCtx.arc(cx, cy, r, 0, Math.PI * 2);
      bumpCtx.stroke();
    }
  } else if (target === 'Asteroid') {
    // Dark Regolith Carbonaceous Pitted Rock
    ctx.fillStyle = '#3a3d45';
    ctx.fillRect(0, 0, width, height);

    bumpCtx.fillStyle = '#505050';
    bumpCtx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.5;
    bumpCtx.globalAlpha = 0.8;
    for (let a = 0; a < 80; a++) {
      const ax = (a * 113) % width;
      const ay = (a * 67) % height;
      const ar = 8 + (a % 12) * 5;

      ctx.fillStyle = a % 2 === 0 ? '#1f2126' : '#565a64';
      ctx.beginPath();
      ctx.arc(ax, ay, ar, 0, Math.PI * 2);
      ctx.fill();

      bumpCtx.strokeStyle = '#b0b5c0';
      bumpCtx.lineWidth = 4;
      bumpCtx.beginPath();
      bumpCtx.arc(ax, ay, ar, 0, Math.PI * 2);
      bumpCtx.stroke();
    }
  } else {
    // Earth: Ocean Blue with Continental Landmasses & Ice Caps
    ctx.fillStyle = '#10397b';
    ctx.fillRect(0, 0, width, height);

    bumpCtx.fillStyle = '#202020';
    bumpCtx.fillRect(0, 0, width, height);

    // Continents
    ctx.fillStyle = '#2e6b3b';
    ctx.globalAlpha = 0.8;
    bumpCtx.fillStyle = '#c0c0c0';
    bumpCtx.globalAlpha = 0.7;

    const continents = [
      // Africa / Europe
      { x: 0.52, y: 0.45, rx: 80, ry: 100 },
      { x: 0.51, y: 0.28, rx: 65, ry: 50 },
      // Americas
      { x: 0.25, y: 0.34, rx: 75, ry: 60 },
      { x: 0.32, y: 0.62, rx: 55, ry: 90 },
      // Asia
      { x: 0.72, y: 0.32, rx: 110, ry: 75 },
      // Australia
      { x: 0.82, y: 0.68, rx: 50, ry: 40 },
    ];

    for (const cont of continents) {
      ctx.beginPath();
      ctx.ellipse(cont.x * width, cont.y * height, cont.rx, cont.ry, 0.1, 0, Math.PI * 2);
      ctx.fill();

      bumpCtx.beginPath();
      bumpCtx.ellipse(cont.x * width, cont.y * height, cont.rx, cont.ry, 0.1, 0, Math.PI * 2);
      bumpCtx.fill();
    }

    // Polar ice
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.95;
    ctx.fillRect(0, 0, width, height * 0.08);
    ctx.fillRect(0, height * 0.92, width, height * 0.08);
  }

  // Create Three.js Textures
  const mapTexture = new THREE.CanvasTexture(canvas);
  mapTexture.wrapS = THREE.RepeatWrapping;
  mapTexture.wrapT = THREE.ClampToEdgeWrapping;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.ClampToEdgeWrapping;

  const result = { map: mapTexture, bump: bumpTexture };
  textureCache[target] = result;
  return result;
}

/**
 * Creates swirling procedural translucent clouds for Earth and Mars
 */
export function getProceduralCloudsTexture(isMars = false): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = isMars ? 'rgba(215, 140, 100, 0.2)' : 'rgba(255, 255, 255, 0.85)';
  for (let i = 0; i < 90; i++) {
    const cx = (i * 123.7) % width;
    const cy = (i * 61.3) % height;
    const rx = 30 + (i % 8) * 18;
    const ry = 10 + (i % 5) * 8;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
