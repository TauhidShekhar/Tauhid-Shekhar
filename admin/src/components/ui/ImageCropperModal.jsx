import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { FaSearchPlus, FaSearchMinus, FaUndo, FaSyncAlt, FaCompress, FaCheck, FaTimes, FaArrowsAltH, FaArrowsAltV, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './ImageCropperModal.css';

// Helper to create HTML Image element from URL
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      image.setAttribute('crossOrigin', 'anonymous');
      // Append a cache-buster query parameter to bypass browser caching CORS bug
      image.src = url.includes('?') ? `${url}&_cb=${Date.now()}` : `${url}?_cb=${Date.now()}`;
    } else {
      image.src = url;
    }
  });

// Calculate rotated bounding size
function rotateSize(width, height, rotation) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

// Generate cropped and compressed image file
const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0, flip = { horizontal: false, vertical: false }, qualitySettings = 'medium', fileName = 'cropped.webp') => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  const rotRad = (rotation * Math.PI) / 180;
  const { width: bWidth, height: bHeight } = rotateSize(image.width, image.height, rotation);

  // Set canvas size to match the rotated bounds
  canvas.width = bWidth;
  canvas.height = bHeight;

  ctx.translate(bWidth / 2, bHeight / 2);
  ctx.rotate(rotRad);
  
  // Apply flips if active
  const scaleX = flip.horizontal ? -1 : 1;
  const scaleY = flip.vertical ? -1 : 1;
  ctx.scale(scaleX, scaleY);
  
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // Create crop canvas
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) return null;

  // Safeguard: Clamp crop coordinates to the actual rotated canvas boundaries
  const x = Math.max(0, Math.min(pixelCrop.x, bWidth));
  const y = Math.max(0, Math.min(pixelCrop.y, bHeight));
  const width = Math.max(1, Math.min(pixelCrop.width, bWidth - x));
  const height = Math.max(1, Math.min(pixelCrop.height, bHeight - y));

  // Responsive resizing based on quality setting
  let targetWidth = width;
  let targetHeight = height;

  if (qualitySettings === 'medium') {
    const maxWidth = 1200;
    if (width > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = (height * maxWidth) / width;
    }
  } else if (qualitySettings === 'low') {
    const maxWidth = 800;
    if (width > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = (height * maxWidth) / width;
    }
  }

  croppedCanvas.width = targetWidth;
  croppedCanvas.height = targetHeight;

  croppedCtx.drawImage(
    canvas,
    x,
    y,
    width,
    height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  let compressionRatio = 0.82; // medium
  if (qualitySettings === 'high') compressionRatio = 0.92;
  if (qualitySettings === 'low') compressionRatio = 0.70;

  return new Promise((resolve, reject) => {
    try {
      croppedCanvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], fileName.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(file);
          } else {
            // Fallback to jpeg
            croppedCanvas.toBlob(
              (fallbackBlob) => {
                if (fallbackBlob) {
                  const file = new File([fallbackBlob], fileName.replace(/\.[^/.]+$/, '.jpg'), {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  resolve(file);
                } else {
                  reject(new Error('Canvas toBlob returned null'));
                }
              },
              'image/jpeg',
              compressionRatio
            );
          }
        },
        'image/webp',
        compressionRatio
      );
    } catch (err) {
      // Synchronous catch fallback to jpeg
      try {
        croppedCanvas.toBlob(
          (fallbackBlob) => {
            if (fallbackBlob) {
              const file = new File([fallbackBlob], fileName.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(file);
            } else {
              reject(err);
            }
          },
          'image/jpeg',
          compressionRatio
        );
      } catch (fallbackErr) {
        reject(fallbackErr);
      }
    }
  });
};

const ImageCropperModal = ({ 
  isOpen, 
  file, 
  files, 
  aspectRatio = 1, 
  onClose, 
  onCropComplete, 
  title 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [aspect, setAspect] = useState(aspectRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [quality, setQuality] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Set aspect ratio from props if it changes
  useEffect(() => {
    setAspect(aspectRatio);
  }, [aspectRatio]);

  // Determine current active file
  const activeFile = files && files.length > 0 ? files[currentIndex] : file;

  // Reset active index when files list changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen, files]);

  // Reset crop values on index change
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setCrop({ x: 0, y: 0 });
    setCroppedAreaPixels(null);
  }, [currentIndex]);

  // Convert files / HEIC on mount or when active file changes
  useEffect(() => {
    if (!isOpen || !activeFile) return;

    const processInputFile = async () => {
      setIsProcessing(true);
      setError(null);
      try {
        let fileToProcess = activeFile;
        const fileName = activeFile.name || 'image.jpg';
        const isHEIC = activeFile.type === 'image/heic' || activeFile.type === 'image/heif' || fileName.toLowerCase().endsWith('.heic') || fileName.toLowerCase().endsWith('.heif');
        
        if (isHEIC) {
          // Lazy load HEIC converter to save bundle size
          const heic2anyModule = await import('heic2any');
          const heic2any = heic2anyModule.default;
          
          const convertedBlob = await heic2any({
            blob: activeFile,
            toType: 'image/jpeg',
            quality: 0.88
          });
          const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          fileToProcess = new File([finalBlob], fileName.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg'
          });
        }

        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result);
          setIsProcessing(false);
        };
        reader.readAsDataURL(fileToProcess);
      } catch (err) {
        console.error('File parsing failure:', err);
        setError('Supported files: JPG, PNG, WEBP, HEIC. Verification failed.');
        setIsProcessing(false);
      }
    };

    processInputFile();
  }, [isOpen, activeFile]);

  const onCropChange = useCallback((newCrop) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        flip,
        quality,
        activeFile?.name || 'edited-image.webp'
      );

      // Trigger completion callback
      if (onCropComplete) {
        onCropComplete(croppedFile, files ? currentIndex : undefined);
      }

      // Handle sequence progression
      if (files && currentIndex < files.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Error generating cropped image:', err);
      setError('Could not process canvas. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    if (onCropComplete) {
      onCropComplete(activeFile, files ? currentIndex : undefined);
    }

    if (files && currentIndex < files.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Header display title
  const displayTitle = files && files.length > 0 
    ? `Crop Image ${currentIndex + 1} of ${files.length}` 
    : title || 'Edit Image';

  return createPortal(
    <div className="crop-modal-overlay">
      <div className="crop-modal-card">
        {/* Modal Header */}
        <div className="crop-modal-header">
          <h3 className="crop-modal-title">{displayTitle}</h3>
          <button className="crop-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>

        {/* Modal Content */}
        <div className="crop-modal-body">
          {isProcessing ? (
            <div className="crop-modal-loader-container">
              <div className="crop-modal-spinner"></div>
              <span className="crop-modal-loader-text">Processing Image...</span>
            </div>
          ) : error ? (
            <div className="crop-modal-error-container">
              <p className="crop-modal-error-text">{error}</p>
              <button className="crop-modal-btn crop-modal-btn-secondary" onClick={onClose}>Close</button>
            </div>
          ) : (
            <>
              {/* Cropper Viewport Container */}
              <div className="crop-viewport-container">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  onCropChange={onCropChange}
                  onZoomChange={onZoomChange}
                  onRotationChange={setRotation}
                  onCropComplete={onCropCompleteCallback}
                  showGrid={true}
                  cropShape="rect"
                />
              </div>

              {/* Adjustments Panel */}
              <div className="crop-controls-panel">
                {/* 1. Zoom controls */}
                <div className="crop-control-row">
                  <label className="crop-control-label"><FaSearchMinus className="icon" /> Zoom</label>
                  <div className="crop-slider-wrapper">
                    <button className="crop-step-btn" onClick={() => setZoom(prev => Math.max(1, prev - 0.1))}><FaSearchMinus /></button>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="crop-range-slider"
                    />
                    <button className="crop-step-btn" onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}><FaSearchPlus /></button>
                  </div>
                </div>

                {/* 2. Rotate controls */}
                <div className="crop-control-row">
                  <label className="crop-control-label"><FaUndo className="icon" /> Rotate</label>
                  <div className="crop-slider-wrapper">
                    <button className="crop-step-btn" onClick={() => setRotation(prev => (prev - 90 < 0 ? 270 : prev - 90))}><FaUndo /></button>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="crop-range-slider"
                    />
                    <button className="crop-step-btn" onClick={() => setRotation(prev => (prev + 90 >= 360 ? 0 : prev + 90))}><FaSyncAlt /></button>
                  </div>
                </div>

                {/* 3. Flips and Presets */}
                <div className="crop-options-group">
                  <div className="crop-option-subgroup">
                    <span className="crop-subgroup-title">Flip Image</span>
                    <div className="crop-btn-row">
                      <button 
                        type="button"
                        className={`crop-preset-btn ${flip.horizontal ? 'active' : ''}`}
                        onClick={() => setFlip(prev => ({ ...prev, horizontal: !prev.horizontal }))}
                      >
                        <FaArrowsAltH /> Horizontal
                      </button>
                      <button 
                        type="button"
                        className={`crop-preset-btn ${flip.vertical ? 'active' : ''}`}
                        onClick={() => setFlip(prev => ({ ...prev, vertical: !prev.vertical }))}
                      >
                        <FaArrowsAltV /> Vertical
                      </button>
                    </div>
                  </div>

                  <div className="crop-option-subgroup">
                    <span className="crop-subgroup-title">Aspect Ratio</span>
                    <div className="crop-btn-row">
                      <button type="button" className={`crop-preset-btn ${aspect === 1 ? 'active' : ''}`} onClick={() => setAspect(1)}>1:1</button>
                      <button type="button" className={`crop-preset-btn ${aspect === 16/9 ? 'active' : ''}`} onClick={() => setAspect(16/9)}>16:9</button>
                      <button type="button" className={`crop-preset-btn ${aspect === 4/3 ? 'active' : ''}`} onClick={() => setAspect(4/3)}>4:3</button>
                      <button type="button" className={`crop-preset-btn ${aspect === null ? 'active' : ''}`} onClick={() => setAspect(null)}>Free</button>
                    </div>
                  </div>

                  <div className="crop-option-subgroup">
                    <span className="crop-subgroup-title"><FaCompress /> Quality Selector</span>
                    <div className="crop-btn-row">
                      <button type="button" className={`crop-preset-btn ${quality === 'high' ? 'active' : ''}`} onClick={() => setQuality('high')}>High (WebP)</button>
                      <button type="button" className={`crop-preset-btn ${quality === 'medium' ? 'active' : ''}`} onClick={() => setQuality('medium')}>Medium</button>
                      <button type="button" className={`crop-preset-btn ${quality === 'low' ? 'active' : ''}`} onClick={() => setQuality('low')}>Low</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="crop-modal-footer">
          <div className="crop-footer-left">
            <button 
              type="button"
              className="crop-modal-btn crop-modal-btn-secondary" 
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>

          <div className="crop-footer-right">
            {/* Prev Index Navigation */}
            {files && files.length > 0 && currentIndex > 0 && (
              <button 
                type="button"
                className="crop-modal-btn crop-modal-btn-secondary" 
                onClick={() => setCurrentIndex(prev => prev - 1)}
                disabled={isSaving}
              >
                <FaChevronLeft /> Prev
              </button>
            )}

            <button 
              type="button"
              className="crop-modal-btn crop-modal-btn-secondary" 
              onClick={handleSkip}
              disabled={isProcessing || isSaving}
              title="Use the original image without cropping"
            >
              Skip Crop
            </button>

            {/* Next Index Navigation (Without Cropping) */}
            {files && files.length > 0 && currentIndex < files.length - 1 && (
              <button 
                type="button"
                className="crop-modal-btn crop-modal-btn-secondary" 
                onClick={() => setCurrentIndex(prev => prev + 1)}
                disabled={isSaving}
              >
                Next <FaChevronRight />
              </button>
            )}

            <button 
              type="button"
              className="crop-modal-btn crop-modal-btn-primary" 
              onClick={handleSave}
              disabled={isProcessing || isSaving || error || !croppedAreaPixels}
            >
              {isSaving ? (
                <>
                  <div className="crop-btn-spinner"></div> Saving...
                </>
              ) : (
                <>
                  <FaCheck /> {files && currentIndex < files.length - 1 ? 'Apply & Next' : 'Apply & Finish'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageCropperModal;
