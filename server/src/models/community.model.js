import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  userId: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    required: true 
  },
  userAvatar: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const postSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: false, // Allow posts with just images
    maxlength: 500
  },
  imageUrl: {
    type: String,
    required: false
  },
  imagePublicId: {
    type: String,
    required: false // Store Cloudinary public_id for deletion
  },
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  username: { 
    type: String, 
    required: true 
  },
  userAvatar: { 
    type: String, 
    required: true 
  },
  likes: [{ 
    type: String,
    index: true
  }],
  upvotes: [{ 
    type: String,
    index: true  
  }],
  comments: [commentSchema],
  tags: [{
    type: String,
    lowercase: true
  }],
  isPopular: {
    type: Boolean,
    default: false
  },
  engagement: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Custom validation: require either content or image
postSchema.pre('save', function(next) {
  if (!this.content && !this.imageUrl) {
    const error = new Error('Post must have either content or an image');
    return next(error);
  }
  
  const likesWeight = 1;
  const upvotesWeight = 2;
  const commentsWeight = 3;
  
  this.engagement = (this.likes.length * likesWeight) + 
                   (this.upvotes.length * upvotesWeight) + 
                   (this.comments.length * commentsWeight);
  
  this.isPopular = this.engagement > 10;
  this.updatedAt = Date.now();
  next();
});

// Indexes for better performance
postSchema.index({ createdAt: -1 });
postSchema.index({ engagement: -1 });
postSchema.index({ userId: 1, createdAt: -1 });

const Post = mongoose.model('CommunityPost', postSchema);

export default Post;
