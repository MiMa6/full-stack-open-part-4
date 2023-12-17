const supertest = require('supertest');
const mongoose = require('mongoose');

const helper = require('../utils/user_helper');
const app = require('../app');

const api = supertest(app);

const User = require('../models/user');

beforeEach(async () => {
  await User.deleteMany({});

  const userObjects = helper.initialUsers
    .map((user) => new User(user));
  const promiseArray = userObjects.map((user) => user.save());
  await Promise.all(promiseArray);
});

test('Users are returned as json', async () => {
  await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

describe('Invalid users are not created ', () => {
  test('User without unique name is not created', async () => {
    const newUser = {
      username: helper.initialUsers[0].username,
      name: 'jaakko',
      password: 'jaakkospassword',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length);
  });

  test('User with username length less than 3 character is not created', async () => {
    const newUser = {
      username: 'mi',
      name: 'mike',
      password: 'wordpass',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length);
  });

  test('User with password length less than 3 character is not created', async () => {
    const newUser = {
      username: 'mikkimakki',
      name: 'mikimaki',
      password: '12',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
