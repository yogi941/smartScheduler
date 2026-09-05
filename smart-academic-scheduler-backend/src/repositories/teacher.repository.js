const createRepository = require('./base.repository');
const { Teacher } = require('../models');

module.exports = createRepository(Teacher);
