function createRepository(Model) {
  return {
    async create(data) {
      return Model.create(data);
    },

    async findAll({ filter = {}, page = 1, limit = 20, sort = '-createdAt', populate = [] }) {
      const skip = (page - 1) * limit;

      let query = Model.find(filter).sort(sort).skip(skip).limit(limit);

      populate.forEach((path) => {
        query = query.populate(path);
      });

      const [data, total] = await Promise.all([query.exec(), Model.countDocuments(filter)]);

      return { data, total };
    },

    async findById(id, populate = []) {
      let query = Model.findById(id);

      populate.forEach((path) => {
        query = query.populate(path);
      });

      return query;
    },

    async findOne(filter, populate = []) {
      let query = Model.findOne(filter);

      populate.forEach((path) => {
        query = query.populate(path);
      });

      return query;
    },

    async updateById(id, updates) {
      return Model.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    },

    async deleteById(id) {
      return Model.findByIdAndDelete(id);
    },

    async exists(filter) {
      const count = await Model.countDocuments(filter);
      return count > 0;
    },

    async countDocuments(filter = {}) {
      return Model.countDocuments(filter);
    },
  };
}

module.exports = createRepository;
