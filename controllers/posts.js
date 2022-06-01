import mongoose from 'mongoose';
import PostMessage from '../models/postMessage.js';

const getPosts = async (req, res) => {
  const { page } = req.query;
  try {
    const LIMIT = 8;
    const startOfIndex = (Number(page) - 1) * LIMIT;
    const total = await PostMessage.countDocuments({});
    const posts = await PostMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startOfIndex);
    res.status(200).json({
      data: posts,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getPost = async (req, res) => {
  const { id: _id } = req.params;

  try {
    const post = await PostMessage.findById(_id);
    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//QUERY --> '/posts?query=1' --> query = 1
//PARAMS --> '/posts/:id=123' --> id = 123

const getPostBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;
  try {
    const title = new RegExp(searchQuery, 'i');
    const searchPost = await PostMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(',') } }],
    });
    res.json({ data: searchPost });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  const post = req.body;
  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send('No post with ID found');

  const updatedPost = await PostMessage.findByIdAndUpdate(
    _id,
    { ...post, _id },
    { new: true }
  );
  res.json(updatedPost);
};

const deletePost = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send('No post with ID found');

  await PostMessage.findByIdAndRemove(_id);
  res.json({ message: 'Post deleted successfully' });
};

const likePost = async (req, res) => {
  const { id: _id } = req.params;

  //if user is not authenticated
  if (!req.userId) return res.json({ message: 'Unauthenticated' });

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send('No post with ID found');

  const post = await PostMessage.findById(_id);

  //checking if the user id is already there in the like section or not
  const index = post?.likes?.findIndex((id) => id === String(req.userId));

  //if user id is already in there then this is disliking the post logic
  if (index === -1) {
    //like the post
    post.likes.push(req.userId);
  } else {
    //dislike a post
    post.likes = post?.likes?.filter((id) => id !== String(req.userId));
  }
  const likedPost = await PostMessage.findByIdAndUpdate(_id, post, {
    new: true,
  });
  res.send(likedPost);
};

const commentPost = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  try {
    //getting the post from the db
    const post = await PostMessage.findById(id);

    //pushing the post to db
    post.comments.push(value);

    //updating the post with the new comment in db
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
      new: true,
    });

    res.json(updatedPost);
  } catch (error) {
    console.log(error);
  }
};

export {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPostBySearch,
  commentPost,
};
