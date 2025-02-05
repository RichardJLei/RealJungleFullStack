import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; // Using env var from frontend/config

export const getBlogPostsSQL = async () => {
  try {
    const response = await axios.get(`${API_URL}/blog-post-sql/`, {
      params: {
        _start: 1,
        _end: 11,
        _cache: Date.now()
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}; 