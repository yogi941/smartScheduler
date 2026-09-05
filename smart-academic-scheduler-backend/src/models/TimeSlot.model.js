const mongoose = require('mongoose');
const { WEEK_DAYS, SLOT_TYPES } = require('../constants/appConstants');
const toJSONPlugin = require('./plugins/toJSONPlugin');

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeSlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: {
        values: WEEK_DAYS,
        message: '{VALUE} is not a valid day of the week',
      },
      required: [true, 'Day is required'],
    },
    slotIndex: {
      type: Number,
      required: [true, 'Slot index is required'],
      min: [1, 'Slot index must be at least 1'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [TIME_REGEX, 'Start time must be in HH:mm 24-hour format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [TIME_REGEX, 'End time must be in HH:mm 24-hour format'],
      validate: {
        validator: function validateEndTime(value) {
          return value > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    slotType: {
      type: String,
      enum: {
        values: Object.values(SLOT_TYPES),
        message: '{VALUE} is not a valid slot type',
      },
      default: SLOT_TYPES.LECTURE,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

timeSlotSchema.index({ day: 1, slotIndex: 1 }, { unique: true });

timeSlotSchema.plugin(toJSONPlugin);

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

module.exports = TimeSlot;
