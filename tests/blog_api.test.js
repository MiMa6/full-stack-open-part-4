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

test('Blog without likes is added, likes is set as default to 0', async () => {
  const newBlog = {
    title: 'Juoksukoulu',
    author: 'Jaakko Jalkanen',
    url: 'http://fakejaakonlenkkipolku.com',
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const addedBlog = blogsAtEnd.find((blog) => blog.title === 'Juoksukoulu');
  expect(addedBlog.likes).toEqual(0);
});

test('Blog without title or url is not added', async () => {
  const newBlogNoUrl = {
    title: 'Lentokoulu',
    author: 'Leevi Lentokone',
    likes: 10,
  };

  const newBlogNoTitle = {
    author: 'Leevi Lentokone',
    url: 'http://fakeleevilentaja.com',
    likes: 10,
  };

  await api
    .post('/api/blogs')
    .send(newBlogNoUrl)
    .expect(400);

  await api
    .post('/api/blogs')
    .send(newBlogNoTitle)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test('Blog can be deleted', async () => {
  const blogsAtstart = await helper.blogsInDb();
  const blogToDeleteId = blogsAtstart[0].id;

  await api
    .delete(`/api/blogs/${blogToDeleteId}`)
    .expect(204);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);
});

test('Blog can be modified', async () => {
  const blogsAtstart = await helper.blogsInDb();
  const blogToModify = blogsAtstart[0];

  const modifiedBlogInitial = {
    title: blogToModify.title,
    author: blogToModify.author,
    url: blogToModify.url,
    likes: 222,
  };

  await api
    .put(`/api/blogs/${blogToModify.id}`)
    .send(modifiedBlogInitial)
    .expect(200);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

  const modifiedBlogDb = blogsAtEnd.find((blog) => blog.title === blogToModify.title);
  expect(modifiedBlogDb.likes).toEqual(222);
});

afterAll(async () => {
  await mongoose.connection.close();
});
