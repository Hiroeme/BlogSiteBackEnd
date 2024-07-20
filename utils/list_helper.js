const dummy = (blogs) => {
  if (blogs) {
    return 1
  }
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, curr) => acc + curr.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((acc, curr) => acc.likes > curr.likes ? acc : curr, blogs[0])
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }
  let authors = {}
  let maxAuthor, maxValue = 0

  blogs.forEach((blog) => {
    if (!(blog.author in authors)) {
      authors[blog.author] = 1
    } else {
      authors[blog.author] += 1
    }

    if (authors[blog.author] > maxValue) {
      maxValue = authors[blog.author]
      maxAuthor = blog.author
    }
  })

  const result = {
    author: maxAuthor,
    blogs: maxValue
  }

  return result
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return undefined
  }
  let authors = {}
  let maxAuthor, maxValue = 0

  blogs.forEach((blog) => {
    if (!(blog.author in authors)) {
      authors[blog.author] = blog.likes
    } else {
      authors[blog.author] += blog.likes
    }

    if (authors[blog.author] > maxValue) {
      maxValue = authors[blog.author]
      maxAuthor = blog.author
    }
  })

  const result = {
    author: maxAuthor,
    likes: maxValue
  }

  return result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}