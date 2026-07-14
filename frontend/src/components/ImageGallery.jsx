import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus, FaTimesCircle } from 'react-icons/fa';

export const ImageGallery = ({ images = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState({});

  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images]);

  if (!images || images.length === 0) return null;

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setScale(1);
    setIsOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setScale(1);
    document.body.style.overflow = '';
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setScale(1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setScale(1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1));
  };

  // Double tap to toggle zoom
  const lastTap = useRef(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      setScale(prev => (prev > 1 ? 1 : 2.5));
    }
    lastTap.current = now;
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStart.current - touchEnd.current;
    if (diff > 75) {
      handleNext();
    } else if (diff < -75) {
      handlePrev();
    }
  };

  const handleImageLoad = (index) => {
    setLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index) => {
    setLoading(prev => ({ ...prev, [index]: true }));
  };

  // Layout selection based on image count
  const renderGrid = () => {
    const count = images.length;
    if (count === 1) {
      return (
        <div 
          onClick={() => openLightbox(0)}
          className="relative w-full max-h-[380px] overflow-hidden rounded-2xl cursor-pointer bg-[#181820]/40 border border-white/5 flex items-center justify-center group"
        >
          <img 
            src={images[0]} 
            alt="media" 
            className="w-full h-full object-contain rounded-2xl max-h-[380px] transition-transform duration-500 group-hover:scale-[1.01]" 
            loading="lazy" 
          />
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 w-full h-[220px] rounded-2xl overflow-hidden">
          {images.map((img, idx) => (
            <div key={idx} onClick={() => openLightbox(idx)} className="relative overflow-hidden cursor-pointer bg-[#181820] border border-white/5 flex items-center justify-center group">
              <img src={img} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            </div>
          ))}
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className="grid grid-cols-3 grid-rows-2 gap-2 w-full h-[280px] rounded-2xl overflow-hidden">
          <div onClick={() => openLightbox(0)} className="col-span-2 row-span-2 relative overflow-hidden cursor-pointer bg-[#181820] border border-white/5 flex items-center justify-center group">
            <img src={images[0]} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          </div>
          {images.slice(1, 3).map((img, idx) => (
            <div key={idx + 1} onClick={() => openLightbox(idx + 1)} className="col-span-1 row-span-1 relative overflow-hidden cursor-pointer bg-[#181820] border border-white/5 flex items-center justify-center group">
              <img src={img} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            </div>
          ))}
        </div>
      );
    }

    if (count === 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-[280px] rounded-2xl overflow-hidden">
          {images.slice(0, 4).map((img, idx) => (
            <div key={idx} onClick={() => openLightbox(idx)} className="relative overflow-hidden cursor-pointer bg-[#181820] border border-white/5 flex items-center justify-center group">
              <img src={img} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            </div>
          ))}
        </div>
      );
    }

    // 5 or more images
    return (
      <div className="grid grid-cols-3 grid-rows-2 gap-2 w-full h-[280px] rounded-2xl overflow-hidden">
        <div onClick={() => openLightbox(0)} className="col-span-2 row-span-1 relative overflow-hidden cursor-pointer bg-[#181820] border border-white/5 flex items-center justify-center group">
          <img src={images[0]} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        </div>
        <div onClick={() => openLightbox(1)} className="col-span-1 row-span-1 relative overflow-hidden cursor-pointer bg-[#181820] border border-white/5 flex items-center justify-center group">
          <img src={images[1]} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        </div>
        <div onClick={() => openLightbox(2)} className="col-span-1 row-span-1 relative overflow-hidden cursor-pointer bg-[#181820] border border-white/5 flex items-center justify-center group">
          <img src={images[2]} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        </div>
        <div onClick={() => openLightbox(3)} className="col-span-1 row-span-1 relative overflow-hidden cursor-pointer bg-[#181820] border border-white/5 flex items-center justify-center group">
          <img src={images[3]} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        </div>
        <div onClick={() => openLightbox(4)} className="col-span-1 row-span-1 relative overflow-hidden cursor-pointer bg-[#181820] border border-white/5 flex items-center justify-center group">
          <img src={images[4]} alt="media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-40" loading="lazy" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center font-bold text-white text-lg transition-colors group-hover:bg-black/60">
            +{count - 4}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderGrid()}

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/95 flex flex-col justify-between p-4 select-none touch-none"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          {/* Top Navbar */}
          <div className="flex justify-between items-center w-full text-white z-[100] bg-gradient-to-b from-black/50 to-transparent p-2 rounded-t-xl">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>
            <div className="flex items-center gap-3.5">
              <button 
                onClick={zoomOut} 
                disabled={scale <= 1}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <FaSearchMinus size={14} />
              </button>
              <button 
                onClick={zoomIn} 
                disabled={scale >= 4}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <FaSearchPlus size={14} />
              </button>
              <button 
                onClick={closeLightbox} 
                className="p-2 bg-white/15 hover:bg-red-500 hover:scale-105 text-white rounded-full transition-all cursor-pointer"
                title="Close"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-center relative w-full h-full overflow-hidden">
            {/* Left Button */}
            {currentIndex > 0 && (
              <button 
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-[100] p-3.5 bg-black/45 hover:bg-black/85 text-white rounded-full transition-all border border-white/5 cursor-pointer hidden sm:block"
                title="Previous"
              >
                <FaChevronLeft size={16} />
              </button>
            )}

            {/* Swipe Image Wrapper */}
            <div 
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleDoubleTap}
            >
              {loading[currentIndex] && (
                <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center text-slate-400">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Loading image...</span>
                </div>
              )}
              
              <img 
                src={images[currentIndex]} 
                alt="fullscreen preview"
                className="max-w-full max-h-full object-contain transition-transform duration-255 ease-out select-none"
                style={{ 
                  transform: `scale(${scale})`, 
                  cursor: scale > 1 ? 'zoom-out' : 'zoom-in',
                  pointerEvents: scale > 1 ? 'auto' : 'none'
                }}
                onLoad={() => handleImageLoad(currentIndex)}
                onLoadStart={() => handleImageLoadStart(currentIndex)}
              />
            </div>

            {/* Right Button */}
            {currentIndex < images.length - 1 && (
              <button 
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-[100] p-3.5 bg-black/45 hover:bg-black/85 text-white rounded-full transition-all border border-white/5 cursor-pointer hidden sm:block"
                title="Next"
              >
                <FaChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Bottom Swipe hint for mobile */}
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center p-2 block sm:hidden">
            ← Swipe left/right to browse →
          </div>
        </div>
      )}
    </>
  );
};
