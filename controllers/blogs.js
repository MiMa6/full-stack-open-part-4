const blogRouter = require('express').Router();
const logger = require('../utils/logger');
const Blog = require('../models/blog');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({});
  logger.info(blogs);
  response.json(blogs);
});

blogRouter.post('/', (request, response) => {
  const blog = new Blog(request.body);

  blog
    .save()
    .then((result) => {
      response.status(201).json(result);
    });
});

module.exports = blogRouter;
