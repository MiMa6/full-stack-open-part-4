const supertest = require('supertest');
const mongoose = require('mongoose');

const blogHelper = require('../utils/blog_helper');
const userHelper = require('../utils/user_helper');
const app = require('../app');

const api = supertest(app);

const Blog = require('../models/blog');
const User = require('../models/user');

let testUserObjectId = null;
let token = null;

beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});

  const testUser = userHelper.initialUsers[0];

  await api
    .post('/api/users')
    .send(testUser)
    .expect(201);

  const testUserLoggged = await api
    .post('/api/login')
    .send({ username: testUser.username, password: testUser.password })
    .expect(200);

  token = testUserLoggged.body.token;

  const testUserObject = await User.findOne({ username: testUser.username });
  testUserObjectId = testUserObject._id.toString();

  const blogObjects = blogHelper.initialBlogs
    .map((blog) => new Blog({ ...blog, user: testUserObject._id }));
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

describe('Creating and modifying blogs', () => {
  test('Successfull creation of blog post', async () => {
    const newBlog = {
      title: 'Kokkikoulu',
      author: 'Seppo Kakkunen',
      url: 'http://fakekokkikoulu.com',
      likes: 1000,
      user: testUserObjectId,
    };

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await blogHelper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogHelper.initialBlogs.length + 1);

    const blogTitles = blogsAtEnd.map((blog) => blog.title);
    expect(blogTitles).toContain('Kokkikoulu');
  });

  test('Blog without likes is added, likes is set as default to 0', async () => {
    const newBlog = {
      title: 'Juoksukoulu',
      author: 'Jaakko Jalkanen',
      url: 'http://fakejaakonlenkkipolku.com',
      user: testUserObjectId,
    };

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await blogHelper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogHelper.initialBlogs.length + 1);

    const addedBlog = blogsAtEnd.find((blog) => blog.title === 'Juoksukoulu');
    expect(addedBlog.likes).toEqual(0);
  });

  test('Blog without title or url is not added', async () => {
    const newBlogNoUrl = {
      title: 'Lentokoulu',
      author: 'Leevi Lentokone',
      likes: 10,
      user: testUserObjectId,
    };

    const newBlogNoTitle = {
      author: 'Leevi Lentokone',
      url: 'http://fakeleevilentaja.com',
      likes: 10,
      user: testUserObjectId,
    };

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
      .send(newBlogNoUrl)
      .expect(400);

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
      .send(newBlogNoTitle)
      .expect(400);

    const blogsAtEnd = await blogHelper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogHelper.initialBlogs.length);
  });

  test('Blog can be deleted', async () => {
    const blogsAtstart = await blogHelper.blogsInDb();
    const blogToDeleteId = blogsAtstart[0].id;

    await api
      .delete(`/api/blogs/${blogToDeleteId}`)
      .set('authorization', `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await blogHelper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogHelper.initialBlogs.length - 1);
  });

  test('Blog can be modified', async () => {
    const blogsAtstart = await blogHelper.blogsInDb();
    const blogToModify = blogsAtstart[0];

    const modifiedBlogInitial = {
      title: blogToModify.title,
      author: blogToModify.author,
      url: blogToModify.url,
      likes: 222,
    };

    await api
      .put(`/api/blogs/${blogToModify.id}`)
      .set('authorization', `Bearer ${token}`)
      .send(modifiedBlogInitial)
      .expect(200);

    const blogsAtEnd = await blogHelper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogHelper.initialBlogs.length);

    const modifiedBlogDb = blogsAtEnd.find((blog) => blog.title === blogToModify.title);
    expect(modifiedBlogDb.likes).toEqual(222);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
