const mongoose = require('mongoose');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const ROOM_TYPES = Object.freeze({
  CLASSROOM: 'CLASSROOM',
  SEMINAR_HALL: 'SEMINAR_HALL',
  AUDITORIUM: 'AUDITORIUM',
});

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
      unique: true,
      uppercase: true,
      maxlength: [20, 'Room number cannot exceed 20 characters'],
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
      required: [true, 'Room capacity is required'],
      min: [1, 'Room capacity must be at least 1'],
    },
    roomType: {
      type: String,
      enum: {
        values: Object.values(ROOM_TYPES),
        message: '{VALUE} is not a valid room type',
      },
      default: ROOM_TYPES.CLASSROOM,
    },
    hasProjector: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roomSchema.index({ roomNumber: 1 }, { unique: true });
roomSchema.index({ building: 1, floor: 1 });

roomSchema.plugin(toJSONPlugin);

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
module.exports.ROOM_TYPES = ROOM_TYPES;
