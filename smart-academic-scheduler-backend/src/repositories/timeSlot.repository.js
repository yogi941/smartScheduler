const createRepository = require('./base.repository');
const { TimeSlot } = require('../models');

module.exports = createRepository(TimeSlot);
