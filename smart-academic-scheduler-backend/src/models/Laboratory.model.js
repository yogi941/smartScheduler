const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const laboratorySchema = new mongoose.Schema(
  {
    labName: {
      type: String,
      required: [true, 'Laboratory name is required'],
      trim: true,
      maxlength: [150, 'Laboratory name cannot exceed 150 characters'],
    },
    labCode: {
      type: String,
      required: [true, 'Laboratory code is required'],
      trim: true,
      unique: true,
      uppercase: true,
      maxlength: [20, 'Laboratory code cannot exceed 20 characters'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    building: {
      type: String,
      required: [true, 'Building name is required'],
      trim: true,
      maxlength: [100, 'Building name cannot exceed 100 characters'],
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: [0, 'Floor number cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Laboratory capacity is required'],
      min: [1, 'Laboratory capacity must be at least 1'],
    },
    equipment: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

laboratorySchema.index({ labCode: 1 }, { unique: true });
laboratorySchema.index({ department: 1 });

laboratorySchema.plugin(toJSONPlugin);

const Laboratory = mongoose.model('Laboratory', laboratorySchema);

module.exports = Laboratory;
