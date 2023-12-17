const User = require('../models/user');

const initialUsers = [
  {
    username: 'admin',
    name: 'aatu',
    password: 'passpassword',
  },
  {
    username: 'mima',
    name: 'miimu',
    password: 'wordwordpass',
  },
];

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  initialUsers,
  usersInDb,
};
