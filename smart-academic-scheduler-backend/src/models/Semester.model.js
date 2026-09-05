const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/;

const semesterSchema = new mongoose.Schema(
  {
    semesterNumber: {
      type: Number,
      required: [true, 'Semester number is required'],
      min: [1, 'Semester number must be at least 1'],
      max: [12, 'Semester number cannot exceed 12'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Semester must belong to a course'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [ACADEMIC_YEAR_REGEX, 'Academic year must be in the format YYYY-YYYY, e.g. 2025-2026'],
    },
    startDate: {
      type: Date,
      required: [true, 'Semester start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'Semester end date is required'],
      validate: {
        validator: function validateEndDate(value) {
          return value > this.startDate;
        },
        message: 'Semester end date must be after the start date',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

semesterSchema.index({ course: 1, semesterNumber: 1, academicYear: 1 }, { unique: true });

semesterSchema.plugin(toJSONPlugin);

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;
