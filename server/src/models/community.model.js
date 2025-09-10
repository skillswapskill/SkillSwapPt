import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
    // ✅ NO maxlength restriction
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
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: false
    // ✅ NO maxlength restriction
  },
  imageUrl: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
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
    default: ''
  },
  likes: [{
    type: String
  }],
  upvotes: [{
    type: String
  }],
  comments: [commentSchema],
  tags: [{
    type: String
  }],
  engagement: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);

export default Post;
