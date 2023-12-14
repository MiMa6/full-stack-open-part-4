/* eslint-disable no-console */
const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
const dummy = ((blogs) => 1);

const totalLikes = (blogs) => (blogs.lenght === 0
  ? 0
  : blogs.reduce((sum, item) => sum + item.likes, 0));

const favoriteBlog = (blogs) => {
  if (blogs.length > 0) {
    const blogWithMostLikes = (blogs.reduce(
      (previous, current) => (previous.likes > current.likes
        ? previous
        : current),
    )
    );
    const blogWithMostLikesResult = {
      title: blogWithMostLikes.title,
      author: blogWithMostLikes.author,
      likes: blogWithMostLikes.likes,
    };
    console.log(blogWithMostLikesResult);
    return blogWithMostLikesResult;
  }
  return {};
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return {};
  }
  const groupBlogsByAuthor = _.groupBy(blogs, 'author');
  // eslint-disable-next-line function-paren-newline
  const mostBlogsByAuthorName = _.maxBy(
    _.keys(groupBlogsByAuthor), (author) => groupBlogsByAuthor[author].length);
  const numberOfBlogsByAuthor = groupBlogsByAuthor[mostBlogsByAuthorName].length;

  const mostBlogsByAuthor = {
    author: mostBlogsByAuthorName,
    blogs: numberOfBlogsByAuthor,
  };
  console.log(mostBlogsByAuthor);
  return mostBlogsByAuthor;
};
module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
