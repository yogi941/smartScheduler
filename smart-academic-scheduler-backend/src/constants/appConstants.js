const NODE_ENVIRONMENTS = Object.freeze({
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
});

const USER_ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
});

const WEEK_DAYS = Object.freeze([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]);

const SLOT_TYPES = Object.freeze({
  LECTURE: 'LECTURE',
  LAB: 'LAB',
  BREAK: 'BREAK',
  LUNCH: 'LUNCH',
});

const CONFLICT_TYPES = Object.freeze({
  TEACHER: 'TEACHER_CONFLICT',
  ROOM: 'ROOM_CONFLICT',
  LAB: 'LAB_CONFLICT',
  BATCH: 'BATCH_CONFLICT',
  SEMESTER: 'SEMESTER_CONFLICT',
  TIME: 'TIME_CONFLICT',
});

const DEFAULT_PAGINATION = Object.freeze({
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
});

module.exports = {
  NODE_ENVIRONMENTS,
  USER_ROLES,
  WEEK_DAYS,
  SLOT_TYPES,
  CONFLICT_TYPES,
  DEFAULT_PAGINATION,
};
