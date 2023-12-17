/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const blogRouter = require('express').Router();
const middleware = require('../utils/middleware');
const logger = require('../utils/logger');
const Blog = require('../models/blog');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  logger.info(blogs);
  response.json(blogs);
});

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { body, user } = request;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user.id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const { params, user } = request;

  const blog = await Blog.findById(params.id);

  if (blog === null) {
    return response.status(400).json({ error: `No blog  with id: ${params.id} in db` });
  }

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: `Only blog creator can delete blog with id: ${params.id}` });
  }

  await Blog.findByIdAndDelete(params.id);
  response.status(204).end();
});

blogRouter.put('/:id', async (request, response) => {
  const { body } = request;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true });
  response.json(updatedBlog);
});

module.exports = blogRouter;
