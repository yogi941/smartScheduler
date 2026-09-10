const { Teacher, Room, Laboratory, Timetable, TimeSlot } = require('../models');
const { TIMETABLE_STATUS } = require('../models/Timetable.model');
const CacheService = require('./cache.service');

async function getDashboardAnalytics() {
  const cacheKey = 'analytics_dashboard_overview';
  const cached = await CacheService.get(cacheKey);
  if (cached) return cached;

  const [teachers, rooms, labs, activeTimetables, totalSlots] = await Promise.all([
    Teacher.find({ isActive: true }).populate('department'),
    Room.find({ isActive: true }),
    Laboratory.find({ isActive: true }),
    Timetable.find({ status: { $ne: TIMETABLE_STATUS.ARCHIVED } }).populate([
      'entries.teacher',
      'entries.room',
      'entries.laboratory',
    ]),
    TimeSlot.countDocuments({ isActive: true }),
  ]);

  const daysCount = 6; // Mon-Sat
  const maxPossibleSlotsPerResource = totalSlots * daysCount;

  // 1. Faculty Workload Calculation
  const facultyWorkloadMap = new Map();
  teachers.forEach((t) => {
    facultyWorkloadMap.set(t._id.toString(), {
      teacherId: t._id,
      name: t.name,
      email: t.email,
      department: t.department ? t.department.name : 'Unassigned',
      assignedSlots: 0,
    });
  });

  // 2. Classroom & Lab Utilization Calculation
  const roomUsageMap = new Map();
  rooms.forEach((r) => roomUsageMap.set(r._id.toString(), 0));

  const labUsageMap = new Map();
  labs.forEach((l) => labUsageMap.set(l._id.toString(), 0));

  let totalConflicts = 0;

  activeTimetables.forEach((tt) => {
    totalConflicts += tt.conflictCount || 0;
    (tt.entries || []).forEach((entry) => {
      if (entry.teacher) {
        const tId = entry.teacher._id ? entry.teacher._id.toString() : entry.teacher.toString();
        if (facultyWorkloadMap.has(tId)) {
          facultyWorkloadMap.get(tId).assignedSlots += 1;
        }
      }
      if (entry.room) {
        const rId = entry.room._id ? entry.room._id.toString() : entry.room.toString();
        if (roomUsageMap.has(rId)) {
          roomUsageMap.set(rId, roomUsageMap.get(rId) + 1);
        }
      }
      if (entry.laboratory) {
        const lId = entry.laboratory._id
          ? entry.laboratory._id.toString()
          : entry.laboratory.toString();
        if (labUsageMap.has(lId)) {
          labUsageMap.set(lId, labUsageMap.get(lId) + 1);
        }
      }
    });
  });

  const facultyWorkload = Array.from(facultyWorkloadMap.values());

  let totalRoomBookings = 0;
  roomUsageMap.forEach((count) => {
    totalRoomBookings += count;
  });
  const avgClassroomUtilization =
    rooms.length > 0 && maxPossibleSlotsPerResource > 0
      ? Math.min(
          100,
          Math.round((totalRoomBookings / (rooms.length * maxPossibleSlotsPerResource)) * 100)
        )
      : 0;

  let totalLabBookings = 0;
  labUsageMap.forEach((count) => {
    totalLabBookings += count;
  });
  const avgLabUtilization =
    labs.length > 0 && maxPossibleSlotsPerResource > 0
      ? Math.min(
          100,
          Math.round((totalLabBookings / (labs.length * maxPossibleSlotsPerResource)) * 100)
        )
      : 0;

  const result = {
    facultyWorkload,
    classroomUtilization: {
      totalRooms: rooms.length,
      totalBookings: totalRoomBookings,
      utilizationPercentage: avgClassroomUtilization,
    },
    laboratoryUtilization: {
      totalLabs: labs.length,
      totalBookings: totalLabBookings,
      utilizationPercentage: avgLabUtilization,
    },
    schedulingConflicts: {
      totalConflicts,
      activeTimetablesCount: activeTimetables.length,
    },
  };

  await CacheService.set(cacheKey, result, 120); // 2 minutes cache
  return result;
}

module.exports = { getDashboardAnalytics };
