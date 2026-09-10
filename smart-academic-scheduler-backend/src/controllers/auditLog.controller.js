const auditLogService = require('../services/auditLog.service');
const ApiResponse = require('../utils/ApiResponse');

async function getLogs(req, res, next) {
  try {
    const { page, limit, action, resource } = req.query;
    const data = await auditLogService.getLogs({ page, limit, action, resource });
    return ApiResponse.ok(res, data, 'Audit logs retrieved successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLogs,
};
