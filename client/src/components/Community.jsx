import React, { useState, useEffect, useRef } from 'react';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowUpIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  StopIcon,
  FaceSmileIcon,
  FireIcon,
  SparklesIcon,
  BookmarkIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  LinkIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  PlayIcon,
  PauseIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid,
  ArrowUpIcon as ArrowUpSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid';
import { useUser } from '@clerk/clerk-react';
import { useApi } from '../hooks/useApi';

// Credit Coin SVG Component
const CreditCoinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" className="text-yellow-400" />
    <circle cx="12" cy="12" r="7" className="text-yellow-500" />
    <text x="12" y="16" textAnchor="middle" className="fill-yellow-900 text-xs font-bold">₹</text>
  </svg>
);

import { motion, AnimatePresence } from 'framer-motion';

const formatMediaTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Media Player with Speed Control and Custom Audio UX
const MediaPlayer = ({ src, type, autoPlay = false }) => {
  const mediaRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    if (autoPlay && mediaRef.current) {
      mediaRef.current.play().catch(e => console.log('Autoplay prevented:', e));
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      const current = mediaRef.current.currentTime;
      const total = mediaRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100 || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    if (mediaRef.current) {
      mediaRef.current.currentTime = percentage * mediaRef.current.duration;
      setProgress(percentage * 100);
      setCurrentTime(percentage * mediaRef.current.duration);
    }
  };

  const handleSpeedSelect = (e) => {
    const val = parseFloat(e.target.value);
    setSpeed(val);
    if (mediaRef.current) mediaRef.current.playbackRate = val;
  };

  const renderSpeedMenu = () => (
    <div className="flex items-center justify-end gap-3 mt-3 pr-2 w-full">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Speed: {speed.toFixed(1)}x</span>
      <input
        type="range"
        min="0.5"
        max="2.5"
        step="0.1"
        value={speed}
        onChange={handleSpeedSelect}
        className="w-28 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
    </div>
  );

  if (type === 'video') {
    return (
      <div className="flex flex-col w-full">
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-black flex flex-col items-center justify-center relative">
          <video ref={mediaRef} src={src} controls autoPlay={autoPlay} className="max-h-[400px] w-full object-contain rounded" />
        </div>
        {renderSpeedMenu()}
      </div>
    );
  }

  // Custom Audio Player with Framer Motion
  return (
    <div className="flex flex-col w-full">
      <div className="w-full bg-white border border-gray-100 rounded-full py-2 px-4 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
        <button
          type="button"
          onClick={togglePlay}
          className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
        >
          {isPlaying ? <PauseIcon className="w-5 h-5 ml-0.5" /> : <PlayIcon className="w-5 h-5 pl-1" />}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 h-3 bg-gray-100 rounded-full relative cursor-pointer group" onClick={handleSeek}>
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
          {/* Playhead thumb handle */}
          <div
            className="absolute top-1/2 -ml-2 w-4 h-4 bg-white border-[3px] border-purple-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%`, transform: 'translateY(-50%)' }}
          />
        </div>

        <div className="text-xs font-semibold text-gray-500 w-12 text-right tracking-wide">
          {formatMediaTime(currentTime)}
        </div>
      </div>

      {renderSpeedMenu()}

      <audio
        ref={mediaRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => { setIsPlaying(false); setProgress(0); }}
        className="hidden"
      />
    </div>
  );
};

const LiveVideoPreview = ({ stream }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream && stream.getVideoTracks().length > 0) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream || stream.getVideoTracks().length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner mt-4 border-2 border-red-200"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
        <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded shadow tracking-wide uppercase">Live</span>
      </div>
    </motion.div>
  );
};

// Graphical Wave Loader for Premium Upload Experience
const WaveLoader = ({ text }) => {
  const bars = [0, 1, 2, 3, 4, 5];
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-end gap-1.5 h-12">
        {bars.map((i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-gradient-to-t from-blue-400 via-indigo-500 to-purple-600 rounded-full"
            animate={{
              height: [10, 48, 10],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 tracking-wide uppercase"
      >
        {text}
      </motion.p>
    </div>
  );
};

const Community = () => {
  const { user, isLoaded } = useUser();
  const { apiClient, baseUrl } = useApi();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [commentFile, setCommentFile] = useState({});
  const [commentFileType, setCommentFileType] = useState({});
  const [commentFilePreview, setCommentFilePreview] = useState({});

  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState({ post: false, comment: false });
  const [activeTab, setActiveTab] = useState('trending');
  const [errors, setErrors] = useState({});
  const [shareModal, setShareModal] = useState({ isOpen: false, post: null });
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDropdown, setShowDropdown] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: '', id: '', postId: '' });
  const [creditNotification, setCreditNotification] = useState({ show: false, message: '' });
  const fileInputRef = useRef(null);

  const [showVideoMenu, setShowVideoMenu] = useState({ post: false, comment: null });

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If we clicked something that isn't a video menu button or the menu itself
      if (!event.target.closest('.video-menu-container')) {
        setShowVideoMenu({ post: false, comment: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [selectedTag, setSelectedTag] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Hashtag filtering handler
  const handleTagClick = (tag) => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (selectedTag === tag) {
      // Toggle off if already selected
      setSelectedTag(null);
      return;
    }

    setIsFiltering(true);
    setSelectedTag(tag);
    // Simulate network delay for UI smoothness
    setTimeout(() => {
      setIsFiltering(false);
    }, 800);
  };

  // Debug logging
  useEffect(() => {
    console.log('🔧 Community Component Debug Info:', {
      userLoaded: isLoaded,
      user: user ? { id: user.id, username: user.username, firstName: user.firstName } : null,
      baseUrl,
      apiClient: !!apiClient
    });
  }, [user, isLoaded, baseUrl, apiClient]);

  useEffect(() => {
    if (isLoaded) {
      fetchPosts();
    }
  }, [activeTab, isLoaded]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown({});
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Enhanced error handling helper
  const handleError = (error, context) => {
    console.error(`❌ Error in ${context}:`, error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });

    setErrors(prev => ({
      ...prev,
      [context]: error.response?.data?.message || error.message || 'Unknown error'
    }));
  };

  // Clear error helper
  const clearError = (context) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[context];
      return newErrors;
    });
  };

  const fetchPosts = async () => {
    console.log(`🔄 Fetching posts with sort: ${activeTab}`);
    setFetchingPosts(true);
    clearError('fetchPosts');

    try {
      const response = await apiClient.get(`/api/community/posts?sort=${activeTab}`);
      console.log('✅ Posts fetched successfully:', response.data);
      setPosts(response.data.posts || []);
    } catch (error) {
      handleError(error, 'fetchPosts');
      setPosts([]);
    } finally {
      setFetchingPosts(false);
    }
  };

  const validateUserData = () => {
    if (!isLoaded) {
      console.warn('⚠️ User data not loaded yet');
      return false;
    }

    if (!user) {
      console.warn('⚠️ User not logged in');
      toast.error('Please log in to perform this action');
      return false;
    }

    if (!user.id) {
      console.error('❌ User ID missing');
      toast.error('User ID is missing. Please try logging out and back in.');
      return false;
    }

    return true;
  };

  // Function to award credits for posting
  const awardPostCredits = async (userId) => {
    try {
      console.log('🪙 Awarding credits for post creation...');
      const response = await apiClient.post('/api/credits/earn-post', {
        userId: userId,
        creditsEarned: 1
      });

      if (response.data.success) {
        console.log('✅ Credits awarded successfully');
        setCreditNotification({
          show: true,
          message: '🪙 You earned 1 credit for posting!'
        });

        setTimeout(() => {
          setCreditNotification({ show: false, message: '' });
        }, 4000);
      }
    } catch (error) {
      console.error('❌ Error awarding credits:', error);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async (type, isComment = false, postId = null) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      streamRef.current = stream;
      setRecordingType(type);
      setIsRecording(true);
      setRecordingTime(0);
      chunksRef.current = [];

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        clearInterval(recordingTimerRef.current);

        let mimeType = mediaRecorder.mimeType || '';
        if (!mimeType) mimeType = type === 'video' ? 'video/webm' : 'audio/webm';

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `recorded_${type}_${Date.now()}.${ext}`, { type: mimeType });

        const previewUrl = URL.createObjectURL(blob);
        if (isComment && postId) {
          setCommentFile(prev => ({ ...prev, [postId]: file }));
          setCommentFileType(prev => ({ ...prev, [postId]: type }));
          setCommentFilePreview(prev => ({ ...prev, [postId]: previewUrl }));
        } else {
          setSelectedFile(file);
          setFileType(type);
          setFilePreview(previewUrl);
        }

        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setRecordingType(null);
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Recording Error:', err);
      toast.error('Could not start recording. Please check your camera/microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Handle media selection
  const handleMediaSelect = (e, isComment = false, postId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    let type = null;
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

    const validTypes = ['image', 'video', 'audio'];
    if (!validTypes.includes(file.type.split('/')[0])) {
      toast.warning('Please select a valid image, video, or audio file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.warning('File size must be less than 50MB');
      return;
    }

    console.log(`📎 Media selected: ${file.name} (${file.size} bytes)`);

    const previewUrl = type === 'image' ? URL.createObjectURL(file) : URL.createObjectURL(file);

    if (isComment && postId) {
      setCommentFile(prev => ({ ...prev, [postId]: file }));
      setCommentFileType(prev => ({ ...prev, [postId]: type }));
      setCommentFilePreview(prev => ({ ...prev, [postId]: previewUrl }));
    } else {
      setSelectedFile(file);
      setFileType(type);
      setFilePreview(previewUrl);
    }
  };

  const removeMedia = (isComment = false, postId = null) => {
    console.log('🗑️ Removing selected media');
    if (isComment && postId) {
      setCommentFile(prev => ({ ...prev, [postId]: null }));
      setCommentFileType(prev => ({ ...prev, [postId]: null }));
      setCommentFilePreview(prev => ({ ...prev, [postId]: null }));
    } else {
      setSelectedFile(null);
      setFileType(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerMediaSelect = (acceptType, isComment = false, postId = null) => {
    console.log(`📸 Triggering ${acceptType} selection`);
    if (isComment && postId) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = acceptType;
      input.onchange = (e) => handleMediaSelect(e, true, postId);
      input.click();
    } else if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
  };

  // Dropdown handlers
  const toggleDropdown = (e, type, id) => {
    e.stopPropagation();
    const key = `${type}-${id}`;
    setShowDropdown(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Edit handlers
  const startEditPost = (post) => {
    setEditingPost(post._id);
    setEditContent(post.content);
    setShowDropdown({});
  };

  const startEditComment = (comment, postId) => {
    setEditingComment(`${postId}-${comment._id}`);
    setEditContent(comment.content);
    setShowDropdown({});
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditingComment(null);
    setEditContent('');
  };

  const savePostEdit = async (postId) => {
    if (!editContent.trim()) {
      toast.warning('Post content cannot be empty');
      return;
    }

    try {
      const response = await apiClient.put(`/api/community/posts/${postId}`, {
        content: editContent.trim(),
        userId: user.id
      });

      if (response.data.success) {
        await fetchPosts();
        setEditingPost(null);
        setEditContent('');
        console.log('✅ Post updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating post:', error);
      toast.error('Error updating post: ' + (error.response?.data?.message || error.message));
    }
  };

  const saveCommentEdit = async (postId, commentId) => {
    if (!editContent.trim()) {
      toast.warning('Comment content cannot be empty');
      return;
    }

    try {
      const response = await apiClient.put(`/api/community/posts/${postId}/comments/${commentId}`, {
        content: editContent.trim(),
        userId: user.id
      });

      if (response.data.success) {
        await fetchPosts();
        setEditingComment(null);
        setEditContent('');
        console.log('✅ Comment updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating comment:', error);
      toast.error('Error updating comment: ' + (error.response?.data?.message || error.message));
    }
  };

  // Delete handlers
  const confirmDelete = (type, id, postId = '') => {
    setDeleteConfirm({ isOpen: true, type, id, postId });
    setShowDropdown({});
  };

  const executeDelete = async () => {
    const { type, id, postId } = deleteConfirm;

    try {
      if (type === 'post') {
        await apiClient.delete(`/api/community/posts/${id}`, {
          data: { userId: user.id }
        });
        console.log('✅ Post deleted successfully');
      } else if (type === 'comment') {
        await apiClient.delete(`/api/community/posts/${postId}/comments/${id}`, {
          data: { userId: user.id }
        });
        console.log('✅ Comment deleted successfully');
      }

      await fetchPosts();
      setDeleteConfirm({ isOpen: false, type: '', id: '', postId: '' });
    } catch (error) {
      console.error('❌ Error deleting:', error);
      toast.error('Error deleting: ' + (error.response?.data?.message || error.message));
    }
  };

  // Share functionality
  const handleShare = (post) => {
    console.log('🔗 Opening share modal for post:', post._id);
    setShareModal({ isOpen: true, post });
  };

  const closeShareModal = () => {
    setShareModal({ isOpen: false, post: null });
    setCopySuccess(false);
  };

  const copyPostLink = async (post) => {
    const postUrl = `${window.location.origin}/community/post/${post._id}`;

    try {
      await navigator.clipboard.writeText(postUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      console.log('✅ Post link copied to clipboard');
    } catch (error) {
      console.error('❌ Failed to copy link:', error);
      const textArea = document.createElement('textarea');
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const shareToSocialMedia = (platform, post) => {
    const postUrl = `${window.location.origin}/community/post/${post._id}`;
    const text = `Check out this post from ${post.username} on SkillSwap Community: "${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"`;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent('SkillSwap Community Post')}&summary=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${postUrl}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      console.log(`✅ Shared to ${platform}`);
    }
  };

  // ENHANCED: handleCreatePost with detailed error debugging and media support
  const handleCreatePost = async (e) => {
    e.preventDefault();
    console.log('🚀 handleCreatePost called - DEBUGGING MODE');

    if (!validateUserData()) return;

    if (!newPost.trim() && !selectedFile) {
      console.warn('⚠️ Post content and media are both empty');
      toast.warning('Please enter some content or attach media for your post');
      return;
    }

    setLoading(true);
    clearError('createPost');

    try {
      let mediaData = {
        imageUrl: '', imagePublicId: '',
        videoUrl: '', videoPublicId: '',
        audioUrl: '', audioPublicId: ''
      };

      if (selectedFile) {
        setUploadingMedia(prev => ({ ...prev, post: true }));
        console.log(`📷 Uploading ${fileType} to Cloudinary...`);

        const formData = new FormData();
        formData.append('media', selectedFile);

        const mediaResponse = await apiClient.post('/api/community/upload-media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const url = mediaResponse.data.mediaUrl;
        const pubId = mediaResponse.data.publicId;

        if (fileType === 'image') {
          mediaData.imageUrl = url;
          mediaData.imagePublicId = pubId;
        } else if (fileType === 'video') {
          mediaData.videoUrl = url;
          mediaData.videoPublicId = pubId;
        } else if (fileType === 'audio') {
          mediaData.audioUrl = url;
          mediaData.audioPublicId = pubId;
        }

        console.log(`✅ ${fileType} uploaded to Cloudinary:`, url);
        setUploadingMedia(prev => ({ ...prev, post: false }));
      }

      const postData = {
        content: newPost.trim(),
        userId: user.id,
        username: user.username || user.firstName || 'Unknown User',
        userAvatar: user.imageUrl || '',
        ...mediaData
      };

      console.log('📤 SENDING POST DATA:', postData);
      console.log('🌐 API Base URL:', baseUrl);
      console.log('🔑 User ID:', user.id);
      console.log('📝 Content Length:', newPost.trim().length);

      const response = await apiClient.post('/api/community/posts', postData);
      console.log('✅ Post created successfully:', response.data);

      setNewPost('');
      removeMedia();
      await fetchPosts();
      await awardPostCredits(user.id);

      // alert('Post created successfully! 🎉 You earned 1 credit!');

    } catch (error) {
      console.error('❌ DETAILED ERROR ANALYSIS:');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      console.error('Error config:', error.config);

      handleError(error, 'createPost');

      // More specific error handling
      // if (error.response?.status === 400) {
      //   alert(`❌ Bad Request: ${error.response.data.message || 'Invalid data sent to server'}`);
      // } else if (error.response?.status === 500) {
      //   alert(`❌ Server Error: ${error.response.data.message || 'Internal server error'}`);
      // } else if (error.response?.data?.message) {
      //   alert(`❌ Error: ${error.response.data.message}`);
      // } else {
      //   alert(`❌ Unknown Error: ${error.message}`);
      // }
    } finally {
      setLoading(false);
      setUploadingMedia(prev => ({ ...prev, post: false }));
    }
  };


  const handleLike = async (postId) => {
    if (!validateUserData()) return;

    console.log(`❤️ Liking post: ${postId}`);
    clearError('like');

    try {
      const response = await apiClient.post(`/api/community/posts/${postId}/like`, {
        userId: user.id
      });
      console.log('✅ Like action successful:', response.data);
      await fetchPosts();
    } catch (error) {
      handleError(error, 'like');
    }
  };

  const handleUpvote = async (postId) => {
    if (!validateUserData()) return;

    console.log(`⬆️ Upvoting post: ${postId}`);
    clearError('upvote');

    try {
      const response = await apiClient.post(`/api/community/posts/${postId}/upvote`, {
        userId: user.id
      });
      console.log('✅ Upvote action successful:', response.data);
      await fetchPosts();
    } catch (error) {
      handleError(error, 'upvote');
    }
  };

  // FIXED: handleComment with media support
  const handleComment = async (postId) => {
    if (!validateUserData()) return;

    const content = commentText[postId];
    const cFile = commentFile[postId];
    const cFileType = commentFileType[postId];

    if (!content?.trim() && !cFile) {
      console.warn('⚠️ Comment content and media are empty');
      toast.warning('Please enter a comment or attach media');
      return;
    }

    console.log(`💬 Adding comment to post: ${postId} - NO LIMITS!`);
    clearError('comment');
    setUploadingMedia(prev => ({ ...prev, comment: true }));

    try {
      let mediaData = {
        imageUrl: '', imagePublicId: '',
        videoUrl: '', videoPublicId: '',
        audioUrl: '', audioPublicId: ''
      };

      if (cFile) {
        console.log(`📷 Uploading comment ${cFileType} to Cloudinary...`);
        const formData = new FormData();
        formData.append('media', cFile);

        const mediaResponse = await apiClient.post('/api/community/upload-media', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const url = mediaResponse.data.mediaUrl;
        const pubId = mediaResponse.data.publicId;

        if (cFileType === 'image') {
          mediaData.imageUrl = url; mediaData.imagePublicId = pubId;
        } else if (cFileType === 'video') {
          mediaData.videoUrl = url; mediaData.videoPublicId = pubId;
        } else if (cFileType === 'audio') {
          mediaData.audioUrl = url; mediaData.audioPublicId = pubId;
        }
      }

      const commentData = {
        content: content?.trim() || '',
        userId: user.id,
        username: user.username || user.firstName || 'Unknown User',
        userAvatar: user.imageUrl || '',
        ...mediaData
      };

      const response = await apiClient.post(`/api/community/posts/${postId}/comment`, commentData);
      console.log('✅ Comment added successfully:', response.data);

      setCommentText(prev => ({ ...prev, [postId]: '' }));
      removeMedia(true, postId);
      await fetchPosts();
    } catch (error) {
      handleError(error, 'comment');
      // alert(`Error adding comment: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploadingMedia(prev => ({ ...prev, comment: false }));
    }
  };

  const toggleComments = (postId) => {
    console.log(`👁️ Toggling comments for post: ${postId}`);
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const getTimeAgo = (date) => {
    try {
      const now = new Date();
      const postDate = new Date(date);
      const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (error) {
      console.error('Error calculating time ago:', error);
      return 'Unknown time';
    }
  };

  const getImageClasses = (imageUrl) => {
    return "w-full h-auto max-h-[150px] sm:max-h-[180px] object-cover rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:opacity-95 transition-opacity";
  };

  // Turn #hashtags into clickable elements
  const renderContentWithHashtags = (content) => {
    if (!content) return null;

    // Split on hashtags, keeping the hashtag in the resulting array
    const parts = content.split(/(#[\w]+)/g);

    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              handleTagClick(part);
            }}
            className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer hover:bg-blue-50 px-1 rounded transition-colors"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const trendingTags = React.useMemo(() => {
    const counts = {};
    posts.forEach(post => {
      const tags = post.content?.match(/#[\w]+/g) || [];
      tags.forEach(t => {
        // Simple normalization
        const normalized = t.toLowerCase();
        counts[normalized] = { tag: t, count: (counts[normalized]?.count || 0) + 1 };
      });
    });

    let sorted = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .map(item => item.tag);

    // Provide modern dummy tags if not enough organic ones exist
    if (sorted.length < 5) {
      const dummies = ['#SkillSwap', '#WebDev', '#AI', '#Learning', '#React'];
      sorted = [...new Set([...sorted, ...dummies])];
    }
    return sorted.slice(0, 5);
  }, [posts]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="pt-20 sm:pt-24"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-bounce delay-500"></div>
      </div>

      {/* Credit Notification */}
      <AnimatePresence>
        {creditNotification.show && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="fixed top-20 right-6 z-[100]"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20 backdrop-blur-xl">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-inner">
                  <CreditCoinIcon className="w-6 h-6 text-yellow-300 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-tight">Reward Earned</p>
                  <p className="font-bold text-sm text-white drop-shadow-sm">{creditNotification.message.replace('🪙 ', '')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Delete {deleteConfirm.type}?
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                This action cannot be undone. The {deleteConfirm.type} will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, type: '', id: '', postId: '' })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeShareModal}>
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Share Post
              </h3>
              <button
                onClick={closeShareModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={shareModal.post?.userAvatar}
                  alt={shareModal.post?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold text-sm">{shareModal.post?.username}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">
                {shareModal.post?.content}
              </p>
            </div>

            <div className="mb-6">
              <button
                onClick={() => copyPostLink(shareModal.post)}
                className="w-full flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
                  <span className="font-medium text-gray-700 group-hover:text-blue-700">Copy Link</span>
                </div>
                {copySuccess ? (
                  <span className="text-green-600 font-medium">Copied! ✓</span>
                ) : (
                  <ClipboardDocumentIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Share on social media</h4>

              {[
                { platform: 'twitter', name: 'Twitter', icon: '𝕏', color: 'hover:bg-gray-100' },
                { platform: 'linkedin', name: 'LinkedIn', icon: 'in', color: 'hover:bg-blue-50' },
                { platform: 'facebook', name: 'Facebook', icon: 'f', color: 'hover:bg-blue-50' },
                { platform: 'whatsapp', name: 'WhatsApp', icon: 'W', color: 'hover:bg-green-50' },
                { platform: 'telegram', name: 'Telegram', icon: 'T', color: 'hover:bg-blue-50' }
              ].map((social) => (
                <button
                  key={social.platform}
                  onClick={() => shareToSocialMedia(social.platform, shareModal.post)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${social.color} group`}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm">
                    {social.icon}
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                    Share on {social.name}
                  </span>
                  <ShareIcon className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8 px-4 sm:px-6 relative items-start">

        {/* Left/Center Column: Main Feed */}
        <div className="flex-1 w-full max-w-2xl">
          {/* Header */}
          <div className="py-4 relative">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <SparklesIcon className="w-7 h-7 text-blue-500 animate-pulse" />
                    <div className="absolute inset-0 w-7 h-7 bg-blue-500/20 rounded-full blur animate-ping"></div>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    SkillSwap Community
                  </h1>
                </div>
                <div className="hidden md:flex items-center bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full px-3 py-1 border border-orange-200/50">
                  <FireIcon className="w-4 h-4 text-orange-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Hot discussions</span>
                </div>
              </div>

              <div className="flex space-x-1 bg-white/70 rounded-2xl p-1 shadow-md border border-blue-200/30">
                {[
                  { id: 'trending', label: 'Trending', icon: '🔥' },
                  { id: 'latest', label: 'Latest', icon: '⚡' },
                  { id: 'popular', label: 'Popular', icon: '🌟' }
                ].map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="py-2 relative">
            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <h3 className="font-bold text-red-800 mb-2 text-sm">Errors:</h3>
                {Object.entries(errors).map(([key, value]) => (
                  <div key={key} className="text-red-700 text-xs">
                    <strong>{key}:</strong> {value}
                    <button
                      onClick={() => clearError(key)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* User Not Logged In Warning */}
            {!user && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
                <p className="text-yellow-800 text-sm">Please log in to create posts and interact with the community.</p>
              </div>
            )}

            {/* Create Post Card */}
            {user && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-200/50 mb-6 group hover:shadow-2xl transition-all duration-500">
                <div className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 p-5">
                  <form onSubmit={handleCreatePost}>
                    <div className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={user?.imageUrl || '/default-avatar.png'}
                          alt="Your avatar"
                          className="w-12 h-12 rounded-xl shadow-lg ring-2 ring-blue-200/50 group-hover:ring-blue-300/70 transition-all duration-300"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                            console.warn('Failed to load user avatar, using default');
                          }}
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="relative">
                          <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="🚀 Share your knowledge, ask questions, or inspire fellow learners! Write as much as you want - no limits!"
                            className="w-full p-4 border-2 border-blue-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white/60 backdrop-blur-sm text-gray-700 placeholder-gray-500 text-sm min-h-[80px]"
                            rows="3"
                          />
                        </div>

                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-lg p-3 flex items-center gap-2">
                          <CreditCoinIcon className="w-5 h-5 text-yellow-600 animate-pulse" />
                          <span className="text-xs text-yellow-700 font-medium">
                            💡 Earn 1 credit for each post you share! No word limits - express yourself freely!
                          </span>
                        </div>

                        {/* Recording UI */}
                        <AnimatePresence>
                          {isRecording && !commentText['new'] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, scale: 0.95 }}
                              animate={{ opacity: 1, height: 'auto', scale: 1 }}
                              exit={{ opacity: 0, height: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="flex flex-col bg-red-50 p-4 rounded-xl border border-red-200 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                  <span className="text-red-700 font-semibold flex items-center gap-2">
                                    {recordingType === 'video' ? <VideoCameraIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                                    Recording {recordingType}... {formatTime(recordingTime)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={stopRecording}
                                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium flex items-center gap-2 shadow-sm hover:shadow transition-all hover:scale-105"
                                >
                                  <StopIcon className="w-4 h-4" /> Stop
                                </button>
                              </div>

                              {recordingType === 'video' && streamRef.current && (
                                <LiveVideoPreview stream={streamRef.current} />
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {filePreview && (
                          <div className="relative p-2 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex justify-center">
                            {fileType === 'image' && (
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="max-h-32 object-contain mx-auto rounded"
                              />
                            )}
                            {fileType === 'video' && (
                              <div className="w-full"><MediaPlayer src={filePreview} type="video" /></div>
                            )}
                            {fileType === 'audio' && (
                              <div className="w-full"><MediaPlayer src={filePreview} type="audio" /></div>
                            )}

                            <button
                              type="button"
                              onClick={() => removeMedia()}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                            {uploadingMedia.post && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-xl z-20 border border-blue-100"
                              >
                                <WaveLoader text={`Uploading ${fileType}...`} />
                              </motion.div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center group/controls relative">
                          <div className="flex gap-1 flex-wrap items-center">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={(e) => handleMediaSelect(e)}
                              className="hidden"
                            />

                            {/* Image */}
                            <button
                              type="button"
                              onClick={() => triggerMediaSelect('image/*')}
                              className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-all"
                              title="Add image"
                            >
                              <PhotoIcon className="w-5 h-5" />
                            </button>

                            {/* Video Menu */}
                            <div className="relative video-menu-container">
                              <button
                                type="button"
                                onClick={() => setShowVideoMenu({ post: !showVideoMenu.post, comment: null })}
                                className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-all"
                                title="Add Video"
                              >
                                <VideoCameraIcon className="w-5 h-5" />
                              </button>

                              {showVideoMenu.post && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 min-w-[180px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowVideoMenu({ post: false, comment: null });
                                      triggerMediaSelect('video/*');
                                    }}
                                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                                  >
                                    <VideoCameraIcon className="w-4 h-4" />
                                    Browse Device
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowVideoMenu({ post: false, comment: null });
                                      startRecording('video');
                                    }}
                                    disabled={isRecording}
                                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm disabled:opacity-50"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>
                                    Record Video
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Audio Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isRecording && recordingType === 'audio') {
                                  stopRecording();
                                } else if (!isRecording) {
                                  startRecording('audio');
                                }
                              }}
                              className={`p-2 rounded-lg transition-all ${isRecording && recordingType === 'audio' ? 'text-red-600 bg-red-100 animate-pulse' : 'text-cyan-600 hover:bg-cyan-100'}`}
                              title={isRecording && recordingType === 'audio' ? "Stop Recording" : "Record Voice Note"}
                            >
                              {isRecording && recordingType === 'audio' ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                            </button>
                          </div>

                          <button
                            type="submit"
                            disabled={(!newPost.trim() && !selectedFile) || loading}
                            className="group px-6 py-2.5 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 relative overflow-hidden text-sm"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <PaperAirplaneIcon className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                            <span className="relative z-10">
                              {loading ? (uploadingMedia.post ? 'Uploading...' : 'Posting...') : 'Share & Earn'}
                            </span>
                            {!loading && (
                              <>
                                <SparklesIcon className="w-4 h-4 relative z-10 animate-pulse" />
                                <CreditCoinIcon className="w-4 h-4 relative z-10 text-yellow-300" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Loading State for Posts */}
            {fetchingPosts ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Loading posts...</p>
              </div>
            ) : isFiltering ? (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-sm animate-pulse">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                  <SparklesIcon className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Finding the best matches...</h3>
                <p className="text-blue-500 font-medium text-sm">Filtering for {selectedTag}</p>
              </div>
            ) : (
              <>
                {/* Active Filter Banner */}
                {selectedTag && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 shadow-lg mb-6 flex items-center justify-between text-white transform hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <FireIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold opacity-80">Currently filtering by</p>
                        <h3 className="font-bold text-lg">{selectedTag}</h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTagClick(selectedTag)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm border border-white/10"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-4">
                  {(selectedTag ? posts.filter(p => p.content?.toLowerCase().includes(selectedTag.toLowerCase())) : posts).map((post, index) => (
                    <div
                      key={post._id}
                      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-200/30 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="p-5 pb-3">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <img
                                src={post.userAvatar || '/default-avatar.png'}
                                alt={post.username}
                                className="w-11 h-11 rounded-xl shadow-md ring-2 ring-blue-200/50"
                                onError={(e) => {
                                  e.target.src = '/default-avatar.png';
                                }}
                              />
                              <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <SparklesIcon className="w-2 h-2 text-white" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-800 text-base truncate">{post.username}</h3>
                                <div className="px-2 py-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full flex-shrink-0">
                                  <span className="text-xs font-medium text-blue-600">Skill Swapper</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">{getTimeAgo(post.createdAt)}</span>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <span className="text-xs text-blue-500 font-medium">Public</span>
                              </div>
                            </div>
                          </div>

                          <div className="relative flex-shrink-0">
                            <button
                              onClick={(e) => toggleDropdown(e, 'post', post._id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                            >
                              <EllipsisHorizontalIcon className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {showDropdown[`post-${post._id}`] && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                  className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-20 min-w-[160px] overflow-hidden"
                                >
                                  {((post.userId && user?.id && String(post.userId) === String(user.id)) ||
                                    (post.username && (user?.username || user?.firstName) && post.username === (user.username || user.firstName))) && (
                                      <>
                                        <button
                                          onClick={() => startEditPost(post)}
                                          className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 text-sm transition-colors group"
                                        >
                                          <div className="p-1.5 bg-gray-50 group-hover:bg-blue-100 rounded-lg transition-colors">
                                            <PencilIcon className="w-4 h-4" />
                                          </div>
                                          <span className="font-medium">Edit my post</span>
                                        </button>
                                        <button
                                          onClick={() => confirmDelete('post', post._id)}
                                          className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 text-sm transition-colors group"
                                        >
                                          <div className="p-1.5 bg-red-50 group-hover:bg-red-100 rounded-lg transition-colors">
                                            <TrashIcon className="w-4 h-4" />
                                          </div>
                                          <span className="font-medium">Delete my post</span>
                                        </button>
                                        <div className="my-1 border-t border-gray-100"></div>
                                      </>
                                    )}
                                  <button
                                    onClick={() => handleShare(post)}
                                    className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-3 text-sm transition-colors group"
                                  >
                                    <div className="p-1.5 bg-gray-50 group-hover:bg-purple-100 rounded-lg transition-colors">
                                      <ShareIcon className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">
                                      {((post.userId && user?.id && String(post.userId) === String(user.id)) ||
                                        (post.username && (user?.username || user?.firstName) && post.username === (user.username || user.firstName))) ? "Share my post" : "Share this post"}
                                    </span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="prose max-w-none">
                          {editingPost === post._id ? (
                            <div className="mb-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-3 border-2 border-blue-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-sm min-h-[80px]"
                                rows="3"
                                placeholder="Edit your post... No character limits!"
                              />
                              <div className="flex items-center justify-end mt-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={cancelEdit}
                                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => savePostEdit(post._id)}
                                    disabled={!editContent.trim()}
                                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                  >
                                    <CheckIcon className="w-2 h-2" />
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            post.content && (
                              <p className="text-gray-700 leading-relaxed text-base mb-3 whitespace-pre-wrap">{renderContentWithHashtags(post.content)}</p>
                            )
                          )}

                          {post.imageUrl && (
                            <div className="mb-3">
                              <img
                                src={post.imageUrl}
                                alt="Post content"
                                className={getImageClasses(post.imageUrl)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  console.warn('Failed to load post image from Cloudinary');
                                }}
                                onClick={() => {
                                  window.open(post.imageUrl, '_blank');
                                }}
                              />
                            </div>
                          )}

                          {post.videoUrl && (
                            <div className="mb-3">
                              <MediaPlayer src={post.videoUrl} type="video" />
                            </div>
                          )}

                          {post.audioUrl && (
                            <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-100 flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                <MicrophoneIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-700 mb-1">Voice Note</p>
                                <MediaPlayer src={post.audioUrl} type="audio" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-5 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          {post.likes?.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <HeartSolid className="w-3 h-3 text-red-500" />
                              <span>{post.likes.length} {post.likes.length === 1 ? 'person likes' : 'people like'} this</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[
                              {
                                action: () => handleLike(post._id),
                                icon: post.likes?.includes(user?.id) ? HeartSolid : HeartIcon,
                                count: post.likes?.length || 0,
                                color: post.likes?.includes(user?.id) ? 'text-red-500' : 'text-gray-500',
                                hoverColor: 'hover:text-red-500 hover:bg-red-50',
                                label: 'Like'
                              },
                              {
                                action: () => toggleComments(post._id),
                                icon: ChatBubbleLeftIcon,
                                count: post.comments?.length || 0,
                                color: 'text-gray-500',
                                hoverColor: 'hover:text-blue-500 hover:bg-blue-50',
                                label: 'Comment'
                              },
                              {
                                action: () => handleUpvote(post._id),
                                icon: post.upvotes?.includes(user?.id) ? ArrowUpSolid : ArrowUpIcon,
                                count: post.upvotes?.length || 0,
                                color: post.upvotes?.includes(user?.id) ? 'text-green-500' : 'text-gray-500',
                                hoverColor: 'hover:text-green-500 hover:bg-green-50',
                                label: 'Upvote'
                              }
                            ].map((item, index) => (
                              <button
                                key={index}
                                onClick={user ? item.action : () => toast.error('Please log in to interact with posts')}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 ${item.color} ${item.hoverColor} group hover:scale-105`}
                              >
                                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">{item.count}</span>
                                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                                  {item.label}
                                </span>
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-1">
                            <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all hover:scale-110">
                              <BookmarkIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleShare(post)}
                              className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all hover:scale-110"
                            >
                              <ShareIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {showComments[post._id] && user && (
                        <div className="border-t border-gray-100 bg-gradient-to-r from-blue-50/30 to-purple-50/30 p-4">
                          <div className="flex gap-3 mb-4">
                            <img
                              src={user?.imageUrl || '/default-avatar.png'}
                              alt="Your avatar"
                              className="w-8 h-8 rounded-lg shadow-md flex-shrink-0"
                              onError={(e) => {
                                e.target.src = '/default-avatar.png';
                              }}
                            />
                            <div className="flex-1 flex flex-col gap-2">
                              {commentFileType[post._id] && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="relative p-2 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-center min-h-[60px]"
                                >
                                  {commentFileType[post._id] === 'image' && (
                                    <div className="relative group">
                                      <img
                                        src={commentFilePreview[post._id]}
                                        alt="Preview"
                                        className="h-16 object-contain rounded-lg shadow-sm"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeMedia(true, post._id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <XMarkIcon className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}

                                  {commentFileType[post._id] === 'video' && (
                                    <div className="w-full relative group">
                                      <MediaPlayer src={commentFilePreview[post._id]} type="video" />
                                      <button
                                        type="button"
                                        onClick={() => removeMedia(true, post._id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md z-10"
                                      >
                                        <XMarkIcon className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}

                                  {commentFileType[post._id] === 'audio' && (
                                    <div className="w-full relative group">
                                      <MediaPlayer src={commentFilePreview[post._id]} type="audio" />
                                      <button
                                        type="button"
                                        onClick={() => removeMedia(true, post._id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md z-10"
                                      >
                                        <XMarkIcon className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}

                                  {uploadingMedia.comment && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-xl z-20"
                                    >
                                      <div className="scale-75">
                                        <WaveLoader text="Sending..." />
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              )}
                              <div className="flex gap-2">
                                <textarea
                                  value={commentText[post._id] || ''}
                                  onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                                  placeholder="Share your thoughts... (Attach image, video or audio below)"
                                  className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all bg-white/80 backdrop-blur-sm text-sm resize-none min-h-[40px]"
                                  rows="2"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleComment(post._id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleComment(post._id)}
                                  disabled={uploadingMedia.comment}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 flex items-center gap-1 text-sm self-stretch flex-shrink-0 disabled:opacity-50"
                                >
                                  <PaperAirplaneIcon className="w-3 h-3" />
                                  <span className="hidden sm:inline">{uploadingMedia.comment ? 'Sending...' : 'Reply'}</span>
                                </button>
                              </div>

                              {/* Comment Media Controls */}
                              <div className="flex gap-1 items-center mb-2 px-1">
                                <button type="button" onClick={() => triggerMediaSelect('image/*', true, post._id)} title="Attach Image" className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors">
                                  <PhotoIcon className="w-4 h-4" />
                                </button>

                                {/* Video Menu */}
                                <div className="relative video-menu-container">
                                  <button
                                    type="button"
                                    onClick={() => setShowVideoMenu({ post: false, comment: post._id })}
                                    className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-all"
                                    title="Add Video"
                                  >
                                    <VideoCameraIcon className="w-4 h-4" />
                                  </button>

                                  {showVideoMenu.comment === post._id && (
                                    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 min-w-[150px]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowVideoMenu({ post: false, comment: null });
                                          triggerMediaSelect('video/*', true, post._id);
                                        }}
                                        className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-xs"
                                      >
                                        <VideoCameraIcon className="w-3 h-3" />
                                        Browse Device
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowVideoMenu({ post: false, comment: null });
                                          startRecording('video', true, post._id);
                                        }}
                                        disabled={isRecording}
                                        className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-xs disabled:opacity-50"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-0.5"></span>
                                        Record Video
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Audio Toggle */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isRecording && recordingType === 'audio') {
                                      stopRecording();
                                    } else if (!isRecording) {
                                      startRecording('audio', true, post._id);
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg transition-all ${isRecording && recordingType === 'audio' ? 'text-red-500 bg-red-100 animate-pulse' : 'text-cyan-500 hover:bg-cyan-100'}`}
                                  title={isRecording && recordingType === 'audio' ? "Stop Recording" : "Record Voice Note"}
                                >
                                  {isRecording && recordingType === 'audio' ? <StopIcon className="w-4 h-4" /> : <MicrophoneIcon className="w-4 h-4" />}
                                </button>
                              </div>

                              <AnimatePresence>
                                {isRecording && recordingType && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, height: 0 }}
                                    animate={{ opacity: 1, scale: 1, height: 'auto' }}
                                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col w-full mt-2 overflow-hidden"
                                  >
                                    <div className="flex justify-between items-center gap-2 text-xs text-red-700 px-3 py-2 bg-red-50 border border-red-200 rounded-lg shadow-sm w-full">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                        {recordingType === 'video' ? <VideoCameraIcon className="w-3.5 h-3.5" /> : <MicrophoneIcon className="w-3.5 h-3.5" />}
                                        <span className="font-medium">Recording {recordingType}... {formatTime(recordingTime)}</span>
                                      </div>
                                      <button onClick={stopRecording} className="font-bold bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors flex items-center gap-1 shadow-sm">
                                        <StopIcon className="w-3 h-3" /> Stop
                                      </button>
                                    </div>

                                    {recordingType === 'video' && streamRef.current && (
                                      <LiveVideoPreview stream={streamRef.current} />
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>

                            </div>
                          </div>

                          <div className="space-y-3">
                            {post.comments?.map((comment) => (
                              <div key={comment._id} className="flex gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3">
                                <img
                                  src={comment.userAvatar || '/default-avatar.png'}
                                  alt={comment.username}
                                  className="w-8 h-8 rounded-lg shadow-md flex-shrink-0"
                                  onError={(e) => {
                                    e.target.src = '/default-avatar.png';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <span className="font-semibold text-gray-800 text-sm truncate">{comment.username}</span>
                                      <span className="text-xs text-gray-500 flex-shrink-0">{getTimeAgo(comment.createdAt)}</span>
                                    </div>

                                    {((comment.userId && user?.id && String(comment.userId) === String(user.id)) ||
                                      (comment.username && (user?.username || user?.firstName) && comment.username === (user.username || user.firstName))) && (
                                        <div className="relative flex-shrink-0">
                                          <button
                                            onClick={(e) => toggleDropdown(e, 'comment', `${post._id}-${comment._id}`)}
                                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                          >
                                            <EllipsisHorizontalIcon className="w-3 h-3" />
                                          </button>

                                          {showDropdown[`comment-${post._id}-${comment._id}`] && (
                                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[100px]">
                                              <button
                                                onClick={() => startEditComment(comment, post._id)}
                                                className="w-full px-3 py-1 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                              >
                                                <PencilIcon className="w-3 h-3" />
                                                Edit
                                              </button>
                                              <button
                                                onClick={() => confirmDelete('comment', comment._id, post._id)}
                                                className="w-full px-3 py-1 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                              >
                                                <TrashIcon className="w-3 h-3" />
                                                Delete
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                  </div>

                                  {editingComment === `${post._id}-${comment._id}` ? (
                                    <div>
                                      <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-xs resize-none min-h-[60px]"
                                        rows="2"
                                        placeholder="Edit your comment... No character limits!"
                                      />
                                      <div className="flex items-center justify-end mt-2">
                                        <div className="flex gap-2">
                                          <button
                                            onClick={cancelEdit}
                                            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => saveCommentEdit(post._id, comment._id)}
                                            disabled={!editContent.trim()}
                                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                          >
                                            <CheckIcon className="w-2 h-2" />
                                            Save
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2 text-sm break-words whitespace-pre-wrap text-gray-700 mt-1">
                                      {comment.content && <p>{renderContentWithHashtags(comment.content)}</p>}

                                      {comment.imageUrl && (
                                        <img src={comment.imageUrl} alt="Comment media" className="max-h-32 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(comment.imageUrl, '_blank')} />
                                      )}
                                      {comment.videoUrl && (
                                        <MediaPlayer src={comment.videoUrl} type="video" />
                                      )}
                                      {comment.audioUrl && (
                                        <MediaPlayer src={comment.audioUrl} type="audio" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {!fetchingPosts && posts.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="relative mb-6">
                  <div className="text-6xl mb-4 animate-bounce">🚀</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Ready to Launch?
                </h3>
                <p className="text-gray-600 text-base max-w-sm mx-auto mb-4">
                  Be the pioneer! Share your first amazing insight and start building our incredible community.
                </p>
                <div className="flex items-center justify-center gap-2 text-yellow-600">
                  <CreditCoinIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Plus earn credits for every post! No word limits!</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Trending Topics */}
        <div className="w-full md:w-80 shrink-0 md:sticky md:top-28 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-2xl p-5 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-orange-500" />
              Hot Topics
            </h3>
            <div className="space-y-3">
              {trendingTags.map((tag, idx) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleTagClick(tag)}
                  className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group"
                >
                  <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{tag}</span>
                  <span className="text-xs text-gray-400 font-medium bg-gray-100 group-hover:bg-blue-100 px-2 py-1 rounded-full transition-colors">
                    +{Math.floor(Math.random() * 50) + 10} posts
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-5 shadow-lg text-white relative overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <SparklesIcon className="w-16 h-16" />
            </div>
            <h3 className="font-bold text-lg mb-2 relative z-10">Creator Program 🚀</h3>
            <p className="text-sm text-blue-100 mb-4 relative z-10">Earn SkillSwap credits by sharing valuable insights with the community.</p>
            <button className="bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors w-full relative z-10 shadow-sm">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
