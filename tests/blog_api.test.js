const supertest = require('supertest');
const mongoose = require('mongoose');

const helper = require('../utils/blog_helper');
const app = require('../app');

const api = supertest(app);

const Blog = require('../models/blog');

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs
    .map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('Blog posts have unique identifier id', async () => {
  const response = await api.get('/api/blogs');
  response.body.forEach((blog) => {
    expect(blog.id).toBeDefined();
  });
});

test('Successfull creation of blog post', async () => {
  const newBlog = {
    title: 'Kokkikoulu',
    author: 'Seppo Kakkunen',
    url: 'http://fakekokkikoulu.com',
    likes: 1000,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const blogTitles = blogsAtEnd.map((blog) => blog.title);
  expect(blogTitles).toContain('Kokkikoulu');
});

afterAll(async () => {
  await mongoose.connection.close();
});
