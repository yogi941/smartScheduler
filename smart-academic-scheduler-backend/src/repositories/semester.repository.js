const createRepository = require('./base.repository');
const { Semester } = require('../models');

module.exports = createRepository(Semester);
