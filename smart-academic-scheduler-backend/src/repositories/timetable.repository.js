const createRepository = require('./base.repository');
const { Timetable } = require('../models');

module.exports = createRepository(Timetable);
