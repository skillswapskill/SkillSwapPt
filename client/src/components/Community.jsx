import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ArrowUpIcon, 
  PaperAirplaneIcon,
  PhotoIcon,
  FaceSmileIcon,
  FireIcon,
  SparklesIcon,
  BookmarkIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon
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
    <circle cx="12" cy="12" r="10" className="text-yellow-400"/>
    <circle cx="12" cy="12" r="7" className="text-yellow-500"/>
    <text x="12" y="16" textAnchor="middle" className="fill-yellow-900 text-xs font-bold">₹</text>
  </svg>
);

const Community = () => {
  const { user, isLoaded } = useUser();
  const { apiClient, baseUrl } = useApi();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      alert('Please log in to perform this action');
      return false;
    }
    
    if (!user.id) {
      console.error('❌ User ID missing');
      alert('User ID is missing. Please try logging out and back in.');
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

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    console.log('📷 Image selected:', file.name, file.size);
    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    console.log('🗑️ Removing selected image');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerImageSelect = () => {
    console.log('📸 Triggering image selection');
    fileInputRef.current?.click();
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
      alert('Post content cannot be empty');
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
      alert('Error updating post: ' + (error.response?.data?.message || error.message));
    }
  };

  const saveCommentEdit = async (postId, commentId) => {
    if (!editContent.trim()) {
      alert('Comment content cannot be empty');
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
      alert('Error updating comment: ' + (error.response?.data?.message || error.message));
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
      alert('Error deleting: ' + (error.response?.data?.message || error.message));
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

  // FIXED: handleCreatePost with NO character limits
  // ENHANCED: handleCreatePost with detailed error debugging
const handleCreatePost = async (e) => {
  e.preventDefault();
  console.log('🚀 handleCreatePost called - DEBUGGING MODE');
  
  if (!validateUserData()) return;
  
  if (!newPost.trim() && !selectedImage) {
    console.warn('⚠️ Post content and image are both empty');
    alert('Please enter some content or select an image for your post');
    return;
  }
  
  setLoading(true);
  clearError('createPost');
  
  try {
    let imageUrl = '';
    let imagePublicId = '';
    
    if (selectedImage) {
      setUploadingImage(true);
      console.log('📷 Uploading image to Cloudinary...');
      
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      const imageResponse = await apiClient.post('/api/community/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      imageUrl = imageResponse.data.imageUrl;
      imagePublicId = imageResponse.data.publicId;
      console.log('✅ Image uploaded to Cloudinary:', imageUrl);
      setUploadingImage(false);
    }

    const postData = {
      content: newPost.trim(),
      userId: user.id,
      username: user.username || user.firstName || 'Unknown User',
      userAvatar: user.imageUrl || '',
      imageUrl: imageUrl,
      imagePublicId: imagePublicId
    };
    
    console.log('📤 SENDING POST DATA:', postData);
    console.log('🌐 API Base URL:', baseUrl);
    console.log('🔑 User ID:', user.id);
    console.log('📝 Content Length:', newPost.trim().length);
    
    const response = await apiClient.post('/api/community/posts', postData);
    console.log('✅ Post created successfully:', response.data);
    
    setNewPost('');
    removeImage();
    await fetchPosts();
    await awardPostCredits(user.id);
    
    alert('Post created successfully! 🎉 You earned 1 credit!');
    
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
    if (error.response?.status === 400) {
      alert(`❌ Bad Request: ${error.response.data.message || 'Invalid data sent to server'}`);
    } else if (error.response?.status === 500) {
      alert(`❌ Server Error: ${error.response.data.message || 'Internal server error'}`);
    } else if (error.response?.data?.message) {
      alert(`❌ Error: ${error.response.data.message}`);
    } else {
      alert(`❌ Unknown Error: ${error.message}`);
    }
  } finally {
    setLoading(false);
    setUploadingImage(false);
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

  // FIXED: handleComment with NO character limits
  const handleComment = async (postId) => {
    if (!validateUserData()) return;
    
    const content = commentText[postId];
    if (!content?.trim()) {
      console.warn('⚠️ Comment content is empty');
      alert('Please enter a comment');
      return;
    }
    
    console.log(`💬 Adding comment to post: ${postId} - NO LIMITS!`);
    clearError('comment');
    
    const commentData = {
      content: content.trim(),
      userId: user.id,
      username: user.username || user.firstName || 'Unknown User',
      userAvatar: user.imageUrl || ''
    };
    
    try {
      const response = await apiClient.post(`/api/community/posts/${postId}/comment`, commentData);
      console.log('✅ Comment added successfully:', response.data);
      
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      await fetchPosts();
    } catch (error) {
      handleError(error, 'comment');
      alert(`Error adding comment: ${error.response?.data?.message || error.message}`);
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
      {creditNotification.show && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm">
            <CreditCoinIcon className="w-6 h-6 animate-bounce" />
            <span className="font-semibold text-sm">{creditNotification.message}</span>
          </div>
        </div>
      )}

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

      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 relative">
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
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-2 relative">
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
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-200/50 mb-6 overflow-hidden group hover:shadow-2xl transition-all duration-500">
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

                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-24 sm:max-h-32 w-full object-cover rounded-xl border-2 border-blue-100"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                            <div className="text-white text-center">
                              <div className="animate-spin w-5 h-5 border-4 border-white border-t-transparent rounded-full mx-auto mb-1"></div>
                              <p className="text-xs">Uploading...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        <button
                          type="button"
                          onClick={triggerImageSelect}
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Add image"
                        >
                          <PhotoIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          type="button"
                          className="p-2 text-yellow-500 hover:bg-yellow-100 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Add emoji"
                        >
                          <FaceSmileIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          type="button"
                          className="p-2 text-orange-500 hover:bg-orange-100 rounded-lg transition-all duration-300 hover:scale-110"
                          title="Add fire"
                        >
                          <FireIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={(!newPost.trim() && !selectedImage) || loading}
                        className="group px-6 py-2.5 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 relative overflow-hidden text-sm"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <PaperAirplaneIcon className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="relative z-10">
                          {loading ? (uploadingImage ? 'Uploading...' : 'Posting...') : 'Share & Earn'}
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
        {fetchingPosts && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading posts...</p>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div 
              key={post._id} 
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-200/30 overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group"
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
                    
                    {showDropdown[`post-${post._id}`] && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 min-w-[140px]">
                        {post.userId === user?.id && (
                          <>
                            <button
                              onClick={() => startEditPost(post)}
                              className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                            >
                              <PencilIcon className="w-3 h-3" />
                              Edit Post
                            </button>
                            <button
                              onClick={() => confirmDelete('post', post._id)}
                              className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"
                            >
                              <TrashIcon className="w-3 h-3" />
                              Delete Post
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleShare(post)}
                          className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <ShareIcon className="w-3 h-3" />
                          Share Post
                        </button>
                      </div>
                    )}
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
                      <p className="text-gray-700 leading-relaxed text-base mb-3 whitespace-pre-wrap">{post.content}</p>
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
                        onClick={user ? item.action : () => alert('Please log in to interact with posts')}
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
                    <div className="flex-1 flex gap-2">
                      <textarea
                        value={commentText[post._id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                        placeholder="Share your thoughts... Write as much as you want - no limits!"
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
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 flex items-center gap-1 text-sm self-end"
                      >
                        <PaperAirplaneIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">Reply</span>
                      </button>
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
                            
                            {comment.userId === user?.id && (
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
                            <p className="text-gray-700 text-sm break-words whitespace-pre-wrap">{comment.content}</p>
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
  );
};

export default Community;
