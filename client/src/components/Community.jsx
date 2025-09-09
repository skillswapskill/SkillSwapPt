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
import { useApi } from '../hooks/useApi'; // Adjust path as needed

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

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    console.log('📷 Image selected:', file.name, file.size);
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    console.log('🗑️ Removing selected image');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
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
      // Fallback for older browsers
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

  const handleCreatePost = async (e) => {
    e.preventDefault();
    console.log('🚀 handleCreatePost called');
    
    if (!validateUserData()) return;
    
    if (!newPost.trim() && !selectedImage) {
      console.warn('⚠️ Post content and image are both empty');
      alert('Please enter some content or select an image for your post');
      return;
    }

    if (newPost.length > 500) {
      console.warn('⚠️ Post content too long');
      alert('Post content is too long (max 500 characters)');
      return;
    }
    
    setLoading(true);
    clearError('createPost');
    
    try {
      let imageUrl = '';
      let imagePublicId = '';
      
      // Upload image to Cloudinary if selected
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
      
      console.log('📤 Creating post with data:', postData);
      console.log('🌐 API Base URL:', baseUrl);
      
      const response = await apiClient.post('/api/community/posts', postData);
      console.log('✅ Post created successfully:', response.data);
      
      // Reset form
      setNewPost('');
      removeImage();
      await fetchPosts();
      alert('Post created successfully! 🎉');
      
    } catch (error) {
      handleError(error, 'createPost');
      alert(`Error creating post: ${error.response?.data?.message || error.message}`);
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

  const handleComment = async (postId) => {
    if (!validateUserData()) return;
    
    const content = commentText[postId];
    if (!content?.trim()) {
      console.warn('⚠️ Comment content is empty');
      alert('Please enter a comment');
      return;
    }

    if (content.length > 500) {
      console.warn('⚠️ Comment too long');
      alert('Comment is too long (max 500 characters)');
      return;
    }
    
    console.log(`💬 Adding comment to post: ${postId}`);
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

  // Dynamic image sizing based on aspect ratio
  const getImageClasses = (imageUrl) => {
    return "w-full h-auto max-h-[600px] object-contain rounded-2xl border border-gray-200 shadow-sm cursor-pointer hover:opacity-95 transition-opacity";
  };

  // Loading state while user data is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <br></br>
      <br></br>
      <br></br>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-bounce delay-500"></div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete {deleteConfirm.type}?
              </h3>
              <p className="text-gray-500 mb-6">
                This action cannot be undone. The {deleteConfirm.type} will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, type: '', id: '', postId: '' })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Share Post
              </h3>
              <button 
                onClick={closeShareModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Post Preview */}
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

            {/* Copy Link */}
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

            {/* Social Media Share Options */}
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
      <div className="max-w-5xl mx-auto px-6 py-2 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <SparklesIcon className="w-8 h-8 text-blue-500 animate-pulse" />
                <div className="absolute inset-0 w-8 h-8 bg-blue-500/20 rounded-full blur animate-ping"></div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                SkillSwap Community
              </h1>
            </div>
            <div className="hidden md:flex items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full px-4 py-2 border border-blue-200/50">
              <FireIcon className="w-4 h-4 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Hot discussions</span>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-white/80 rounded-full p-1 shadow-lg border border-blue-200/50">
            {[
              { id: 'trending', label: '🔥 Trending', icon: FireIcon },
              { id: 'latest', label: '⚡ Latest', icon: SparklesIcon },
              { id: 'popular', label: '🌟 Popular', icon: ArrowUpIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4 relative">
        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <h3 className="font-bold text-red-800 mb-2">Errors:</h3>
            {Object.entries(errors).map(([key, value]) => (
              <div key={key} className="text-red-700 text-sm">
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
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
            <p className="text-yellow-800">Please log in to create posts and interact with the community.</p>
          </div>
        )}

        {/* Create Post Card */}
        {user && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-200/50 mb-8 overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 p-8">
              <form onSubmit={handleCreatePost}>
                <div className="flex gap-6">
                  <div className="relative">
                    <img
                      src={user?.imageUrl || '/default-avatar.png'}
                      alt="Your avatar"
                      className="w-16 h-16 rounded-2xl shadow-lg ring-4 ring-blue-200/50 group-hover:ring-blue-300/70 transition-all duration-300"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                        console.warn('Failed to load user avatar, using default');
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="relative">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="🚀 Share your knowledge, ask questions, or inspire fellow learners!"
                        className="w-full p-6 border-2 border-blue-100 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white/50 backdrop-blur-sm text-gray-700 placeholder-gray-500"
                        rows="4"
                        maxLength={500}
                      />
                      <div className={`absolute bottom-4 right-4 text-xs ${newPost.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                        {newPost.length}/500
                      </div>
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-60 w-full object-contain rounded-2xl border-2 border-blue-100"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                            <div className="text-white text-center">
                              <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                              <p>Hold Tight Grab a coffee...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-3">
                        {/* Hidden file input */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        {/* Photo button with proper click handler */}
                        <button
                          type="button"
                          onClick={triggerImageSelect}
                          className="p-3 text-blue-500 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                          title="Add image"
                        >
                          <PhotoIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          type="button"
                          className="p-3 text-yellow-500 hover:bg-yellow-100 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                          title="Add emoji"
                        >
                          <FaceSmileIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                          type="button"
                          className="p-3 text-orange-500 hover:bg-orange-100 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                          title="Add fire"
                        >
                          <FireIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={(!newPost.trim() && !selectedImage) || loading || newPost.length > 500}
                        className="group px-8 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <PaperAirplaneIcon className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="relative z-10">
                          {loading ? (uploadingImage ? 'Uploading...' : 'Posting...') : 'Share Magic'}
                        </span>
                        {!loading && (
                          <SparklesIcon className="w-4 h-4 relative z-10 animate-pulse" />
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
            <p className="text-gray-600">Loading posts...</p>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div 
              key={post._id} 
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200/30 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Post Header */}
              <div className="p-8 pb-4">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={post.userAvatar || '/default-avatar.png'}
                        alt={post.username}
                        className="w-14 h-14 rounded-2xl shadow-lg ring-2 ring-blue-200/50"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 text-lg">{post.username}</h3>
                        <div className="px-2 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full">
                          <span className="text-xs font-medium text-blue-600">Skill Swapper</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">{getTimeAgo(post.createdAt)}</span>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-sm text-blue-500 font-medium">Public</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Post Options Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleDropdown(e, 'post', post._id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                    
                    {showDropdown[`post-${post._id}`] && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-20 min-w-[150px]">
                        {post.userId === user?.id && (
                          <>
                            <button
                              onClick={() => startEditPost(post)}
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <PencilIcon className="w-4 h-4" />
                              Edit Post
                            </button>
                            <button
                              onClick={() => confirmDelete('post', post._id)}
                              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete Post
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleShare(post)}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ShareIcon className="w-4 h-4" />
                          Share Post
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Post Content */}
                <div className="prose max-w-none">
                  {editingPost === post._id ? (
                    <div className="mb-4">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-4 border-2 border-blue-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
                        rows="3"
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{editContent.length}/500</span>
                        <div className="flex gap-2">
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => savePostEdit(post._id)}
                            disabled={!editContent.trim()}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                          >
                            <CheckIcon className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    post.content && (
                      <p className="text-gray-700 leading-relaxed text-lg mb-4">{post.content}</p>
                    )
                  )}
                  
                  {/* Dynamic Post Image */}
                  {post.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={post.imageUrl}
                        alt="Post content"
                        className={getImageClasses(post.imageUrl)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          console.warn('Failed to load post image from Cloudinary');
                        }}
                        onClick={() => {
                          // Open image in new tab
                          window.open(post.imageUrl, '_blank');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Post Actions */}
              <div className="px-8 pb-6">
                <div className="flex items-center gap-2 mb-4">
                  {post.likes?.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <HeartSolid className="w-4 h-4 text-red-500" />
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
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 ${item.color} ${item.hoverColor} group hover:scale-105`}
                      >
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">{item.count}</span>
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-3 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all hover:scale-110">
                      <BookmarkIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleShare(post)}
                      className="p-3 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-2xl transition-all hover:scale-110"
                    >
                      <ShareIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post._id] && user && (
                <div className="border-t border-gray-100 bg-gradient-to-r from-blue-50/30 to-purple-50/30 p-8">
                  {/* Add Comment */}
                  <div className="flex gap-4 mb-6">
                    <img
                      src={user?.imageUrl || '/default-avatar.png'}
                      alt="Your avatar"
                      className="w-10 h-10 rounded-xl shadow-md"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <div className="flex-1 flex gap-3">
                      <input
                        type="text"
                        value={commentText[post._id] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                        placeholder="Share your thoughts..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all bg-white/80 backdrop-blur-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                        maxLength={500}
                      />
                      <button
                        onClick={() => handleComment(post._id)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Reply</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {post.comments?.map((comment) => (
                      <div key={comment._id} className="flex gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                        <img
                          src={comment.userAvatar || '/default-avatar.png'}
                          alt={comment.username}
                          className="w-10 h-10 rounded-xl shadow-md"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png';
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800">{comment.username}</span>
                              <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                            </div>
                            
                            {/* Comment Options Dropdown */}
                            {comment.userId === user?.id && (
                              <div className="relative">
                                <button
                                  onClick={(e) => toggleDropdown(e, 'comment', `${post._id}-${comment._id}`)}
                                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                >
                                  <EllipsisHorizontalIcon className="w-4 h-4" />
                                </button>
                                
                                {showDropdown[`comment-${post._id}-${comment._id}`] && (
                                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
                                    <button
                                      onClick={() => startEditComment(comment, post._id)}
                                      className="w-full px-3 py-1 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <PencilIcon className="w-3 h-3" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => confirmDelete('comment', comment._id, post._id)}
                                      className="w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all text-sm"
                                maxLength={500}
                              />
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-400">{editContent.length}/500</span>
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
                            <p className="text-gray-700 text-sm">{comment.content}</p>
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

        {/* Empty State */}
        {!fetchingPosts && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="text-8xl mb-4 animate-bounce">🚀</div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Ready to Launch?
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              Be the pioneer! Share your first amazing insight and start building our incredible community.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
