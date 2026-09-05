const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Department name must be at least 2 characters long'],
      maxlength: [150, 'Department name cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      trim: true,
      unique: true,
      uppercase: true,
      minlength: [2, 'Department code must be at least 2 characters long'],
      maxlength: [10, 'Department code cannot exceed 10 characters'],
    },
    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

departmentSchema.index({ code: 1 }, { unique: true });
departmentSchema.index({ name: 1 }, { unique: true });

departmentSchema.plugin(toJSONPlugin);

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
