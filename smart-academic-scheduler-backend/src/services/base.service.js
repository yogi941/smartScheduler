const ApiError = require('../utils/ApiError');
const { DEFAULT_PAGINATION } = require('../constants/appConstants');

function createCrudService({
  repository,
  entityName,
  populate = [],
  beforeCreate,
  beforeUpdate,
  beforeDelete,
}) {
  return {
    async create(data) {
      if (beforeCreate) {
        await beforeCreate(data);
      }
      return repository.create(data);
    },

    async list({ page, limit, filter = {}, sort }) {
      const pageNum = Math.max(Number(page) || DEFAULT_PAGINATION.PAGE, 1);
      const limitNum = Math.min(
        Number(limit) || DEFAULT_PAGINATION.LIMIT,
        DEFAULT_PAGINATION.MAX_LIMIT
      );

      const { data, total } = await repository.findAll({
        filter,
        page: pageNum,
        limit: limitNum,
        sort,
        populate,
      });

      return {
        data,
        meta: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / limitNum),
        },
      };
    },

    async getById(id) {
      const doc = await repository.findById(id, populate);
      if (!doc) {
        throw ApiError.notFound(`${entityName} not found`);
      }
      return doc;
    },

    async update(id, updates) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw ApiError.notFound(`${entityName} not found`);
      }
      if (beforeUpdate) {
        await beforeUpdate(updates, existing);
      }
      return repository.updateById(id, updates);
    },

    async remove(id) {
      const existing = await repository.findById(id);
      if (!existing) {
        throw ApiError.notFound(`${entityName} not found`);
      }
      if (beforeDelete) {
        await beforeDelete(existing);
      }
      await repository.deleteById(id);
    },
  };
}

module.exports = createCrudService;
