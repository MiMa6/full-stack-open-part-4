const dummy = ((blogs) => 1);

const totalLikes = (blogs) => (blogs.lenght === 0
  ? 0
  : blogs.reduce((sum, item) => sum + item.likes, 0));

module.exports = {
  dummy,
  totalLikes,
};
