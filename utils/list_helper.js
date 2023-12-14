/* eslint-disable no-console */
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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
