import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import socket from '../services/socket';
import ImageCropperModal from './ui/ImageCropperModal';
import ShareButton from './ui/ShareButton';

import { 
  FaRegHeart, FaHeart, FaComment, FaBookmark, FaRegBookmark, 
  FaShareAlt, FaPlus, FaImage, FaPaperclip, FaTags, FaFilter, 
  FaRegSmile, FaCheckCircle, FaThumbtack, FaTrash, FaPlusCircle,
  FaFilePdf, FaVideo, FaPoll, FaRegComments, FaGlobe, FaChevronRight, FaGithub, FaPaperPlane, FaEdit, FaUser, FaTimes, FaCrop
} from 'react-icons/fa';
import { ImageGallery } from './ImageGallery';

const CommunityFeed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchUrlQuery = searchParams.get('search') || '';
  
  // Feed states
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchUrlQuery);
  const [activeTagsFilter, setActiveTagsFilter] = useState('');
  
  // Post Creator states
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [mediaType, setMediaType] = useState('none');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // Array of { id, file, previewUrl, remoteUrl, uploading, progress }

  // Sequential Image Cropping States
  const [cropQueue, setCropQueue] = useState([]);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropCallback, setCropCallback] = useState(null);

  // Post Draft States & Effects
  useEffect(() => {
    try {
      const saved = localStorage.getItem('portfolio_post_draft');
      if (saved) setContent(saved);
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('portfolio_post_draft', content);
    } catch (_) {}
  }, [content]);

  // Poll Creator States
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  // Comment states
  const [commentInputs, setCommentInputs] = useState({}); // { postId: text }
  const [comments, setComments] = useState({}); // { postId: [comment] }
  const [showComments, setShowComments] = useState({}); // { postId: Boolean }

  // Reply states
  const [replyInputs, setReplyInputs] = useState({}); // { commentId: text }
  const [activeReplyBox, setActiveReplyBox] = useState(null); // commentId

  // Editing states
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostImages, setEditPostImages] = useState([]); // Array of strings or objects { id, url, previewUrl, uploading }
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  const categories = ['All', 'General', 'Tutorials', 'Project Showcase', 'Questions', 'Announcements'];

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery || searchUrlQuery) params.search = searchQuery || searchUrlQuery;
      if (activeTagsFilter) params.tag = activeTagsFilter;
      
      const res = await api.getCommunityPosts(params);
      if (res.success) {
        setPosts(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeCategory, activeTagsFilter, searchUrlQuery]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post') || params.get('id');
    if (postId && posts.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`post-${postId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('pulse-highlight');
          setTimeout(() => {
            element.classList.remove('pulse-highlight');
          }, 3000);
          toggleComments(postId);
        }
      }, 500);
    }
  }, [posts]);


  // Real-time socket event synchronization for community feed
  useEffect(() => {
    socket.on('post_change', (data) => {
      if (data.action === 'create') {
        setPosts(prev => {
          if (prev.some(p => p._id === data.data._id)) return prev;
          // Prepend new posts matching the selected category
          if (activeCategory !== 'All' && data.data.category !== activeCategory) return prev;
          return [data.data, ...prev];
        });
      } else if (data.action === 'update') {
        setPosts(prev => prev.map(p => p._id === data.data._id ? data.data : p));
      } else if (data.action === 'delete') {
        setPosts(prev => prev.filter(p => p._id !== data.postId));
      } else if (data.action === 'react') {
        setPosts(prev => prev.map(p => {
          if (p._id === data.postId) {
            return { ...p, reactions: data.reactions };
          }
          return p;
        }));
      }
    });

    return () => {
      socket.off('post_change');
    };
  }, [activeCategory]);

  const [attachedFileName, setAttachedFileName] = useState('');

  const validateImage = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase()) && 
        !file.name.toLowerCase().endsWith('.jpg') && 
        !file.name.toLowerCase().endsWith('.jpeg') && 
        !file.name.toLowerCase().endsWith('.png') && 
        !file.name.toLowerCase().endsWith('.webp')) {
      return 'Supported formats: JPG, JPEG, PNG, WebP';
    }
    const maxBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxBytes) {
      return 'File size exceeds the 10MB limit.';
    }
    return null;
  };

  const handleMediaUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Single video or pdf check
    if (files.length === 1 && (files[0].type.startsWith('video/') || files[0].type === 'application/pdf' || files[0].name.endsWith('.pdf'))) {
      const file = files[0];
      setSelectedImages([]); // Clear images if any
      if (file.type.startsWith('video/')) {
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.src = URL.createObjectURL(file);
        videoElement.onloadedmetadata = async () => {
          URL.revokeObjectURL(videoElement.src);
          if (videoElement.duration > 60) {
            alert('Video duration must be under 1 minute.');
            e.target.value = '';
            return;
          }
          await proceedWithUpload(file);
        };
        return;
      }
      await proceedWithUpload(file);
      return;
    }

    // Multiple image upload
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/') || f.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/));
    if (imageFiles.length === 0) {
      alert('Only images (JPG, JPEG, PNG, WebP, HEIC), videos, or PDFs are supported.');
      return;
    }

    // Validate images
    const validImages = [];
    for (const f of imageFiles) {
      const error = validateImage(f);
      if (error) {
        alert(`${f.name}: ${error}`);
        return;
      }
      validImages.push(f);
    }

    // Track starting offset index in selectedImages before adding new files
    const startIdx = selectedImages.length;

    const newItems = validImages.map(file => ({
      id: 'img-' + Date.now() + '-' + Math.round(Math.random() * 1e5),
      file,
      previewUrl: URL.createObjectURL(file),
      remoteUrl: '',
      publicId: '',
      uploading: false,
      progress: 0,
      error: null
    }));

    setSelectedImages(prev => [...prev, ...newItems]);

    // Setup crop modal for the selected files list
    setCropQueue(validImages);
    setCropCallback(() => (croppedFile, cropIndex) => {
      setSelectedImages(prev => {
        const updated = [...prev];
        const targetIdx = startIdx + cropIndex;
        if (updated[targetIdx]) {
          updated[targetIdx].file = croppedFile;
          updated[targetIdx].previewUrl = URL.createObjectURL(croppedFile);
        }
        return updated;
      });
    });
    setCropModalOpen(true);
    e.target.value = ''; // Reset input
  };

  const handleRecropImage = (img) => {
    setCropQueue([img.file]);
    setCropCallback(() => (croppedFile) => {
      setSelectedImages(prev => prev.map(item => 
        item.id === img.id 
          ? { ...item, file: croppedFile, previewUrl: URL.createObjectURL(croppedFile), remoteUrl: '', progress: 0 }
          : item
      ));
    });
    setCropModalOpen(true);
  };

  const uploadSingleFeedImage = async (item) => {
    try {
      const formData = new FormData();
      formData.append('image', item.file);

      // Upload progress simulator
      const timer = setInterval(() => {
        setSelectedImages(prev => prev.map(img => 
          img.id === item.id 
            ? { ...img, progress: Math.min(img.progress + 15, 90) } 
            : img
        ));
      }, 150);

      const res = await api.uploadCommunityImage(formData);
      clearInterval(timer);

      if (res.success) {
        setSelectedImages(prev => prev.map(img => 
          img.id === item.id 
            ? { ...img, remoteUrl: res.url, publicId: res.publicId, uploading: false, progress: 100 } 
            : img
        ));
        return res.url;
      } else {
        setSelectedImages(prev => prev.map(img => 
          img.id === item.id 
            ? { ...img, uploading: false, error: 'Failed' } 
            : img
        ));
        throw new Error(`Failed to upload ${item.file.name}`);
      }
    } catch (err) {
      setSelectedImages(prev => prev.map(img => 
        img.id === item.id 
          ? { ...img, uploading: false, error: err.message } 
          : img
      ));
      throw err;
    }
  };

  const proceedWithUpload = async (file) => {
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setAttachedFileName(file.name);
    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setMediaType('pdf');
    } else {
      setMediaType('image');
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadCommunityImage(formData);
      if (res.success) {
        setMediaUrl(res.url);
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddEditPostImage = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const allowed = Array.from(files).filter(f => f.type.startsWith('image/') || f.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/));
    
    for (const file of allowed) {
      const error = validateImage(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        return;
      }
    }

    setCropQueue(allowed);
    setCropCallback(() => handleEditImageCropped);
    setCropModalOpen(true);
    e.target.value = '';
  };

  const handleEditImageCropped = (croppedFile) => {
    const tempId = 'edit-img-' + Date.now() + '-' + Math.round(Math.random() * 1e5);
    setEditPostImages(prev => [...prev, { id: tempId, url: '', previewUrl: URL.createObjectURL(croppedFile), uploading: true }]);
    uploadSingleEditImage(croppedFile, tempId);
  };

  const uploadSingleEditImage = async (file, tempId) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.uploadCommunityImage(formData);
      if (res.success) {
        setEditPostImages(prev => prev.map(img => 
          img.id === tempId ? res.url : img
        ));
      } else {
        setEditPostImages(prev => prev.filter(img => img.id !== tempId));
        alert('Upload failed.');
      }
    } catch (err) {
      setEditPostImages(prev => prev.filter(img => img.id !== tempId));
      alert('Upload failed: ' + err.message);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Check if we need to upload any cropped images first
    const imagesToUpload = selectedImages.filter(img => !img.remoteUrl);

    let finalUrls = selectedImages.map(img => img.remoteUrl).filter(Boolean);
    const newlyUploadedPublicIds = [];

    if (imagesToUpload.length > 0) {
      setUploading(true);
      try {
        // Set all target images to uploading state
        setSelectedImages(prev => prev.map(img => 
          !img.remoteUrl ? { ...img, uploading: true, error: null, progress: 10 } : img
        ));

        // Upload concurrently
        const uploadPromises = imagesToUpload.map(async (item) => {
          const formData = new FormData();
          formData.append('image', item.file);

          const progressTimer = setInterval(() => {
            setSelectedImages(prev => prev.map(img => 
              img.id === item.id 
                ? { ...img, progress: Math.min(img.progress + 15, 90) } 
                : img
            ));
          }, 150);

          try {
            const res = await api.uploadCommunityImage(formData);
            clearInterval(progressTimer);
            if (res.success) {
              setSelectedImages(prev => prev.map(img => 
                img.id === item.id 
                  ? { ...img, remoteUrl: res.url, publicId: res.publicId, uploading: false, progress: 100 } 
                  : img
              ));
              newlyUploadedPublicIds.push(res.publicId);
              return res.url;
            } else {
              throw new Error(`Failed to upload ${item.file.name}`);
            }
          } catch (err) {
            clearInterval(progressTimer);
            setSelectedImages(prev => prev.map(img => 
              img.id === item.id 
                ? { ...img, uploading: false, error: err.message || 'Upload failed' } 
                : img
            ));
            throw err;
          }
        });

        const newUrls = await Promise.all(uploadPromises);
        finalUrls = [...finalUrls, ...newUrls.filter(Boolean)];
      } catch (err) {
        alert('Some uploads failed. Please retry only the failed ones or remove them.');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const generatedTitle = content.split('\n')[0].substring(0, 80) + '...';

    const pollData = showPollCreator && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2
      ? {
          question: pollQuestion.trim(),
          options: pollOptions.filter(o => o.trim()).map(optText => ({ optionText: optText, votes: [] }))
        }
      : null;

    const finalMediaUrl = finalUrls.length > 0 ? finalUrls[0] : (localPreviewUrl || mediaUrl);
    const finalMediaType = finalUrls.length > 0 ? 'image' : mediaType;

    const tempId = 'temp-post-' + Date.now();
    const tempPost = {
      _id: tempId,
      title: generatedTitle,
      content,
      mediaUrl: finalMediaUrl,
      mediaUrls: finalUrls,
      mediaType: finalMediaType,
      category,
      tags: tagsArray,
      postType: pollData ? 'poll' : (finalMediaType !== 'none' ? finalMediaType : 'text'),
      poll: pollData ? {
        question: pollData.question,
        options: pollData.options.map((o, idx) => ({ _id: `temp-opt-${idx}`, optionText: o.optionText, votes: [] }))
      } : null,
      author: {
        _id: user.id || user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar
      },
      createdAt: new Date().toISOString(),
      reactions: [],
      commentsCount: 0,
      bookmarks: []
    };

    const backupContent = content;
    const backupTags = tags;
    const backupMediaUrl = mediaUrl;
    const backupLocalUrl = localPreviewUrl;
    const backupMediaType = mediaType;
    const backupShowPoll = showPollCreator;
    const backupPollQ = pollQuestion;
    const backupPollOpts = pollOptions;
    const backupSelectedImages = selectedImages;

    // Optimistically insert tempPost and clear inputs
    setPosts(prev => [tempPost, ...prev]);
    setContent('');
    setMediaUrl('');
    setLocalPreviewUrl('');
    setMediaType('none');
    setTags('');
    setShowPollCreator(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setSelectedImages([]);

    try {
      localStorage.removeItem('portfolio_post_draft');
    } catch (_) {}

    try {
      const res = await api.createCommunityPost({
        title: generatedTitle,
        content: backupContent,
        mediaUrl: backupMediaUrl || (finalUrls.length > 0 ? finalUrls[0] : ''),
        mediaUrls: finalUrls,
        mediaType: finalMediaType,
        category,
        tags: tagsArray,
        postType: tempPost.postType,
        poll: pollData
      });

      if (res.success) {
        // Swap temp post with actual response
        setPosts(prev => prev.map(p => p._id === tempId ? res.data : p));
      } else {
        throw new Error('Server returned failure code');
      }
    } catch (err) {
      console.warn('Post creation failed, executing Cloudinary file cleanup:', err);
      // Clean up uploaded files automatically if post creation fails
      if (newlyUploadedPublicIds.length > 0) {
        newlyUploadedPublicIds.forEach(async (pubId) => {
          try {
            await api.deleteCommunityImage(pubId);
          } catch (delErr) {
            console.error('Failed to clean up image with publicId:', pubId, delErr);
          }
        });
      }

      // Revert
      setPosts(prev => prev.filter(p => p._id !== tempId));
      setContent(backupContent);
      setTags(backupTags);
      setMediaUrl(backupMediaUrl);
      setLocalPreviewUrl(backupLocalUrl);
      setMediaType(backupMediaType);
      setShowPollCreator(backupShowPoll);
      setPollQuestion(backupPollQ);
      setPollOptions(backupPollOpts);
      setSelectedImages(backupSelectedImages);
      alert('Post creation failed. Cloudinary files cleaned up. Error: ' + err.message);
    }
  };

  const handleVotePoll = async (postId, optionId) => {
    if (!user) {
      alert('Please log in to vote on polls.');
      return;
    }
    try {
      const res = await api.votePollOption(postId, optionId);
      if (res.success) {
        setPosts(prev => prev.map(p => p._id === postId ? res.data : p));
      }
    } catch (err) {
      alert('Voting failed: ' + err.message);
    }
  };

  const handleReaction = async (postId, type) => {
    if (!user) {
      alert('Please log in to react to posts.');
      return;
    }
    const currentUserId = user?.id || user?._id;
    let originalPosts;
    setPosts(prev => {
      originalPosts = prev;
      return prev.map(p => {
        if (p._id === postId) {
          const list = p.reactions || [];
          const exists = list.some(r => (r.user?._id || r.user || '').toString() === currentUserId.toString());
          let newReactions;
          if (exists) {
            newReactions = list.filter(r => (r.user?._id || r.user || '').toString() !== currentUserId.toString());
          } else {
            newReactions = [...list, { user: { _id: currentUserId, fullName: user.fullName, username: user.username, avatar: user.avatar }, type }];
          }
          return { ...p, reactions: newReactions };
        }
        return p;
      });
    });

    try {
      const res = await api.reactToCommunityPost(postId, type);
      if (res.success) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, reactions: res.data } : p));
      } else {
        if (originalPosts) setPosts(originalPosts);
      }
    } catch (err) {
      console.error(err);
      if (originalPosts) setPosts(originalPosts);
    }
  };

  const handleBookmark = async (postId) => {
    if (!user) {
      alert('Please log in to bookmark posts.');
      return;
    }
    const currentUserId = user?.id || user?._id;
    let originalPosts;
    setPosts(prev => {
      originalPosts = prev;
      return prev.map(p => {
        if (p._id === postId) {
          const list = p.bookmarks || [];
          const exists = list.indexOf(currentUserId);
          let newBookmarks;
          if (exists === -1) {
            newBookmarks = [...list, currentUserId];
          } else {
            newBookmarks = list.filter(id => id !== currentUserId);
          }
          return { ...p, bookmarks: newBookmarks };
        }
        return p;
      });
    });

    try {
      const res = await api.bookmarkCommunityPost(postId);
      if (!res.success) {
        if (originalPosts) setPosts(originalPosts);
      }
    } catch (err) {
      console.error(err);
      if (originalPosts) setPosts(originalPosts);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      const res = await api.deleteCommunityPost(postId);
      if (res.success) {
        setPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Comments handlers
  const toggleComments = async (postId) => {
    const nextState = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: nextState }));
    
    if (nextState && !comments[postId]) {
      try {
        const res = await api.getCommunityComments(postId);
        if (res.success) {
          setComments(prev => ({ ...prev, [postId]: res.data || [] }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to comment.');
      return;
    }
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const tempId = 'temp-' + Date.now();
    const tempComment = {
      _id: tempId,
      content: text.trim(),
      author: {
        _id: user.id || user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar
      },
      createdAt: new Date().toISOString(),
      replies: []
    };

    let originalComments;
    setComments(prev => {
      originalComments = prev;
      return {
        ...prev,
        [postId]: [...(prev[postId] || []), tempComment]
      };
    });
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      const res = await api.addCommunityComment(postId, text.trim());
      if (res.success) {
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).map(c => c._id === tempId ? res.data : c)
        }));
      } else {
        if (originalComments) setComments(originalComments);
        setCommentInputs(prev => ({ ...prev, [postId]: text }));
      }
    } catch (err) {
      console.error(err);
      if (originalComments) setComments(originalComments);
      setCommentInputs(prev => ({ ...prev, [postId]: text }));
    }
  };

  const handleAddReply = async (e, postId, parentCommentId) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to reply.');
      return;
    }
    const text = replyInputs[parentCommentId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.addCommunityComment(postId, text.trim(), parentCommentId);
      if (res.success) {
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data]
        }));
        setReplyInputs(prev => ({ ...prev, [parentCommentId]: '' }));
        setActiveReplyBox(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await api.deleteCommunityComment(commentId);
      if (res.success) {
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(c => c._id !== commentId)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePost = async (postId) => {
    if (!editPostContent.trim()) return;
    if (editPostImages.some(img => typeof img !== 'string' && img.uploading)) {
      alert('Please wait for all images to finish uploading.');
      return;
    }
    try {
      const finalUrls = editPostImages.map(img => typeof img === 'string' ? img : img.url).filter(Boolean);
      const updatedMediaType = finalUrls.length > 0 ? 'image' : 'none';
      const updatedMediaUrl = finalUrls.length > 0 ? finalUrls[0] : '';

      const res = await api.updateCommunityPost(postId, { 
        content: editPostContent,
        mediaUrls: finalUrls,
        mediaUrl: updatedMediaUrl,
        mediaType: updatedMediaType
      });
      if (res.success) {
        setPosts(prev => prev.map(p => p._id === postId ? { 
          ...p, 
          content: editPostContent,
          mediaUrls: finalUrls,
          mediaUrl: updatedMediaUrl,
          mediaType: updatedMediaType
        } : p));
        setEditingPostId(null);
        setEditPostContent('');
        setEditPostImages([]);
      }
    } catch (err) {
      alert('Failed to update post: ' + err.message);
    }
  };

  const handleUpdateComment = async (postId, commentId) => {
    if (!editCommentContent.trim()) return;
    try {
      const res = await api.updateCommunityComment(commentId, editCommentContent);
      if (res.success) {
        setComments(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).map(c => c._id === commentId ? { ...c, content: editCommentContent } : c)
        }));
        setEditingCommentId(null);
        setEditCommentContent('');
      }
    } catch (err) {
      alert('Failed to update comment: ' + err.message);
    }
  };

  // Helper to format timestamps
  const getRelativeTime = (dateStr) => {
    const elapsed = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(elapsed / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (mins < 60) return `${Math.max(1, mins)}m`;
    if (hrs < 24) return `${hrs}h`;
    return `${days}d`;
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      
      {/* Compact Community Introduction (Clean, No Fake Numbers) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141414] via-[#111111] to-[#161616] border border-[#C2272D]/25 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="z-10 text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#C2272D] text-white">
              DevCommunity
            </span>
            <span className="text-[10px] text-[#00FFFF] font-bold font-mono">
              Tauhid Shekhar Ecosystem
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white font-title tracking-tight leading-snug">
            Build Projects, Learn & Collaborate
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-lg font-medium leading-relaxed">
            Connect with full-stack engineers, ask questions, share technical resources, and showcase projects.
          </p>
        </div>

        {user ? (
          <div className="z-10 flex items-center gap-3 shrink-0 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl">
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Your Status</span>
              <span className="text-xs font-black text-[#00FFFF] flex items-center gap-1 font-mono">
                {user.xp || 0} XP &bull; Level {user.level || Math.floor((user.xp || 0) / 100) + 1}
              </span>
            </div>
          </div>
        ) : (
          <Link
            to="/login"
            className="z-10 px-4 py-2 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs font-black tracking-wider transition-colors shadow-sm shrink-0"
          >
            Join Community
          </Link>
        )}
      </div>

      {/* Search & Category Filter Header */}
      <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 p-3 sm:p-3.5 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-0.5">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`whitespace-nowrap flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === c 
                  ? 'bg-[#C2272D] text-white shadow-sm shadow-[#C2272D]/20' 
                  : 'bg-[#F8FAFC] dark:bg-[#1C1C24] text-[#525252] dark:text-slate-300 hover:text-[#C2272D] dark:hover:text-white border border-[#E5E7EB] dark:border-white/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        
        {searchUrlQuery && (
          <button 
            onClick={() => navigate('/community')}
            className="text-[10px] font-black uppercase text-[#C2272D] hover:underline shrink-0 cursor-pointer"
          >
            Clear Search Filter
          </button>
        )}
      </div>

      {/* Guest Prompt to Sign In if not logged in */}
      {!user && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="text-left">
            <h4 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-white">Have a question or something to share?</h4>
            <p className="text-[11px] text-[#525252] dark:text-slate-400 mt-0.5">Sign in to publish posts, participate in discussions, and vote on polls.</p>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs font-black shrink-0 transition-colors shadow-sm"
          >
            Sign In to Post
          </Link>
        </div>
      )}

      {/* Create Post Card */}
      {user && (
        <div className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-sm">
          <div className="flex gap-3">
             <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F8FAFC] dark:bg-[#1c1c24] border border-[#E5E7EB] dark:border-white/10 shrink-0 flex items-center justify-center">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <FaUser className="text-[#525252] dark:text-slate-400" size={14} />
              )}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your coding projects, technical questions, or tips with the community..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#1e1e24] border border-[#E5E7EB] dark:border-white/10 text-xs text-[#171717] dark:text-white placeholder-[#737373] dark:placeholder-slate-400 focus:outline-none focus:border-[#C2272D] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Media Attach Preview */}
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-2.5 bg-[#F8FAFC] dark:bg-[#181820]/40 border border-[#E5E7EB] dark:border-white/5 rounded-2xl">
              {selectedImages.map((img, idx) => (
                <div 
                  key={img.id} 
                  className={`relative aspect-square rounded-xl overflow-hidden bg-[#F8FAFC] dark:bg-[#181820] border ${
                    img.error ? 'border-red-500' : img.remoteUrl ? 'border-emerald-500/50' : 'border-[#E5E7EB] dark:border-white/5'
                  } group`}
                >
                  <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImages(prev => prev.filter(item => item.id !== img.id));
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-red-600 text-white rounded-full text-[10px] cursor-pointer transition-colors z-10"
                    title="Remove Image"
                  >
                    <FaTimes size={8} />
                  </button>

                  {/* Recrop button - Overlay on hover */}
                  <button
                    type="button"
                    onClick={() => handleRecropImage(img, idx)}
                    className="absolute top-1.5 left-1.5 p-1 bg-black/75 hover:bg-cyan-500 text-white rounded-full text-[10px] cursor-pointer transition-colors z-10 opacity-0 group-hover:opacity-100"
                    title="Recrop Image"
                  >
                    <FaCrop size={8} />
                  </button>

                  <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 py-0.5 z-10">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImages(prev => {
                            const copy = [...prev];
                            const temp = copy[idx];
                            copy[idx] = copy[idx - 1];
                            copy[idx - 1] = temp;
                            return copy;
                          });
                        }}
                        className="text-white hover:text-[#00FFFF] p-0.5 cursor-pointer text-[10px]"
                        title="Move Left"
                      >
                        ←
                      </button>
                    )}
                    {idx < selectedImages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImages(prev => {
                            const copy = [...prev];
                            const temp = copy[idx];
                            copy[idx] = copy[idx + 1];
                            copy[idx + 1] = temp;
                            return copy;
                          });
                        }}
                        className="text-white hover:text-[#00FFFF] p-0.5 cursor-pointer text-[10px]"
                        title="Move Right"
                      >
                        →
                      </button>
                    )}
                  </div>

                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col gap-1 z-20">
                      <div className="w-5 h-5 rounded-full border border-[#C2272D]/20 border-t-[#C2272D] animate-spin" />
                      <span className="text-[8px] font-black text-white">{img.progress}%</span>
                    </div>
                  )}

                  {img.error && (
                    <div className="absolute inset-0 bg-black/85 flex items-center justify-center flex-col gap-1 p-1 z-20 text-center">
                      <span className="text-[7px] text-red-500 font-bold">Failed</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedImages(prev => prev.map(item => 
                            item.id === img.id ? { ...item, uploading: true, error: null, progress: 10 } : item
                          ));
                          uploadSingleFeedImage(img);
                        }}
                        className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[8px] font-bold mt-1 cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {img.remoteUrl && !img.uploading && (
                    <div className="absolute top-1.5 right-1.5 p-0.5 bg-emerald-500 text-white rounded-full text-[6px] z-10 pointer-events-none">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(localPreviewUrl || mediaUrl) && (
            <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] dark:border-white/5 bg-[#F8FAFC] dark:bg-[#181820] max-h-[300px]">
              <button
                type="button"
                onClick={() => { setMediaUrl(''); setLocalPreviewUrl(''); setMediaType('none'); setAttachedFileName(''); }}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg text-xs z-10"
              >
                ×
              </button>
              {mediaType === 'image' && <img src={localPreviewUrl || mediaUrl} alt="Preview" className="w-full h-full object-contain" loading="lazy" />}
              {mediaType === 'video' && <video src={localPreviewUrl || mediaUrl} controls className="w-full h-full max-h-[300px]" />}
              {mediaType === 'pdf' && (
                <div className="p-4 flex items-center gap-3 text-xs">
                  <FaFilePdf size={20} className="text-[#C2272D]" />
                  <span className="font-bold text-[#171717] dark:text-white">{attachedFileName || 'Attachment.pdf'}</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#C2272D]/20 border-t-[#C2272D] animate-spin" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Uploading...</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col xs:flex-row justify-between xs:items-center gap-3 border-t border-[#E5E7EB] dark:border-white/5 pt-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <label className="p-2 bg-[#F8FAFC] dark:bg-[#1c1c24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#171717] dark:text-slate-300 hover:text-[#C2272D] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-[#E5E7EB] dark:border-white/5 shrink-0">
                <FaImage size={12} className="text-[#C2272D]" /> Image
                <input type="file" accept="image/*" multiple onChange={handleMediaUpload} className="hidden" />
              </label>
              <label className="p-2 bg-[#F8FAFC] dark:bg-[#1c1c24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#171717] dark:text-slate-300 hover:text-[#C2272D] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-[#E5E7EB] dark:border-white/5 shrink-0">
                <FaVideo size={12} className="text-[#C2272D]" /> Video
                <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
              </label>
              <label className="p-2 bg-[#F8FAFC] dark:bg-[#1c1c24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#171717] dark:text-slate-300 hover:text-[#C2272D] rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border border-[#E5E7EB] dark:border-white/5 shrink-0">
                <FaFilePdf size={12} className="text-[#C2272D]" /> PDF
                <input type="file" accept="application/pdf" onChange={handleMediaUpload} className="hidden" />
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowPollCreator(prev => !prev);
                  if (!showPollCreator) {
                    setPollQuestion('');
                    setPollOptions(['', '']);
                  }
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border ${
                  showPollCreator
                    ? 'bg-[#C2272D] text-white border-[#C2272D] shadow-sm'
                    : 'bg-[#F8FAFC] dark:bg-[#1c1c24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#171717] dark:text-slate-300 border-[#E5E7EB] dark:border-white/5'
                }`}
              >
                <FaPoll size={12} /> Poll
              </button>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-2.5 py-2 bg-[#F8FAFC] dark:bg-[#1c1c24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#171717] dark:text-slate-300 border border-[#E5E7EB] dark:border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-[#C2272D] cursor-pointer shrink-0"
              >
                <option value="General">General</option>
                <option value="Tutorials">Tutorials</option>
                <option value="Project Showcase">Showcase</option>
                <option value="Questions">Q&A</option>
                <option value="Announcements">Announcements</option>
              </select>
            </div>

            <button
              onClick={handlePostSubmit}
              disabled={!content.trim() || uploading}
              className="px-5 py-2 bg-[#C2272D] hover:bg-[#A51E23] disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md shadow-[#C2272D]/20 cursor-pointer transition-colors self-end xs:self-auto btn-shine-effect"
            >
              {uploading ? 'Uploading...' : 'Post'}
            </button>
          </div>

          {showPollCreator && (
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/5 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-[#C2272D] font-title">Create Poll Questionnaire</span>
              <div>
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#1e1e24] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-xs text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D]"
                />
              </div>
              <div className="flex flex-col gap-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[idx] = e.target.value;
                        setPollOptions(updated);
                      }}
                      className="flex-1 px-3.5 py-2 bg-white dark:bg-[#1e1e24] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-xs text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D]"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(prev => prev.filter((_, i) => i !== idx))}
                        className="text-[#525252] dark:text-slate-400 hover:text-red-500 text-xs shrink-0 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={() => setPollOptions(prev => [...prev, ''])}
                  className="text-left text-[9px] font-black uppercase text-[#C2272D] hover:underline cursor-pointer"
                >
                  + Add Option Choice
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feed Timeline list */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="p-16 flex items-center justify-center bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 rounded-3xl">
            <div className="w-8 h-8 rounded-full border-3 border-[#C2272D]/20 border-t-[#C2272D] animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-16 border border-dashed border-[#E5E7EB] dark:border-white/10 text-center text-[#525252] dark:text-slate-400 rounded-3xl bg-white dark:bg-[#111111] text-xs italic">
            No active discussions found. Be the first to start a thread!
          </div>
        ) : (
          posts.filter(Boolean).map(post => {
            const currentUserId = user?.id || user?._id;
            const hasReacted = (post.reactions || []).some(r => r && (r.user?._id || r.user)?.toString() === currentUserId?.toString());
            const isBookmarked = (post.bookmarks || []).some(id => id && id.toString() === currentUserId?.toString());
            const isPostAuthor = (post.author?._id || post.author)?.toString() === currentUserId?.toString();

            return (
              <div 
                key={post._id} 
                id={`post-${post._id}`}
                className="bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-white/10 p-5 rounded-3xl flex flex-col gap-4 shadow-sm hover:border-[#C2272D]/30 transition-all card-interactive text-left"
              >
                {/* Creator Header block */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <Link to={`/community/profile/${post.author?._id || post.author}`}>
                      <div className={`w-10 h-10 rounded-xl overflow-hidden bg-[#F8FAFC] dark:bg-[#1c1c24] flex items-center justify-center shrink-0 transition-all ${
                        post.author?.avatarBorder === 'gold' 
                          ? 'border-2 border-amber-400 shadow-md shadow-amber-500/25' 
                          : 'border border-[#E5E7EB] dark:border-white/10'
                      }`}>
                        {post.author?.avatar?.url ? (
                          <img src={post.author.avatar.url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span className="font-black text-xs text-[#525252] dark:text-slate-400 uppercase">{post.author?.username?.slice(0,2)}</span>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <Link 
                          to={`/community/profile/${post.author?._id || post.author}`} 
                          className={`text-xs font-black hover:text-[#C2272D] transition-colors font-title ${
                            post.author?.profileTheme === 'neon' 
                              ? 'text-pink-500 drop-shadow-[0_0_2px_rgba(244,114,182,0.45)]' 
                              : 'text-[#171717] dark:text-white'
                          }`}
                        >
                          {post.author?.fullName}
                        </Link>
                        {post.author?.role === 'Admin' && (
                          <FaCheckCircle className="text-[#00FFFF]" size={11} title="Admin" />
                        )}
                      </div>
                      <span className="text-[9px] text-[#525252] dark:text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                        @{post.author?.username} &bull; {getRelativeTime(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#C2272D]/10 text-[#C2272D] border border-[#C2272D]/20 rounded-md text-[8px] font-black uppercase tracking-wider">
                      {post.category}
                    </span>
                    {(isPostAuthor || user?.role === 'Admin') && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingPostId(post._id);
                            setEditPostContent(post.content);
                            setEditPostImages(post.mediaUrls || (post.mediaUrl ? [post.mediaUrl] : []));
                          }}
                          className="p-1.5 bg-[#F8FAFC] dark:bg-[#1c1c24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#525252] dark:text-slate-400 hover:text-[#C2272D] rounded-lg transition-colors cursor-pointer border border-[#E5E7EB] dark:border-white/5"
                          title="Edit Post"
                        >
                          <FaEdit size={10} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="p-1.5 bg-[#F8FAFC] dark:bg-[#1c1c24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#525252] dark:text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer border border-[#E5E7EB] dark:border-white/5"
                          title="Delete Post"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex flex-col gap-3 text-left">
                  {editingPostId === post._id ? (
                    <div className="flex flex-col gap-2.5 w-full">
                      <textarea
                        value={editPostContent}
                        onChange={(e) => setEditPostContent(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#1e1e24] border border-[#E5E7EB] dark:border-white/10 rounded-xl text-xs text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D]"
                        rows={3}
                      />
                      
                      {/* Image editing preview bar */}
                      <div className="flex flex-wrap gap-2.5 my-2">
                        {editPostImages.map((img, idx) => {
                          const isTemp = typeof img !== 'string';
                          const src = isTemp ? img.previewUrl : img;
                          const isUploading = isTemp && img.uploading;

                          return (
                            <div key={isTemp ? img.id : idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-white/5 bg-[#F8FAFC] dark:bg-[#181820] group">
                              <img src={src} alt="" className="w-full h-full object-cover" />
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setEditPostImages(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="absolute top-1 right-1 p-0.5 bg-black/75 hover:bg-red-600 text-white rounded-full text-[8px] cursor-pointer"
                                title="Remove Image"
                              >
                                <FaTimes size={6} />
                              </button>

                              <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1.5 bg-black/60 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditPostImages(prev => {
                                        const copy = [...prev];
                                        const temp = copy[idx];
                                        copy[idx] = copy[idx - 1];
                                        copy[idx - 1] = temp;
                                        return copy;
                                      });
                                    }}
                                    className="text-white text-[8px] hover:text-[#00FFFF] cursor-pointer"
                                  >
                                    ←
                                  </button>
                                )}
                                {idx < editPostImages.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditPostImages(prev => {
                                        const copy = [...prev];
                                        const temp = copy[idx];
                                        copy[idx] = copy[idx + 1];
                                        copy[idx + 1] = temp;
                                        return copy;
                                      });
                                    }}
                                    className="text-white text-[8px] hover:text-[#00FFFF] cursor-pointer"
                                  >
                                    →
                                  </button>
                                )}
                              </div>

                              {isUploading && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                  <div className="w-4 h-4 rounded-full border border-[#C2272D]/20 border-t-[#C2272D] animate-spin" />
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <label className="w-16 h-16 rounded-xl border border-dashed border-[#E5E7EB] dark:border-white/20 hover:border-[#C2272D]/50 flex flex-col items-center justify-center gap-1 cursor-pointer bg-[#F8FAFC] dark:bg-[#1c1c24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#C2272D] transition-colors">
                          <FaPlus size={10} />
                          <span className="text-[8px] font-black uppercase">Add</span>
                          <input type="file" accept="image/*" multiple onChange={handleAddEditPostImage} className="hidden" />
                        </label>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingPostId(null)}
                          className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#1c1c24] hover:bg-[#E5E7EB] dark:hover:bg-[#252530] text-[#525252] dark:text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdatePost(post._id)}
                          className="px-3 py-1.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-[#171717] dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words font-sans">
                      {post.content}
                    </p>
                  )}

                  {/* Poll View Component */}
                  {post.poll && post.poll.options && post.poll.options.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 border border-[#E5E7EB] dark:border-white/5 flex flex-col gap-3 my-2">
                      <span className="text-xs font-black text-[#171717] dark:text-white font-title">{post.poll.question}</span>
                      
                      {(() => {
                        const totalVotes = post.poll.options.reduce((sum, o) => sum + (o.votes || []).length, 0);
                        const hasVoted = post.poll.options.some(o => (o.votes || []).some(v => v.toString() === currentUserId?.toString()));
                        
                        return (
                          <div className="flex flex-col gap-2.5">
                            {post.poll.options.map(opt => {
                              const voteCount = (opt.votes || []).length;
                              const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                              const userVotedForThis = (opt.votes || []).some(v => v.toString() === currentUserId?.toString());
                              
                              if (hasVoted) {
                                return (
                                  <div key={opt._id} className="relative flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-[#171717] dark:text-slate-300 z-10 px-3 py-2">
                                      <span className="flex items-center gap-1.5">
                                        {opt.optionText}
                                        {userVotedForThis && <span className="text-[8px] bg-[#C2272D] text-white px-1.5 py-0.5 rounded-full uppercase font-black">Your Vote</span>}
                                      </span>
                                      <span>{percent}% ({voteCount})</span>
                                    </div>
                                    <div className="absolute inset-0 bg-[#E5E7EB]/50 dark:bg-white/5 rounded-xl" />
                                    <div 
                                      className={`absolute left-0 top-0 bottom-0 rounded-xl transition-all duration-500 ${userVotedForThis ? 'bg-[#C2272D]/20 border border-[#C2272D]/30' : 'bg-black/5 dark:bg-white/10'}`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                );
                              }
                              
                              return (
                                <button
                                  key={opt._id}
                                  onClick={() => handleVotePoll(post._id, opt._id)}
                                  className="w-full text-left px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-[#C2272D]/10 border border-[#E5E7EB] dark:border-white/5 hover:border-[#C2272D]/30 text-xs font-bold text-[#171717] dark:text-slate-300 hover:text-[#C2272D] dark:hover:text-white transition-all cursor-pointer"
                                >
                                  {opt.optionText}
                                </button>
                              );
                            })}
                            
                            <div className="text-[9px] text-[#525252] dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                              Total: {totalVotes} Votes
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Attachment Media if present */}
                  {((post.mediaUrls && post.mediaUrls.length > 0) || (post.mediaUrl && post.mediaType === 'image')) ? (
                    <div className="my-2 text-center">
                      <ImageGallery images={post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls : [post.mediaUrl]} />
                    </div>
                  ) : post.mediaUrl ? (
                    <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] dark:border-white/5 bg-[#F8FAFC] dark:bg-[#181820] max-h-[360px] w-full flex items-center justify-center my-2">
                      {post.mediaType === 'video' && <video src={post.mediaUrl} controls className="w-full h-full max-h-[360px]" />}
                      {post.mediaType === 'pdf' && (
                        <div className="w-full p-4 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-900/50 rounded-2xl border border-[#E5E7EB] dark:border-white/5 m-3">
                          <div className="flex items-center gap-2">
                            <FaFilePdf className="text-[#C2272D]" size={24} />
                            <div className="text-left">
                              <span className="text-xs font-black text-[#171717] dark:text-white block">Document Attachment</span>
                              <span className="text-[9px] text-[#525252] dark:text-slate-400 block">PDF File</span>
                            </div>
                          </div>
                          <a
                            href={post.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                          >
                            View / Download
                          </a>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Interaction Row counters */}
                <div className="flex items-center justify-between border-t border-[#E5E7EB] dark:border-white/5 pt-3 text-[10px] text-[#525252] dark:text-slate-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#C2272D]/15 text-[#C2272D] text-[9px]">👍</span>
                    <span>{post.reactions?.length || 0} Likes</span>
                  </div>
                  <div className="flex gap-4">
                    <span>{comments[post._id]?.length || post.commentsCount || 0} Comments</span>
                    <span>{post.bookmarks?.length || 0} Saved</span>
                  </div>
                </div>

                {/* Interaction Buttons */}
                <div className="grid grid-cols-4 border-t border-[#E5E7EB] dark:border-white/5 pt-2 text-[10px] font-black uppercase tracking-wider text-[#525252] dark:text-slate-400">
                  <button
                    onClick={() => handleReaction(post._id, 'Like')}
                    className={`py-2 hover:bg-[#F8FAFC] dark:hover:bg-white/5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      hasReacted ? 'text-[#C2272D]' : 'hover:text-[#C2272D]'
                    }`}
                  >
                    {hasReacted ? <FaHeart className="text-[#C2272D]" /> : <FaRegHeart />} Like
                  </button>
                  <button
                    onClick={() => toggleComments(post._id)}
                    className="py-2 hover:bg-[#F8FAFC] dark:hover:bg-white/5 hover:text-[#C2272D] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FaComment /> Comment
                  </button>
                  <button
                    onClick={() => handleBookmark(post._id)}
                    className={`py-2 hover:bg-[#F8FAFC] dark:hover:bg-white/5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      isBookmarked ? 'text-[#C2272D]' : 'hover:text-[#C2272D]'
                    }`}
                  >
                    {isBookmarked ? <FaBookmark className="text-[#C2272D]" /> : <FaRegBookmark />} Save
                  </button>
                  <ShareButton 
                    contentType="post"
                    contentId={post._id}
                    title={post.title || 'Community Post'}
                    description={post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : ''}
                    imageUrl={post.mediaUrl || (post.mediaUrls && post.mediaUrls[0]) || ''}
                    className="py-2 hover:bg-[#F8FAFC] dark:hover:bg-white/5 hover:text-[#C2272D] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    btnText="Share"
                  />
                </div>


                {/* Comments Section */}
                {showComments[post._id] && (
                  <div className="border-t border-[#E5E7EB] dark:border-white/5 pt-4 flex flex-col gap-4 animate-fade-in">
                    {/* Add Comment Input */}
                    <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#F8FAFC] dark:bg-[#1c1c24] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center shrink-0">
                        {user?.avatar?.url ? (
                          <img src={user.avatar.url} alt="Profile" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <FaUser className="text-[#525252] dark:text-slate-400" size={12} />
                        )}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                          className="w-full px-4 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#1c1c24] border border-[#E5E7EB] dark:border-white/5 text-xs text-[#171717] dark:text-white placeholder-[#737373] dark:placeholder-slate-400 focus:outline-none focus:border-[#C2272D] transition-all"
                        />
                        <button type="submit" className="p-2.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                          <FaPaperPlane size={11} />
                        </button>
                      </div>
                    </form>

                    {/* Comments & Replies list */}
                    <div className="flex flex-col gap-3">
                      {/* Filter top-level comments */}
                      {(comments[post._id] || [])
                        .filter(c => c && !c.parentCommentId)
                        .map(comment => {
                          const replies = (comments[post._id] || []).filter(r => r && r.parentCommentId === comment._id);
                          
                          return (
                            <div key={comment._id} className="flex flex-col gap-2.5 pl-1.5 border-l-2 border-[#E5E7EB] dark:border-white/10">
                              {/* Top Level Comment Card */}
                              <div className="flex gap-2.5 items-start">
                                <div className="w-7.5 h-7.5 rounded-lg overflow-hidden bg-[#F8FAFC] dark:bg-[#1c1c24] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center shrink-0">
                                  {comment.author?.avatar?.url ? (
                                    <img src={comment.author.avatar.url} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
                                  ) : (
                                    <FaUser className="text-[#525252] dark:text-slate-400" size={10} />
                                  )}
                                </div>
                                <div className="flex-1 bg-[#F8FAFC] dark:bg-[#181820] border border-[#E5E7EB] dark:border-white/5 p-3 rounded-2xl text-left">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-black text-[#171717] dark:text-white font-title">{comment.author?.fullName}</span>
                                      <span className="text-[8px] text-[#525252] dark:text-slate-400">@{comment.author?.username}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[8px] text-[#525252] dark:text-slate-400">{getRelativeTime(comment.createdAt)}</span>
                                      {(comment.author?._id === currentUserId || user?.role === 'Admin') && (
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={() => {
                                              setEditingCommentId(comment._id);
                                              setEditCommentContent(comment.content);
                                            }}
                                            className="text-[#525252] dark:text-slate-400 hover:text-[#C2272D] transition-colors"
                                            title="Edit Comment"
                                          >
                                            <FaEdit size={8} />
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteComment(post._id, comment._id)}
                                            className="text-[#525252] dark:text-slate-400 hover:text-red-500 transition-colors"
                                            title="Delete Comment"
                                          >
                                            <FaTrash size={8} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {editingCommentId === comment._id ? (
                                    <div className="flex flex-col gap-1.5 mt-1 w-full">
                                      <input
                                        type="text"
                                        value={editCommentContent}
                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                        className="w-full px-2 py-1 bg-white dark:bg-[#1e1e24] border border-[#E5E7EB] dark:border-white/10 rounded-lg text-[10px] text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D]"
                                      />
                                      <div className="flex gap-1.5 justify-end">
                                        <button
                                          onClick={() => setEditingCommentId(null)}
                                          className="px-2 py-1 bg-[#F8FAFC] dark:bg-[#1c1c24] text-[#525252] dark:text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-wider"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleUpdateComment(post._id, comment._id)}
                                          className="px-2 py-1 bg-[#C2272D] text-white rounded-lg text-[8px] font-black uppercase tracking-wider"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-[#171717] dark:text-slate-200 mt-1 leading-relaxed font-sans">{comment.content}</p>
                                  )}
                                  
                                  {/* Reply Trigger */}
                                  <button
                                    onClick={() => setActiveReplyBox(activeReplyBox === comment._id ? null : comment._id)}
                                    className="text-[9px] font-black text-[#C2272D] hover:underline mt-2 flex items-center gap-1 cursor-pointer"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>

                              {/* Indented Replies Section */}
                              {replies.filter(Boolean).map(reply => (
                                <div key={reply._id} className="flex gap-2.5 items-start pl-8">
                                  <div className="w-6.5 h-6.5 rounded-lg overflow-hidden bg-[#F8FAFC] dark:bg-[#1c1c24] border border-[#E5E7EB] dark:border-white/10 flex items-center justify-center shrink-0">
                                    {reply.author?.avatar?.url ? (
                                      <img src={reply.author.avatar.url} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                      <FaUser className="text-[#525252] dark:text-slate-400" size={8} />
                                    )}
                                  </div>
                                  <div className="flex-1 bg-[#F8FAFC] dark:bg-[#1a1a24] border border-[#E5E7EB] dark:border-white/5 p-2.5 rounded-2xl text-left">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[9px] font-black text-[#171717] dark:text-white font-title">{reply.author?.fullName}</span>
                                        <span className="text-[8px] text-[#525252] dark:text-slate-400">@{reply.author?.username}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-[#525252] dark:text-slate-400">{getRelativeTime(reply.createdAt)}</span>
                                        {(reply.author?._id === currentUserId || user?.role === 'Admin') && (
                                          <button 
                                            onClick={() => handleDeleteComment(post._id, reply._id)}
                                            className="text-[#525252] dark:text-slate-400 hover:text-red-500 transition-colors"
                                          >
                                            <FaTrash size={8} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-[#171717] dark:text-slate-200 mt-1 leading-relaxed font-sans">{reply.content}</p>
                                  </div>
                                </div>
                              ))}

                              {/* Inline Reply Input Box */}
                              {activeReplyBox === comment._id && (
                                <form onSubmit={(e) => handleAddReply(e, post._id, comment._id)} className="flex gap-2 pl-8">
                                  <input
                                    type="text"
                                    placeholder="Write a reply..."
                                    value={replyInputs[comment._id] || ''}
                                    onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#181822] border border-[#E5E7EB] dark:border-white/5 text-[10px] text-[#171717] dark:text-white focus:outline-none focus:border-[#C2272D]"
                                  />
                                  <button type="submit" className="px-3 py-1.5 bg-[#C2272D] hover:bg-[#A51E23] text-white rounded-lg text-[10px] font-bold cursor-pointer">
                                    Reply
                                  </button>
                                </form>
                              )}

                            </div>
                          );
                        })}
                      
                      {comments[post._id]?.length === 0 && (
                        <div className="text-[9px] text-[#525252] dark:text-slate-400 italic text-center py-1">No comments on this thread yet.</div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      <ImageCropperModal
        isOpen={cropModalOpen}
        files={cropQueue}
        aspectRatio={null}
        onClose={() => { setCropQueue([]); setCropModalOpen(false); }}
        onCropComplete={cropCallback}
      />
    </div>
  );
};

export default CommunityFeed;
