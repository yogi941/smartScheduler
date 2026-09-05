const express = require('express');
const authRoutes = require('./auth.routes');
const departmentRoutes = require('./department.routes');
const courseRoutes = require('./course.routes');
const semesterRoutes = require('./semester.routes');
const teacherRoutes = require('./teacher.routes');
const subjectRoutes = require('./subject.routes');
const roomRoutes = require('./room.routes');
const laboratoryRoutes = require('./laboratory.routes');
const studentBatchRoutes = require('./studentBatch.routes');
const timeSlotRoutes = require('./timeSlot.routes');
const constraintRoutes = require('./constraint.routes');
const timetableRoutes = require('./timetable.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/courses', courseRoutes);
router.use('/semesters', semesterRoutes);
router.use('/teachers', teacherRoutes);
router.use('/subjects', subjectRoutes);
router.use('/rooms', roomRoutes);
router.use('/laboratories', laboratoryRoutes);
router.use('/student-batches', studentBatchRoutes);
router.use('/time-slots', timeSlotRoutes);
router.use('/constraints', constraintRoutes);
router.use('/timetables', timetableRoutes);
router.use('/users', userRoutes);

module.exports = router;
