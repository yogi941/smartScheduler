const mongoose = require('mongoose');
const { WEEK_DAYS } = require('../constants/appConstants');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const DESIGNATIONS = Object.freeze({
  PROFESSOR: 'PROFESSOR',
  ASSOCIATE_PROFESSOR: 'ASSOCIATE_PROFESSOR',
  ASSISTANT_PROFESSOR: 'ASSISTANT_PROFESSOR',
  LECTURER: 'LECTURER',
  LAB_INSTRUCTOR: 'LAB_INSTRUCTOR',
});

const teacherUnavailabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: {
        values: WEEK_DAYS,
        message: '{VALUE} is not a valid day of the week',
      },
      required: [true, 'Day is required for an unavailability entry'],
    },
    timeSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      required: [true, 'Time slot is required for an unavailability entry'],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [200, 'Reason cannot exceed 200 characters'],
      default: '',
    },
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher must be linked to a user account'],
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
      unique: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Teacher must belong to a department'],
    },
    designation: {
      type: String,
      enum: {
        values: Object.values(DESIGNATIONS),
        message: '{VALUE} is not a valid designation',
      },
      required: [true, 'Designation is required'],
    },
    subjectsCanTeach: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    maxWeeklyHours: {
      type: Number,
      default: 18,
      min: [1, 'Max weekly hours must be at least 1'],
      max: [40, 'Max weekly hours cannot exceed 40'],
    },
    unavailability: {
      type: [teacherUnavailabilitySchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

teacherSchema.index({ employeeId: 1 }, { unique: true });
teacherSchema.index({ user: 1 }, { unique: true });
teacherSchema.index({ department: 1 });
teacherSchema.index({ subjectsCanTeach: 1 });

teacherSchema.methods.isUnavailableAt = function isUnavailableAt(day, timeSlotId) {
  return this.unavailability.some(
    (entry) => entry.day === day && entry.timeSlot.toString() === timeSlotId.toString()
  );
};

teacherSchema.plugin(toJSONPlugin);

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
module.exports.DESIGNATIONS = DESIGNATIONS;
