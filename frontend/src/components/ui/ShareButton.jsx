import React, { useState } from 'react';
import { FaShareAlt } from 'react-icons/fa';
import ShareModal from './ShareModal';
import { Toast } from './Toast';

const ShareButton = ({ 
  contentType, 
  contentId, 
  title, 
  description, 
  imageUrl, 
  className = '', 
  iconOnly = false,
  btnText = 'Share'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
  };

  const handleOpen = (e) => {
    e.stopPropagation(); // Prevent card clicks if nested
    setIsOpen(true);
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className={className || `flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all select-none`}
        title={`Share this ${contentType || 'content'}`}
      >
        <FaShareAlt size={11} className="transition-transform duration-300 group-hover:scale-110" />
        {!iconOnly && <span>{btnText}</span>}
      </button>

      {/* Share sheet & social popup modal */}
      <ShareModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        contentType={contentType}
        contentId={contentId}
        title={title}
        description={description}
        imageUrl={imageUrl}
        onShowToast={triggerToast}
      />

      {/* Local Toast notification */}
      {toastMessage && (
        <Toast 
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage('')}
        />
      )}
    </>
  );
};

export default ShareButton;
