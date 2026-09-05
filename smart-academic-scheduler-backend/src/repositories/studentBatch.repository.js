const createRepository = require('./base.repository');
const { StudentBatch } = require('../models');

module.exports = createRepository(StudentBatch);
