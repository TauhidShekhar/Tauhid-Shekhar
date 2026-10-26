import React, { useState, useEffect } from 'react';
import { 
  FaWhatsapp, FaFacebook, FaTwitter, FaLinkedin, FaTelegram, 
  FaEnvelope, FaSms, FaReddit, FaPinterest, FaDiscord, 
  FaSnapchat, FaLink, FaQrcode, FaShareAlt, FaCopy, 
  FaDownload, FaTimes, FaCheck 
} from 'react-icons/fa';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, contentType, contentId, title, description, imageUrl, onShowToast }) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);

  // Prevent scroll when modal/bottom-sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolve base URL for sharing redirects
  const getShareBaseUrl = () => {
    const port = window.location.port;
    if (port === '5173' || port === '5174') {
      return `http://${window.location.hostname}:5000/api/share`;
    }
    return `https://tauhid-shekhar-portfolio.onrender.com/api/share`;
  };

  const getDirectFrontEndUrl = () => {
    return `${window.location.protocol}//${window.location.host}`;
  };

  // Construct target redirect link
  let shareUrl = '';
  let frontendPath = '';
  if (contentType === 'profile') {
    shareUrl = `${getShareBaseUrl()}/profile/${contentId}`;
    frontendPath = `/community/profile/${contentId}`;
  } else if (contentType === 'post') {
    shareUrl = `${getShareBaseUrl()}/post/${contentId}`;
    frontendPath = `/community?post=${contentId}`;
  } else if (contentType === 'doubt') {
    shareUrl = `${getShareBaseUrl()}/doubt/${contentId}`;
    frontendPath = `/community/doubts?id=${contentId}`;
  } else if (contentType === 'service') {
    shareUrl = `${getDirectFrontEndUrl()}/services/${contentId}`;
    frontendPath = `/services/${contentId}`;
  } else if (contentType === 'form') {
    shareUrl = `${getDirectFrontEndUrl()}/forms/${contentId}`;
    frontendPath = `/forms/${contentId}`;
  } else {
    // Fallback for events, courses, achievements, portfolio, etc.
    shareUrl = `${getDirectFrontEndUrl()}/${contentId || ''}`;
    frontendPath = `/${contentId || ''}`;
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title || 'Check this out!');
  const encodedDescription = encodeURIComponent(description || '');

  // Log sharing activity to database
  const trackShareEvent = async (platform) => {
    try {
      const port = window.location.port;
      const apiBase = (port === '5173' || port === '5174') 
        ? `http://${window.location.hostname}:5000/api` 
        : 'https://tauhid-shekhar-portfolio.onrender.com/api';
        
      await fetch(`${apiBase}/share/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('portfolio_auth_user') ? JSON.parse(localStorage.getItem('portfolio_auth_user')).id : ''}`
        },
        body: JSON.stringify({
          contentType,
          contentId,
          platform
        })
      });
    } catch (err) {
      console.warn('Share analytics tracking failed:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackShareEvent('copy_link');
      if (onShowToast) {
        onShowToast('Link copied successfully!');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyQRLink = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`;
      await navigator.clipboard.writeText(qrUrl);
      setQrCopied(true);
      trackShareEvent('copy_qr_link');
      if (onShowToast) {
        onShowToast('QR Code Link copied successfully!');
      }
      setTimeout(() => setQrCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
        trackShareEvent('native_share');
      } catch (err) {
        console.warn('Native share failed or dismissed:', err);
      }
    } else {
      if (onShowToast) {
        onShowToast('Native sharing not supported in this browser.');
      }
    }
  };

  const downloadQR = async (format = 'png') => {
    try {
      const size = format === 'svg' ? '500x500' : '300x300';
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&format=${format}&data=${encodedUrl}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `share_qrcode_${contentId || 'code'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      trackShareEvent(`download_qr_${format}`);
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  };

  const sharePlatforms = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="whatsapp-color" />,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      id: 'whatsapp'
    },
    {
      name: 'Facebook',
      icon: <FaFacebook className="facebook-color" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      id: 'facebook'
    },
    {
      name: 'Twitter/X',
      icon: <FaTwitter className="twitter-color" />,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      id: 'twitter'
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin className="linkedin-color" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      id: 'linkedin'
    },
    {
      name: 'Telegram',
      icon: <FaTelegram className="telegram-color" />,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      id: 'telegram'
    },
    {
      name: 'Reddit',
      icon: <FaReddit className="reddit-color" />,
      url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      id: 'reddit'
    },
    {
      name: 'Pinterest',
      icon: <FaPinterest className="pinterest-color" />,
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      id: 'pinterest'
    },
    {
      name: 'Discord',
      icon: <FaDiscord className="discord-color" />,
      url: '#',
      onClick: () => {
        navigator.clipboard.writeText(shareUrl);
        if (onShowToast) onShowToast('Link copied! Paste on Discord server');
        trackShareEvent('discord');
      },
      id: 'discord'
    },
    {
      name: 'Snapchat',
      icon: <FaSnapchat className="snapchat-color" />,
      url: `https://www.snapchat.com/share?url=${encodedUrl}`,
      id: 'snapchat'
    },
    {
      name: 'Instagram',
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_of_Instagram.svg" alt="Instagram" className="w-5 h-5 object-contain inline-block" />,
      url: '#',
      onClick: () => {
        navigator.clipboard.writeText(shareUrl);
        if (onShowToast) onShowToast('Link copied! Open Instagram and paste in Stories/Bio');
        trackShareEvent('instagram');
        window.open('https://www.instagram.com', '_blank');
      },
      id: 'instagram'
    },
    {
      name: 'Email',
      icon: <FaEnvelope className="email-color" />,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0D%0A%0D%0A${encodedUrl}`,
      id: 'email'
    },
    {
      name: 'SMS',
      icon: <FaSms className="sms-color" />,
      url: `sms:?&body=${encodedTitle}%20${encodedUrl}`,
      id: 'sms'
    }
  ];

  return (
    <div className="share-backdrop" onClick={onClose}>
      <div className="share-sheet-container" onClick={(e) => e.stopPropagation()}>
        {/* Header with drag indicator for mobile */}
        <div className="share-sheet-header">
          <div className="drag-indicator"></div>
          <div className="flex justify-between items-center w-full px-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FaShareAlt className="text-primary-blue text-sm" />
              {showQR ? 'Scan QR Code' : 'Share Content'}
            </h3>
            <button className="close-btn" onClick={onClose} aria-label="Close Share Modal">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="share-sheet-content">
          {!showQR ? (
            <>
              {/* Preview Card */}
              <div className="share-preview-card">
                <div className="share-preview-img-container">
                  <img 
                    src={imageUrl || 'https://res.cloudinary.com/dbxud9i8l/image/upload/v1680000000/default_share.png'} 
                    alt="Thumbnail preview"
                    className="share-preview-img"
                    onError={(e) => { e.target.src = 'https://res.cloudinary.com/dbxud9i8l/image/upload/v1680000000/default_share.png'; }}
                  />
                </div>
                <div className="share-preview-details">
                  <div className="share-preview-title">{title || 'Public Link Preview'}</div>
                  <div className="share-preview-desc">{description || 'Click the links below to share with your friends or copy directly.'}</div>
                  <div className="share-preview-url">{shareUrl}</div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="share-actions-row">
                <button className="share-action-btn flex-1" onClick={handleCopyLink}>
                  {copied ? <FaCheck className="text-green-500 mr-2" /> : <FaLink className="text-primary-blue mr-2" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button className="share-action-btn" onClick={() => setShowQR(true)} title="Generate QR Code">
                  <FaQrcode className="text-primary-purple mr-2" />
                  QR Code
                </button>
                {navigator.share && (
                  <button className="share-action-btn" onClick={handleNativeShare} title="Native Device Share">
                    <FaShareAlt className="text-primary-cyan mr-2" />
                    Device Share
                  </button>
                )}
              </div>

              {/* Grid of Social Channels */}
              <div className="social-grid-title">Share via Social Media</div>
              <div className="social-grid">
                {sharePlatforms.map((platform) => (
                  <a 
                    key={platform.id}
                    href={platform.url}
                    onClick={(e) => {
                      if (platform.onClick) {
                        e.preventDefault();
                        platform.onClick();
                      } else {
                        trackShareEvent(platform.id);
                      }
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-grid-item"
                  >
                    <div className="social-icon-wrapper">
                      {platform.icon}
                    </div>
                    <span className="social-icon-label">{platform.name}</span>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div className="qr-container">
              {/* QR Image */}
              <div className="qr-box">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedUrl}`}
                  alt="Sharing QR Code"
                  className="qr-img"
                />
              </div>
              <div className="qr-caption">Scan this code with a mobile camera to visit this link.</div>
              
              {/* QR Actions */}
              <div className="qr-actions-grid">
                <button className="qr-action-btn" onClick={() => downloadQR('png')}>
                  <FaDownload className="mr-2" />
                  Download PNG
                </button>
                <button className="qr-action-btn" onClick={() => downloadQR('svg')}>
                  <FaDownload className="mr-2" />
                  Download SVG
                </button>
                <button className="qr-action-btn" onClick={handleCopyQRLink}>
                  {qrCopied ? <FaCheck className="text-green-500 mr-2" /> : <FaLink className="mr-2" />}
                  {qrCopied ? 'Copied QR!' : 'Copy QR Link'}
                </button>
                <button className="qr-action-btn" onClick={() => setShowQR(false)}>
                  <FaShareAlt className="mr-2" />
                  Back to Social
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
