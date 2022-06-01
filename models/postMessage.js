import mongoose from 'mongoose';

//creating Schema for posts
const postSchema = mongoose.Schema({
  title: String,
  message: String,
  name: String,
  creator: String,
  tags: [String],
  selectedFile: String,
  likes: {
    type: [String],
    default: [],
  },
  comments: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

//creating models for posts
const PostMessage = mongoose.model('postMessage', postSchema);

export default PostMessage;
