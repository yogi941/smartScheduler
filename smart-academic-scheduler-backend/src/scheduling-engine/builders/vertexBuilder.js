const { Subject, Teacher } = require('../../models');

async function assignTeacherForSubject(subject, teacherLoad) {
  const candidates = await Teacher.find({
    subjectsCanTeach: subject._id,
    isActive: true,
  });

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => {
    const loadA = teacherLoad.get(a._id.toString()) || 0;
    const loadB = teacherLoad.get(b._id.toString()) || 0;
    return loadA - loadB;
  });

  return candidates[0];
}

async function buildVertices(batches) {
  const teacherLoad = new Map();
  const vertices = [];
  const unassignedSubjects = [];

  for (const batch of batches) {
    const semesterId = batch.semester._id ? batch.semester._id : batch.semester;

    // eslint-disable-next-line no-await-in-loop
    const subjects = await Subject.find({ semester: semesterId, isActive: true });

    for (const subject of subjects) {
      // eslint-disable-next-line no-await-in-loop
      const teacher = await assignTeacherForSubject(subject, teacherLoad);

      if (!teacher) {
        unassignedSubjects.push({
          batchId: batch._id.toString(),
          subjectId: subject._id.toString(),
          subjectCode: subject.code,
          reason: 'No active teacher is qualified to teach this subject',
        });
        // eslint-disable-next-line no-continue
        continue;
      }

      const lectureCount = subject.weeklyLectureHours || 0;
      const labCount = subject.weeklyLabHours || 0;
      const teacherId = teacher._id.toString();

      teacherLoad.set(teacherId, (teacherLoad.get(teacherId) || 0) + lectureCount + labCount);

      for (let i = 0; i < lectureCount; i += 1) {
        vertices.push({
          id: `${batch._id}_${subject._id}_LECTURE_${i}`,
          batchId: batch._id.toString(),
          subjectId: subject._id.toString(),
          teacherId,
          slotType: 'LECTURE',
          roomId: null,
          laboratoryId: null,
        });
      }

      for (let i = 0; i < labCount; i += 1) {
        vertices.push({
          id: `${batch._id}_${subject._id}_LAB_${i}`,
          batchId: batch._id.toString(),
          subjectId: subject._id.toString(),
          teacherId,
          slotType: 'LAB',
          roomId: null,
          laboratoryId: null,
        });
      }
    }
  }

  return { vertices, unassignedSubjects };
}

module.exports = { buildVertices, assignTeacherForSubject };
