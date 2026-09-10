const AuditLog = require('../models/AuditLog.model');

async function logAction({ user, userEmail, userRole, action, resource, details, ipAddress }) {
  try {
    const log = await AuditLog.create({
      user: user || null,
      userEmail: userEmail || (user ? user.email : 'System'),
      userRole: userRole || (user ? user.role : 'SYSTEM'),
      action,
      resource,
      details,
      ipAddress,
    });
    return log;
  } catch (error) {
    // Audit logging should not crash primary operations
    console.error('AuditLog creation failed:', error.message);
    return null;
  }
}

async function getLogs({ page = 1, limit = 50, action, resource }) {
  const query = {};
  if (action) query.action = action;
  if (resource) query.resource = resource;

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email role'),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
}

module.exports = {
  logAction,
  getLogs,
};
