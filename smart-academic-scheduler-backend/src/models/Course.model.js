const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      minlength: [2, 'Course name must be at least 2 characters long'],
      maxlength: [150, 'Course name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      unique: true,
      uppercase: true,
      minlength: [2, 'Course code must be at least 2 characters long'],
      maxlength: [15, 'Course code cannot exceed 15 characters'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Course must belong to a department'],
    },
    durationYears: {
      type: Number,
      required: [true, 'Course duration in years is required'],
      min: [1, 'Duration must be at least 1 year'],
      max: [6, 'Duration cannot exceed 6 years'],
    },
    totalSemesters: {
      type: Number,
      required: [true, 'Total number of semesters is required'],
      min: [1, 'Total semesters must be at least 1'],
      max: [12, 'Total semesters cannot exceed 12'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ department: 1, name: 1 }, { unique: true });

courseSchema.plugin(toJSONPlugin);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
