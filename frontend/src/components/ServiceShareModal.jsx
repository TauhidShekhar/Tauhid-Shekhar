import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaCopy, FaCheck, FaShareAlt, FaQrcode, 
  FaWhatsapp, FaLinkedin, FaTwitter, FaTelegram, FaExternalLinkAlt 
} from 'react-icons/fa';

const ServiceShareModal = ({ isOpen, onClose, service }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCopied(false);
      setShowQR(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !service) return null;

  // Resolve absolute URL
  const origin = window.location.origin;
  const serviceSlug = service.slug || service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const serviceUrl = `${origin}/services/${serviceSlug}`;

  const shareTitle = `${service.title} | Tauhid Shekhar`;
  const shareText = `Check out this professional service by Tauhid Shekhar: ${service.title} (${service.price || 'Tailored Engineering'})`;

  const encodedUrl = encodeURIComponent(serviceUrl);
  const encodedText = encodeURIComponent(`${shareText}\n${serviceUrl}`);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(serviceUrl);
      } else {
        const input = document.createElement('input');
        input.value = serviceUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: serviceUrl
        });
        onClose();
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed:', err);
        }
      }
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodedUrl}`;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-800 dark:text-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#C2272D]/10 text-[#C2272D] flex items-center justify-center">
                <FaShareAlt size={15} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold font-title text-slate-900 dark:text-white leading-tight">
                  Share Service
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">
                  Spread the word or invite collaborators
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
              aria-label="Close share dialog"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Service Card Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-4 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2272D]">
                {service.category || 'Engineering'}
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {service.price}
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {service.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {service.shortDescription || service.desc}
            </p>
          </div>

          {/* Copy Link Input Bar */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-left">
              Shareable Direct Link
            </label>
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10">
              <input
                type="text"
                readOnly
                value={serviceUrl}
                className="flex-1 bg-transparent text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none truncate select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#C2272D] hover:bg-[#a51d23] text-white shadow-sm'
                }`}
              >
                {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-left">
              Share Directly To
            </label>
            <div className="grid grid-cols-4 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition cursor-pointer"
                title="Share on WhatsApp"
              >
                <FaWhatsapp size={20} />
                <span className="text-[10px] font-bold">WhatsApp</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition cursor-pointer"
                title="Share on LinkedIn"
              >
                <FaLinkedin size={20} />
                <span className="text-[10px] font-bold">LinkedIn</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-800 dark:text-slate-200 border border-slate-500/20 transition cursor-pointer"
                title="Share on Twitter / X"
              >
                <FaTwitter size={20} />
                <span className="text-[10px] font-bold">X (Twitter)</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 transition cursor-pointer"
                title="Share on Telegram"
              >
                <FaTelegram size={20} />
                <span className="text-[10px] font-bold">Telegram</span>
              </a>
            </div>
          </div>

          {/* Additional Options: QR Code Toggle and Native Share */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setShowQR(prev => !prev)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <FaQrcode size={13} className="text-[#C2272D]" />
              <span>{showQR ? 'Hide QR Code' : 'Scan QR Code'}</span>
            </button>

            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Open native mobile share sheet"
              >
                <FaExternalLinkAlt size={11} />
                <span>Device Share</span>
              </button>
            )}
          </div>

          {/* QR Code Reveal */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 text-center"
            >
              <div className="p-3 bg-white rounded-2xl inline-block shadow-md border border-slate-200">
                <img
                  src={qrUrl}
                  alt={`QR code for ${service.title}`}
                  className="w-40 h-40 mx-auto object-contain"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Point your phone camera to open this service directly
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ServiceShareModal;
