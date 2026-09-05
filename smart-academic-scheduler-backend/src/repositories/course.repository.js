const createRepository = require('./base.repository');
const { Course } = require('../models');

module.exports = createRepository(Course);
