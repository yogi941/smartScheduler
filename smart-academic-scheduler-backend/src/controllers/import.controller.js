const importService = require('../services/import.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { logAction } = require('../services/auditLog.service');

async function handleImport(req, res, next) {
  try {
    if (!req.file) {
      throw ApiError.badRequest('Please upload a file (.csv or .xlsx)');
    }

    const { entityType } = req.body;
    if (!entityType) {
      throw ApiError.badRequest('entityType is required (TEACHERS, ROOMS, LABS, SUBJECTS)');
    }

    const result = await importService.importBatchData({
      entityType,
      fileBuffer: req.file.buffer,
      fileMimetype: req.file.mimetype,
      fileName: req.file.originalname,
    });

    await logAction({
      user: req.user?._id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'IMPORT_DATA',
      resource: entityType,
      details: { fileName: req.file.originalname, importedCount: result.importedCount },
      ipAddress: req.ip,
    });

    return ApiResponse.ok(
      res,
      result,
      `Successfully imported ${result.importedCount} ${entityType} record(s).`
    );
  } catch (error) {
    next(error);
  }
}

module.exports = { handleImport };
