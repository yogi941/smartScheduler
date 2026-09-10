require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../src/config/database');
const logger = require('../src/config/logger');
const {
  User,
  Department,
  Course,
  Semester,
  Subject,
  Teacher,
  StudentBatch,
  Room,
  Laboratory,
  TimeSlot,
} = require('../src/models');
const { USER_ROLES, WEEK_DAYS, SLOT_TYPES } = require('../src/constants/appConstants');
const { DESIGNATIONS } = require('../src/models/Teacher.model');
const { SUBJECT_TYPES } = require('../src/models/Subject.model');
const { ROOM_TYPES } = require('../src/models/Room.model');

async function seedDemoData() {
  await connectDatabase();

  try {
    logger.info('Starting full demo dataset creation...');

    // 1. TimeSlots (Monday to Friday, 6 slots each)
    logger.info('Creating Time Slots...');
    const timeSlotsData = [];
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const slotsDef = [
      { slotIndex: 1, startTime: '09:00', endTime: '10:00', slotType: SLOT_TYPES.LECTURE },
      { slotIndex: 2, startTime: '10:00', endTime: '11:00', slotType: SLOT_TYPES.LECTURE },
      { slotIndex: 3, startTime: '11:15', endTime: '12:15', slotType: SLOT_TYPES.LECTURE },
      { slotIndex: 4, startTime: '13:15', endTime: '14:15', slotType: SLOT_TYPES.LECTURE },
      { slotIndex: 5, startTime: '14:15', endTime: '15:15', slotType: SLOT_TYPES.LAB },
      { slotIndex: 6, startTime: '15:15', endTime: '16:15', slotType: SLOT_TYPES.LAB },
    ];

    for (const day of days) {
      for (const slot of slotsDef) {
        timeSlotsData.push({ day, ...slot });
      }
    }

    const createdTimeSlots = [];
    for (const ts of timeSlotsData) {
      const existing = await TimeSlot.findOne({ day: ts.day, slotIndex: ts.slotIndex });
      if (!existing) {
        const newSlot = await TimeSlot.create(ts);
        createdTimeSlots.push(newSlot);
      } else {
        existing.slotType = ts.slotType;
        await existing.save();
        createdTimeSlots.push(existing);
      }
    }
    logger.info(`Time Slots ready: ${createdTimeSlots.length} slots.`);

    // 2. Department
    logger.info('Creating Departments...');
    let cseDept = await Department.findOne({ code: 'CSE' });
    if (!cseDept) {
      cseDept = await Department.create({
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering',
      });
    }

    let itDept = await Department.findOne({ code: 'IT' });
    if (!itDept) {
      itDept = await Department.create({
        name: 'Information Technology',
        code: 'IT',
        description: 'Department of Information Technology',
      });
    }

    // 3. Course
    logger.info('Creating Courses...');
    let cseCourse = await Course.findOne({ code: 'CSE-BTECH' });
    if (!cseCourse) {
      cseCourse = await Course.create({
        name: 'B.Tech Computer Science',
        code: 'CSE-BTECH',
        department: cseDept._id,
        durationYears: 4,
        totalSemesters: 8,
      });
    }

    // 4. Semester
    logger.info('Creating Semester...');
    let sem5 = await Semester.findOne({
      course: cseCourse._id,
      semesterNumber: 5,
      academicYear: '2026-2027',
    });
    if (!sem5) {
      sem5 = await Semester.create({
        semesterNumber: 5,
        course: cseCourse._id,
        academicYear: '2026-2027',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-12-31'),
      });
    }

    // 5. Rooms & Laboratories
    logger.info('Creating Rooms & Labs...');
    const roomsDef = [
      {
        roomNumber: 'LH-101',
        building: 'Academic Block A',
        floor: 1,
        capacity: 60,
        roomType: ROOM_TYPES.CLASSROOM,
        hasProjector: true,
      },
      {
        roomNumber: 'LH-102',
        building: 'Academic Block A',
        floor: 1,
        capacity: 60,
        roomType: ROOM_TYPES.CLASSROOM,
        hasProjector: true,
      },
      {
        roomNumber: 'LH-103',
        building: 'Academic Block A',
        floor: 1,
        capacity: 60,
        roomType: ROOM_TYPES.CLASSROOM,
        hasProjector: false,
      },
    ];
    for (const r of roomsDef) {
      const existing = await Room.findOne({ roomNumber: r.roomNumber });
      if (!existing) await Room.create(r);
      else {
        existing.capacity = r.capacity;
        await existing.save();
      }
    }

    const labsDef = [
      {
        labName: 'Software Systems Lab',
        labCode: 'LAB-SE1',
        building: 'Tech Block B',
        floor: 2,
        capacity: 60,
        department: cseDept._id,
        equipment: ['Linux Workstations', 'Git', 'Docker'],
      },
      {
        labName: 'Database Systems Lab',
        labCode: 'LAB-DB1',
        building: 'Tech Block B',
        floor: 2,
        capacity: 60,
        department: cseDept._id,
        equipment: ['MongoDB', 'PostgreSQL Workstations'],
      },
    ];
    for (const l of labsDef) {
      const existing = await Laboratory.findOne({ labCode: l.labCode });
      if (!existing) await Laboratory.create(l);
      else {
        existing.capacity = l.capacity;
        await existing.save();
      }
    }

    // 6. Subjects
    logger.info('Creating Subjects...');
    const subjectsDef = [
      {
        name: 'Data Structures & Algorithms',
        code: 'CS501',
        department: cseDept._id,
        semester: sem5._id,
        credits: 4,
        subjectType: SUBJECT_TYPES.THEORY,
        weeklyLectureHours: 3,
        weeklyLabHours: 0,
      },
      {
        name: 'Operating Systems',
        code: 'CS502',
        department: cseDept._id,
        semester: sem5._id,
        credits: 4,
        subjectType: SUBJECT_TYPES.THEORY,
        weeklyLectureHours: 3,
        weeklyLabHours: 0,
      },
      {
        name: 'Database Management Systems',
        code: 'CS503',
        department: cseDept._id,
        semester: sem5._id,
        credits: 4,
        subjectType: SUBJECT_TYPES.THEORY,
        weeklyLectureHours: 3,
        weeklyLabHours: 0,
      },
      {
        name: 'OS Laboratory',
        code: 'CS504L',
        department: cseDept._id,
        semester: sem5._id,
        credits: 2,
        subjectType: SUBJECT_TYPES.LAB,
        weeklyLectureHours: 0,
        weeklyLabHours: 2,
      },
      {
        name: 'DBMS Laboratory',
        code: 'CS505L',
        department: cseDept._id,
        semester: sem5._id,
        credits: 2,
        subjectType: SUBJECT_TYPES.LAB,
        weeklyLectureHours: 0,
        weeklyLabHours: 2,
      },
    ];

    const createdSubjects = [];
    for (const s of subjectsDef) {
      let subj = await Subject.findOne({ code: s.code });
      if (!subj) {
        subj = await Subject.create(s);
      }
      createdSubjects.push(subj);
    }

    // 7. Teachers (User + Teacher model)
    logger.info('Creating Teachers...');
    const teachersData = [
      {
        name: 'Prof. Alan Turing',
        email: 'turing@example.com',
        empId: 'EMP-001',
        designation: DESIGNATIONS.PROFESSOR,
        subjects: ['CS501', 'CS502'],
      },
      {
        name: 'Prof. Ada Lovelace',
        email: 'lovelace@example.com',
        empId: 'EMP-002',
        designation: DESIGNATIONS.ASSOCIATE_PROFESSOR,
        subjects: ['CS503', 'CS505L'],
      },
      {
        name: 'Prof. Grace Hopper',
        email: 'hopper@example.com',
        empId: 'EMP-003',
        designation: DESIGNATIONS.ASSISTANT_PROFESSOR,
        subjects: ['CS504L', 'CS502'],
      },
    ];

    for (const t of teachersData) {
      let user = await User.findOne({ email: t.email });
      if (!user) {
        user = await User.create({
          name: t.name,
          email: t.email,
          password: 'Teacher12345',
          role: USER_ROLES.TEACHER,
          isActive: true,
        });
      }

      const teacherProf = await Teacher.findOne({ employeeId: t.empId });
      if (!teacherProf) {
        const matchedSubjectIds = createdSubjects
          .filter((sub) => t.subjects.includes(sub.code))
          .map((sub) => sub._id);

        await Teacher.create({
          user: user._id,
          employeeId: t.empId,
          department: cseDept._id,
          designation: t.designation,
          subjectsCanTeach: matchedSubjectIds,
          maxWeeklyHours: 18,
          isActive: true,
        });
      }
    }

    // 8. Student Batches
    logger.info('Creating Student Batches...');
    const batchesDef = [
      {
        batchName: 'CSE-2024-A',
        department: cseDept._id,
        semester: sem5._id,
        section: 'A',
        academicYear: '2026-2027',
        strength: 50,
      },
      {
        batchName: 'CSE-2024-B',
        department: cseDept._id,
        semester: sem5._id,
        section: 'B',
        academicYear: '2026-2027',
        strength: 45,
      },
    ];

    for (const b of batchesDef) {
      const existing = await StudentBatch.findOne({
        department: b.department,
        semester: b.semester,
        section: b.section,
        academicYear: b.academicYear,
      });
      if (!existing) await StudentBatch.create(b);
    }

    logger.info('SUCCESS: Full demo dataset created successfully!');
    logger.info('Sample Data Ready:');
    logger.info(' - 2 Departments (CSE, IT)');
    logger.info(' - 1 Course (B.Tech CSE)');
    logger.info(' - 1 Semester (Semester 5 - 2026-2027)');
    logger.info(' - 25 Time Slots (Mon-Fri, 5 slots/day)');
    logger.info(' - 3 Lecture Rooms & 2 Computer Labs');
    logger.info(' - 5 Subjects (3 Theory, 2 Labs)');
    logger.info(' - 3 Faculty Members (Prof. Alan Turing, Prof. Ada Lovelace, Prof. Grace Hopper)');
    logger.info(' - 2 Student Batches (CSE-2024-A, CSE-2024-B)');
  } catch (error) {
    logger.error(`Failed to seed demo data: ${error.message}\n${error.stack}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedDemoData();
