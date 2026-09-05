const mongoose = require('mongoose');
const { WEEK_DAYS, SLOT_TYPES } = require('../constants/appConstants');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const TIMETABLE_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
});

const timetableEntrySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: { values: WEEK_DAYS, message: '{VALUE} is not a valid day of the week' },
      required: [true, 'Entry day is required'],
    },
    timeSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      required: [true, 'Entry time slot is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Entry subject is required'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Entry teacher is required'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },
    laboratory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory',
      default: null,
    },
    slotType: {
      type: String,
      enum: { values: Object.values(SLOT_TYPES), message: '{VALUE} is not a valid slot type' },
      required: [true, 'Entry slot type is required'],
    },
  },
  { _id: true }
);

timetableEntrySchema.pre('validate', function validateEntryLocation(next) {
  if (this.slotType === SLOT_TYPES.LAB && !this.laboratory) {
    return next(new Error('A LAB entry must specify a laboratory'));
  }
  if (this.slotType === SLOT_TYPES.LECTURE && !this.room) {
    return next(new Error('A LECTURE entry must specify a room'));
  }
  if (this.room && this.laboratory) {
    return next(new Error('An entry cannot have both a room and a laboratory assigned'));
  }
  return next();
});

const timetableSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentBatch',
      required: [true, 'Timetable must belong to a student batch'],
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Timetable must be linked to a semester'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TIMETABLE_STATUS),
        message: '{VALUE} is not a valid timetable status',
      },
      default: TIMETABLE_STATUS.DRAFT,
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be at least 1'],
    },
    entries: {
      type: [timetableEntrySchema],
      default: [],
    },
    conflictCount: {
      type: Number,
      default: 0,
      min: [0, 'Conflict count cannot be negative'],
    },
    generatedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

timetableSchema.index({ batch: 1, semester: 1, academicYear: 1, version: -1 });
timetableSchema.index({ status: 1 });

timetableSchema.pre('validate', function validateNoInternalConflicts(next) {
  const seenByTeacher = new Map();
  const seenByRoom = new Map();
  const seenByLab = new Map();

  for (const entry of this.entries) {
    const key = `${entry.day}::${entry.timeSlot ? entry.timeSlot.toString() : ''}`;

    const teacherKey = `${key}::${entry.teacher ? entry.teacher.toString() : ''}`;
    if (seenByTeacher.has(teacherKey)) {
      return next(new Error(`Teacher conflict detected in timetable entries at ${key}`));
    }
    seenByTeacher.set(teacherKey, true);

    if (entry.room) {
      const roomKey = `${key}::${entry.room.toString()}`;
      if (seenByRoom.has(roomKey)) {
        return next(new Error(`Room conflict detected in timetable entries at ${key}`));
      }
      seenByRoom.set(roomKey, true);
    }

    if (entry.laboratory) {
      const labKey = `${key}::${entry.laboratory.toString()}`;
      if (seenByLab.has(labKey)) {
        return next(new Error(`Laboratory conflict detected in timetable entries at ${key}`));
      }
      seenByLab.set(labKey, true);
    }
  }

  return next();
});

timetableSchema.plugin(toJSONPlugin);

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
module.exports.TIMETABLE_STATUS = TIMETABLE_STATUS;
