const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

function createCrudController({ service, entityName, buildFilter }) {
  const create = asyncHandler(async (req, res) => {
    const doc = await service.create(req.body);
    return ApiResponse.created(res, doc, `${entityName} created successfully`);
  });

  const list = asyncHandler(async (req, res) => {
    const filter = buildFilter ? buildFilter(req.query) : {};
    const { page, limit, sort } = req.query;
    const { data, meta } = await service.list({ page, limit, filter, sort });
    return ApiResponse.ok(res, data, `${entityName} list fetched successfully`, meta);
  });

  const getById = asyncHandler(async (req, res) => {
    const doc = await service.getById(req.params.id);
    return ApiResponse.ok(res, doc, `${entityName} fetched successfully`);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await service.update(req.params.id, req.body);
    return ApiResponse.ok(res, doc, `${entityName} updated successfully`);
  });

  const remove = asyncHandler(async (req, res) => {
    await service.remove(req.params.id);
    return ApiResponse.ok(res, null, `${entityName} deleted successfully`);
  });

  return { create, list, getById, update, remove };
}

module.exports = createCrudController;
