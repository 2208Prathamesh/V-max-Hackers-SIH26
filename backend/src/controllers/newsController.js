import { getTrendingNews } from '../services/newsService.js';
import { successResponse } from '../utils/response.js';

/**
 * Controller to fetch trending weather and climate news
 * GET /api/news?scope=all|india|global&category=all|...&q=...
 */
export async function getNews(req, res, next) {
  try {
    const { scope, category, q } = req.query;
    const result = await getTrendingNews({
      scope: scope || 'all',
      category: category || 'all',
      query: q || ''
    });

    return successResponse(res, result, 'Weather news retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
}
