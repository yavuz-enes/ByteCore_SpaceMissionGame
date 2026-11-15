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
    // Disable canvas animation on mobile devices (< 768px) to eliminate any lag or battery drain
    if (window.innerWidth < 768) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas || window.innerWidth < 768) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Efficient star count for desktop 60fps
    const starColors = ['#ffffff', '#bae6fd', '#e0e7ff', '#fde047', '#38bdf8', '#c084fc'];
    const starCount = Math.min(120, Math.max(60, Math.floor((width * height) / 12000)));

    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.2 + Math.random() * 0.8,
      radius: 0.6 + Math.random() * 1.2,
      alpha: 0.2 + Math.random() * 0.8,
      alphaSpeed: 0.005 + Math.random() * 0.015,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    const driftSpeedX = -0.15;
    const driftSpeedY = 0.07;

    const render = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        star.x += driftSpeedX * star.z;
        star.y += driftSpeedY * star.z;

        if (star.x < -10) star.x = width + 10;
        if (star.x > width + 10) star.x = -10;
        if (star.y < -10) star.y = height + 10;
        if (star.y > height + 10) star.y = -10;

        star.alpha += star.alphaSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.25) {
          star.alphaSpeed = -star.alphaSpeed;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * star.z, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.15, Math.min(1, star.alpha));
        ctx.fill();
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
      className="fixed inset-0 pointer-events-none -z-30 w-full h-full hidden md:block"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
};
