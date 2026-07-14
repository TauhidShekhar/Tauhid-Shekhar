import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const outlineRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const outline = outlineRef.current;
    if (!cursor || !outline) return;

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Update inline css custom variables directly on document
      document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);

      // Update cursor position directly on DOM without state re-render
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    };

    // Use event delegation for mouse over state (highly performant, removes mutation observer)
    const onMouseOver = (e) => {
      const target = e.target.closest('a, button, input[type="submit"], [role="button"]');
      if (target) {
        outline.classList.add('scale-[1.4]', 'bg-primary-blue/5', 'border-primary-cyan');
      } else {
        outline.classList.remove('scale-[1.4]', 'bg-primary-blue/5', 'border-primary-cyan');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    // Smooth outline movement loop
    let animFrame;
    const followCursor = () => {
      const dx = mouseX - outlineX;
      const dy = mouseY - outlineY;
      outlineX += dx * 0.15;
      outlineY += dy * 0.15;
      outline.style.left = `${outlineX}px`;
      outline.style.top = `${outlineY}px`;
      animFrame = requestAnimationFrame(followCursor);
    };
    followCursor();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor hidden lg:block"
        style={{ position: 'fixed', pointerEvents: 'none', zIndex: 9999 }}
      />
      <div
        ref={outlineRef}
        className="custom-cursor-outline hidden lg:block"
        style={{ position: 'fixed', pointerEvents: 'none', zIndex: 9998 }}
      />
    </>
  );
};

export default CustomCursor;
