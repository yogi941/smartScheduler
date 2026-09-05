const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/;

const studentBatchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      maxlength: [50, 'Batch name cannot exceed 50 characters'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Batch must belong to a department'],
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Batch must be linked to a semester'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
      maxlength: [5, 'Section cannot exceed 5 characters'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      trim: true,
      match: [ACADEMIC_YEAR_REGEX, 'Academic year must be in the format YYYY-YYYY, e.g. 2025-2026'],
    },
    strength: {
      type: Number,
      required: [true, 'Batch strength is required'],
      min: [1, 'Batch strength must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

studentBatchSchema.index(
  { department: 1, semester: 1, section: 1, academicYear: 1 },
  { unique: true }
);

studentBatchSchema.plugin(toJSONPlugin);

const StudentBatch = mongoose.model('StudentBatch', studentBatchSchema);

module.exports = StudentBatch;
