const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const SUBJECT_TYPES = Object.freeze({
  THEORY: 'THEORY',
  LAB: 'LAB',
  THEORY_AND_LAB: 'THEORY_AND_LAB',
});

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      minlength: [2, 'Subject name must be at least 2 characters long'],
      maxlength: [150, 'Subject name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      unique: true,
      uppercase: true,
      minlength: [2, 'Subject code must be at least 2 characters long'],
      maxlength: [20, 'Subject code cannot exceed 20 characters'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Subject must belong to a department'],
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Subject must be linked to a semester'],
    },
    credits: {
      type: Number,
      required: [true, 'Subject credits is required'],
      min: [1, 'Credits must be at least 1'],
      max: [10, 'Credits cannot exceed 10'],
    },
    subjectType: {
      type: String,
      enum: {
        values: Object.values(SUBJECT_TYPES),
        message: '{VALUE} is not a valid subject type',
      },
      required: [true, 'Subject type is required'],
    },
    weeklyLectureHours: {
      type: Number,
      default: 0,
      min: [0, 'Weekly lecture hours cannot be negative'],
      max: [20, 'Weekly lecture hours cannot exceed 20'],
    },
    weeklyLabHours: {
      type: Number,
      default: 0,
      min: [0, 'Weekly lab hours cannot be negative'],
      max: [20, 'Weekly lab hours cannot exceed 20'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subjectSchema.index({ code: 1 }, { unique: true });
subjectSchema.index({ department: 1, semester: 1 });

subjectSchema.pre('validate', function validateWeeklyHours(next) {
  if (this.weeklyLectureHours === 0 && this.weeklyLabHours === 0) {
    return next(new Error('A subject must have at least one weekly lecture hour or lab hour'));
  }

  if (this.subjectType === SUBJECT_TYPES.THEORY && this.weeklyLabHours > 0) {
    return next(new Error('A THEORY subject cannot have weekly lab hours'));
  }

  if (this.subjectType === SUBJECT_TYPES.LAB && this.weeklyLectureHours > 0) {
    return next(new Error('A LAB subject cannot have weekly lecture hours'));
  }

  return next();
});

subjectSchema.plugin(toJSONPlugin);

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
module.exports.SUBJECT_TYPES = SUBJECT_TYPES;
