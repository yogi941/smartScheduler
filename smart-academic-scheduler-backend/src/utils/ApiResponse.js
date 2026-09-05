const HTTP_STATUS = require('../constants/httpStatusCodes');

class ApiResponse {
  constructor(statusCode = HTTP_STATUS.OK, message = 'Success', data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  send(res) {
    return res.status(this.statusCode).json(this);
  }

  static ok(res, data = null, message = 'Success', meta = null) {
    return new ApiResponse(HTTP_STATUS.OK, message, data, meta).send(res);
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return new ApiResponse(HTTP_STATUS.CREATED, message, data).send(res);
  }

  static noContent(res, message = 'No content') {
    return new ApiResponse(HTTP_STATUS.NO_CONTENT, message, null).send(res);
  }
}

module.exports = ApiResponse;
