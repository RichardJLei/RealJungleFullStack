import axios from 'axios';
import { getBlogPostsSQL } from '../services/BlogPostService';

jest.mock('axios');

test('fetches blog posts from SQL backend', async () => {
  const mockPosts = [{ id: 1, title: 'Test Post' }];
  axios.get.mockResolvedValue({ 
    data: mockPosts,
    config: { 
      url: `${process.env.REACT_APP_API_URL}/blog-post-sql/`,
      params: { _start: 1, _end: 11, _cache: expect.any(Number) }
    }
  });
  
  const result = await getBlogPostsSQL();
  expect(axios.get).toHaveBeenCalledWith(
    `${process.env.REACT_APP_API_URL}/blog-post-sql/`,
    expect.objectContaining({
      params: {
        _start: 1,
        _end: 11,
        _cache: expect.any(Number)
      }
    })
  );
  expect(result).toEqual(mockPosts);
}); 