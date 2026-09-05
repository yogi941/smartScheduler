const createRepository = require('./base.repository');
const { Room } = require('../models');

module.exports = createRepository(Room);
