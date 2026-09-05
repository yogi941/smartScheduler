const mongoose = require('mongoose');
const { WEEK_DAYS } = require('../constants/appConstants');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const CONSTRAINT_TYPES = Object.freeze({
  TEACHER_AVAILABILITY: 'TEACHER_AVAILABILITY',
  ROOM_AVAILABILITY: 'ROOM_AVAILABILITY',
  LAB_AVAILABILITY: 'LAB_AVAILABILITY',
  SUBJECT_HOURS: 'SUBJECT_HOURS',
  LUNCH_BREAK: 'LUNCH_BREAK',
  HOLIDAY: 'HOLIDAY',
  SEMESTER_RULE: 'SEMESTER_RULE',
});

const APPLIES_TO_MODELS = Object.freeze([
  'Teacher',
  'Room',
  'Laboratory',
  'StudentBatch',
  'Subject',
  'Semester',
]);

const constraintSchema = new mongoose.Schema(
  {
    constraintType: {
      type: String,
      enum: {
        values: Object.values(CONSTRAINT_TYPES),
        message: '{VALUE} is not a valid constraint type',
      },
      required: [true, 'Constraint type is required'],
    },
    appliesToModel: {
      type: String,
      enum: {
        values: APPLIES_TO_MODELS,
        message: '{VALUE} is not a valid target model for a constraint',
      },
      required: [true, 'Target model (appliesToModel) is required'],
    },
    appliesTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target entity id (appliesTo) is required'],
      refPath: 'appliesToModel',
    },
    day: {
      type: String,
      enum: {
        values: WEEK_DAYS,
        message: '{VALUE} is not a valid day of the week',
      },
      default: null,
    },
    timeSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      default: null,
    },
    date: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Constraint description is required'],
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

constraintSchema.index({ constraintType: 1, appliesToModel: 1, appliesTo: 1 });
constraintSchema.index({ day: 1, timeSlot: 1 });
constraintSchema.index({ isActive: 1 });

constraintSchema.pre('validate', function validateConstraintShape(next) {
  if (this.constraintType === CONSTRAINT_TYPES.HOLIDAY && !this.date) {
    return next(new Error('A HOLIDAY constraint requires a date'));
  }

  if (
    [
      CONSTRAINT_TYPES.TEACHER_AVAILABILITY,
      CONSTRAINT_TYPES.ROOM_AVAILABILITY,
      CONSTRAINT_TYPES.LAB_AVAILABILITY,
      CONSTRAINT_TYPES.LUNCH_BREAK,
    ].includes(this.constraintType) &&
    (!this.day || !this.timeSlot)
  ) {
    return next(new Error(`A ${this.constraintType} constraint requires both day and timeSlot`));
  }

  return next();
});

constraintSchema.plugin(toJSONPlugin);

const Constraint = mongoose.model('Constraint', constraintSchema);

module.exports = Constraint;
module.exports.CONSTRAINT_TYPES = CONSTRAINT_TYPES;
module.exports.APPLIES_TO_MODELS = APPLIES_TO_MODELS;
