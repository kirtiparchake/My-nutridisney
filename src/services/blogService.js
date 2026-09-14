import { blogs } from '../data/mockData'
export const getBlogs = async () => blogs
export const getBlog = async (id) => blogs.find((blog) => blog.id === id)
