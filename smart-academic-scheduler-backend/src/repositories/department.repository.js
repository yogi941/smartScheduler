const createRepository = require('./base.repository');
const { Department } = require('../models');

module.exports = createRepository(Department);
