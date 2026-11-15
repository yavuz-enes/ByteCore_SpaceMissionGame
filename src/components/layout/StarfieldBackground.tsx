import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  radius: number;
  alpha: number;
  alphaSpeed: number;
  color: string;
}

export const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Generate ~220 multi-depth stars
    const starColors = ['#ffffff', '#bae6fd', '#e0e7ff', '#fde047', '#38bdf8', '#c084fc'];
    const starCount = Math.min(240, Math.max(120, Math.floor((width * height) / 6500)));

    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.2 + Math.random() * 0.8, // Parallax depth layer
      radius: 0.6 + Math.random() * 1.5,
      alpha: 0.2 + Math.random() * 0.8,
      alphaSpeed: 0.005 + Math.random() * 0.015,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // Slide/Drift velocity (gentle diagonal drift)
    const driftSpeedX = -0.18;
    const driftSpeedY = 0.08;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Drift star based on depth (z layer)
        star.x += driftSpeedX * star.z;
        star.y += driftSpeedY * star.z;

        // Wrap around boundaries
        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;
        if (star.y < -10) star.y = height + 10;
        if (star.y > height + 10) star.y = -10;

        // Gentle twinkle
        star.alpha += star.alphaSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.25) {
          star.alphaSpeed = -star.alphaSpeed;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * star.z, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.15, Math.min(1, star.alpha));
        ctx.fill();

        // Subtle soft glow for prominent stars
        if (star.radius > 1.2 && star.z > 0.6) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * star.z * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = star.alpha * 0.18;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-30 w-full h-full"
      style={{ opacity: 0.88 }}
      aria-hidden="true"
    />
  );
};
