const User = require('./User.model');
const Department = require('./Department.model');
const Course = require('./Course.model');
const Semester = require('./Semester.model');
const Teacher = require('./Teacher.model');
const Subject = require('./Subject.model');
const Room = require('./Room.model');
const Laboratory = require('./Laboratory.model');
const StudentBatch = require('./StudentBatch.model');
const TimeSlot = require('./TimeSlot.model');
const Constraint = require('./Constraint.model');
const Timetable = require('./Timetable.model');
const AuditLog = require('./AuditLog.model');

module.exports = {
  User,
  Department,
  Course,
  Semester,
  Teacher,
  Subject,
  Room,
  Laboratory,
  StudentBatch,
  TimeSlot,
  Constraint,
  Timetable,
  AuditLog,
};
