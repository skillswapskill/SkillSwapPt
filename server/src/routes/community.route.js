import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../models/community.model.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Image upload endpoint
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📷 Uploading image to Cloudinary...');

    const base64String = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64String}`;

    const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
      folder: 'community_posts',
      public_id: `post_${Date.now()}_${Math.round(Math.random() * 1E9)}`,
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    const imageUrl = cloudinaryResponse.secure_url;

    console.log('✅ Image uploaded to Cloudinary:', imageUrl);
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      publicId: cloudinaryResponse.public_id
    });
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// GET all posts with sorting options
router.get('/posts', async (req, res) => {
  try {
    const { sort = 'latest', limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    let sortOptions = {};
    
    switch (sort) {
      case 'trending':
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const posts = await Post.find({ 
          createdAt: { $gte: weekAgo } 
        })
        .sort({ engagement: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);
        
        return res.status(200).json({
          success: true,
          posts,
          total: posts.length,
          page: parseInt(page)
        });
        
      case 'popular':
        sortOptions = { engagement: -1, createdAt: -1 };
        break;
        
      case 'latest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }
    
    const posts = await Post.find()
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Post.countDocuments();
    
    res.status(200).json({
      success: true,
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
});

// POST create new post
router.post('/posts', async (req, res) => {
  try {
    const { content, userId, username, userAvatar, tags, imageUrl, imagePublicId } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!content && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Post must have either content or an image'
      });
    }

    if (content && content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Post content too long (max 500 characters)'
      });
    }

    const newPost = new Post({
      content: content || '',
      imageUrl: imageUrl || '',
      imagePublicId: imagePublicId || '',
      userId,
      username,
      userAvatar,
      likes: [],
      upvotes: [],
      comments: [],
      tags: tags || []
    });

    await newPost.save();
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
});

// PUT update post
router.put('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, userId } = req.body;

    if (!content || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Post content too long (max 500 characters)'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to edit this post'
      });
    }

    post.content = content.trim();
    post.updatedAt = Date.now();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating post',
      error: error.message
    });
  }
});

// PUT update comment
router.put('/posts/:postId/comments/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content, userId } = req.body;

    if (!content || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment too long (max 500 characters)'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to edit this comment'
      });
    }

    comment.content = content.trim();
    post.updatedAt = Date.now();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message
    });
  }
});

// DELETE comment
router.delete('/posts/:postId/comments/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this comment'
      });
    }

    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
});

// POST like/unlike a post
router.post('/posts/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likedIndex = post.likes.indexOf(userId);
    
    if (likedIndex > -1) {
      post.likes.splice(likedIndex, 1);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    
    res.status(200).json({
      success: true,
      message: likedIndex > -1 ? 'Post unliked' : 'Post liked',
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing like',
      error: error.message
    });
  }
});

// POST upvote/remove upvote from a post
router.post('/posts/:postId/upvote', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const upvoteIndex = post.upvotes.indexOf(userId);
    
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      post.upvotes.push(userId);
    }

    await post.save();
    
    res.status(200).json({
      success: true,
      message: upvoteIndex > -1 ? 'Upvote removed' : 'Post upvoted',
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing upvote',
      error: error.message
    });
  }
});

// POST add comment to a post
router.post('/posts/:postId/comment', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, userId, username, userAvatar } = req.body;

    if (!content || !userId || !username) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment too long (max 500 characters)'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const newComment = {
      content,
      userId,
      username,
      userAvatar,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error.message
    });
  }
});

// DELETE a post
router.delete('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this post'
      });
    }

    // Delete associated image from Cloudinary if exists
    if (post.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
        console.log('✅ Image deleted from Cloudinary:', post.imagePublicId);
      } catch (error) {
        console.warn('⚠️ Failed to delete image from Cloudinary:', error);
      }
    }

    await Post.findByIdAndDelete(postId);
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
});

// GET user's posts
router.get('/posts/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Post.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user posts',
      error: error.message
    });
  }
});

export default router;
