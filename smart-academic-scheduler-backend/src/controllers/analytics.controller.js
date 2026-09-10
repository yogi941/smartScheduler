const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/ApiResponse');

async function getAnalytics(req, res, next) {
  try {
    const data = await analyticsService.getDashboardAnalytics();
    return ApiResponse.ok(res, data, 'Analytics data retrieved successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = { getAnalytics };
