import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const MeteorBackground = () => {
  const canvasRef = useRef(null);
  const location = useLocation();
  const { isDark } = useTheme();

  // Disable canvas animation inside Admin CMS to guarantee peak dashboard performance
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let lastTime = performance.now();
    let isPaused = false;
    let isReducedMotion = false;

    // Detect accessibility preference for reduced motion
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      isReducedMotion = mediaQuery.matches;
      const handleMotionChange = (e) => {
        isReducedMotion = e.matches;
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMotionChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleMotionChange);
      }
    } catch {
      // mediaQuery unsupported fallback
    }

    // Responsive sizing
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = () => width < 768;
    const isTablet = () => width >= 768 && width < 1024;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Pause animation when tab is inactive to preserve CPU/GPU battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
      } else {
        isPaused = false;
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Dynamic Starfield & Meteors Pool
    let stars = [];
    let meteors = [];

    const initStars = () => {
      const starCount = isMobile() ? 18 : isTablet() ? 28 : 42;
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.6,
          baseAlpha: Math.random() * 0.35 + 0.15,
          twinkleSpeed: Math.random() * 0.002 + 0.001,
          phase: Math.random() * Math.PI * 2,
          colorType: Math.random() < 0.45 ? 'cyan' : Math.random() < 0.7 ? 'red' : 'white'
        });
      }
    };

    // Meteor Creator with TS Brand Aesthetics
    const createMeteor = (isInitial = false) => {
      const mobile = isMobile();
      
      // Speed in px/second
      const speed = mobile 
        ? Math.random() * 260 + 300 
        : Math.random() * 420 + 420;

      // Diagonal angle: 36° to 45°
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.16;
      
      // Trail length
      const length = mobile 
        ? Math.random() * 60 + 65 
        : Math.random() * 110 + 130;

      // Spawn coordinates
      const startX = isInitial 
        ? Math.random() * width 
        : Math.random() * (width + 300) - 150;
      const startY = isInitial 
        ? Math.random() * (height * 0.7) 
        : Math.random() * -120 - 40;

      // Color selection (TS Cyan #00FFFF, TS Crimson #C2272D, Starlight White #FFFFFF)
      const rand = Math.random();
      let colorType;
      if (rand < 0.52) {
        colorType = 'cyan';
      } else if (rand < 0.82) {
        colorType = 'crimson';
      } else {
        colorType = 'white';
      }

      return {
        x: startX,
        y: startY,
        angle,
        speed,
        length,
        colorType,
        headRadius: mobile ? 1.4 : 2.0,
        glowRadius: mobile ? 6 : 12,
        life: 0,
        maxLife: Math.random() * 2.2 + 2.0,
        alpha: 0
      };
    };

    const maxMeteors = () => (isMobile() ? 3 : isTablet() ? 5 : 7);

    // Initial setup
    initStars();
    const initialCount = isMobile() ? 2 : 4;
    for (let i = 0; i < initialCount; i++) {
      meteors.push(createMeteor(true));
    }

    let spawnTimer = 0;

    // Main Canvas Render Loop
    const render = (currentTime) => {
      animationFrameId = requestAnimationFrame(render);
      if (isPaused) return;

      const deltaMs = Math.min(currentTime - lastTime, 100);
      lastTime = currentTime;
      const dt = deltaMs / 1000;

      ctx.clearRect(0, 0, width, height);

      // Verify active theme
      const currentDark = isDark || document.documentElement.classList.contains('dark') || document.body?.classList.contains('darkmode');

      // ── 1. Draw Atmospheric Ambient Stars ──
      for (let star of stars) {
        star.phase += star.twinkleSpeed * deltaMs;
        const shimmer = Math.sin(star.phase);
        
        let alpha;
        if (currentDark) {
          alpha = Math.max(0.05, star.baseAlpha + shimmer * 0.18);
        } else {
          alpha = Math.max(0.03, (star.baseAlpha * 0.45) + shimmer * 0.08);
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

        if (currentDark) {
          if (star.colorType === 'cyan') {
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
          } else if (star.colorType === 'red') {
            ctx.fillStyle = `rgba(194, 39, 45, ${alpha * 0.85})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          }
        } else {
          if (star.colorType === 'red') {
            ctx.fillStyle = `rgba(194, 39, 45, ${alpha * 0.7})`;
          } else {
            ctx.fillStyle = `rgba(15, 23, 42, ${alpha * 0.45})`;
          }
        }
        ctx.fill();
      }

      // If user prefers reduced motion, skip shooting comets
      if (isReducedMotion) return;

      // ── 2. Spawn Meteors at Timed Intervals ──
      spawnTimer += dt;
      const targetCount = maxMeteors();
      const spawnInterval = isMobile() ? 1.4 : 0.8;

      if (spawnTimer >= spawnInterval && meteors.length < targetCount) {
        meteors.push(createMeteor(false));
        spawnTimer = 0;
      }

      // ── 3. Update & Render Meteors ──
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life += dt;

        // Move head position along trajectory
        const vx = Math.cos(m.angle) * m.speed * dt;
        const vy = Math.sin(m.angle) * m.speed * dt;
        m.x += vx;
        m.y += vy;

        // Fade envelope: smooth fade-in, sustain, gentle fade-out
        const progress = m.life / m.maxLife;
        let fadeAlpha = 1;
        if (progress < 0.15) {
          fadeAlpha = progress / 0.15;
        } else if (progress > 0.75) {
          fadeAlpha = Math.max(0, (1 - progress) / 0.25);
        }

        const maxAlpha = currentDark ? 0.9 : 0.38;
        const currentAlpha = fadeAlpha * maxAlpha;

        // Check if finished or outside viewport
        if (progress >= 1 || m.x > width + 200 || m.y > height + 200) {
          meteors.splice(i, 1);
          continue;
        }

        if (currentAlpha <= 0.01) continue;

        // Trail coordinates
        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        // Color definitions for heads and trails
        let headColor, trailR, trailG, trailB;
        if (currentDark) {
          if (m.colorType === 'cyan') {
            headColor = `rgba(255, 255, 255, ${currentAlpha})`;
            trailR = 0; trailG = 255; trailB = 255;
          } else if (m.colorType === 'crimson') {
            headColor = `rgba(255, 240, 240, ${currentAlpha})`;
            trailR = 194; trailG = 39; trailB = 45;
          } else {
            headColor = `rgba(255, 255, 255, ${currentAlpha})`;
            trailR = 255; trailG = 255; trailB = 255;
          }
        } else {
          // Light mode
          if (m.colorType === 'crimson') {
            headColor = `rgba(194, 39, 45, ${currentAlpha * 0.9})`;
            trailR = 194; trailG = 39; trailB = 45;
          } else if (m.colorType === 'cyan') {
            headColor = `rgba(8, 145, 178, ${currentAlpha * 0.9})`;
            trailR = 8; trailG = 145; trailB = 178;
          } else {
            headColor = `rgba(71, 85, 105, ${currentAlpha * 0.8})`;
            trailR = 71; trailG = 85; trailB = 105;
          }
        }

        // Draw meteor glowing tail (linear gradient)
        const tailGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        tailGrad.addColorStop(0, `rgba(${trailR}, ${trailG}, ${trailB}, 0)`);
        tailGrad.addColorStop(0.65, `rgba(${trailR}, ${trailG}, ${trailB}, ${currentAlpha * 0.35})`);
        tailGrad.addColorStop(1, `rgba(${trailR}, ${trailG}, ${trailB}, ${currentAlpha * 0.85})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = m.headRadius;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw meteor head glow (smooth radial gradient)
        const glowGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.glowRadius);
        glowGrad.addColorStop(0, headColor);
        glowGrad.addColorStop(0.35, `rgba(${trailR}, ${trailG}, ${trailB}, ${currentAlpha * 0.6})`);
        glowGrad.addColorStop(1, `rgba(${trailR}, ${trailG}, ${trailB}, 0)`);

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Draw luminous core nucleus
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.headRadius * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = headColor;
        ctx.fill();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDark, isAdmin]);

  if (isAdmin) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
};

export default MeteorBackground;
