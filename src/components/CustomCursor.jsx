import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const outlineRef = useRef(null);

  useEffect(() => {
    // Only enable custom cursor on devices with fine pointer (mouse/trackpad), not touch screens
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasFinePointer || prefersReducedMotion) return;

    const cursor = cursorRef.current;
    const outline = outlineRef.current;
    if (!cursor || !outline) return;

    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;
    let isHovering = false;
    let isVisible = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursor.style.opacity = '1';
        outline.style.opacity = '1';
      }

      // GPU-accelerated translate3d (0 layout recalculations)
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    };

    const onMouseOver = (e) => {
      const target = e.target.closest('a, button, input, textarea, select, [role="button"], [tabindex="0"]');
      if (target && !isHovering) {
        isHovering = true;
        outline.classList.add('scale-[1.4]', 'border-[#00FFFF]');
      } else if (!target && isHovering) {
        isHovering = false;
        outline.classList.remove('scale-[1.4]', 'border-[#00FFFF]');
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      cursor.style.opacity = '0';
      outline.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    // Smooth GPU outline tracking loop
    let animFrame;
    const followCursor = () => {
      const dx = mouseX - outlineX;
      const dy = mouseY - outlineY;
      outlineX += dx * 0.2;
      outlineY += dy * 0.2;
      outline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
      animFrame = requestAnimationFrame(followCursor);
    };
    animFrame = requestAnimationFrame(followCursor);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor hidden lg:block"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform'
        }}
      />
      <div
        ref={outlineRef}
        className="custom-cursor-outline hidden lg:block"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 9998,
          willChange: 'transform'
        }}
      />
    </>
  );
};

export default CustomCursor;
