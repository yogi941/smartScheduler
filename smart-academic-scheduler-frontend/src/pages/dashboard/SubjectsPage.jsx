import { useEffect, useState } from 'react';
import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { subjectsApi, departmentsApi, semestersApi } from '../../api/resources';

function SubjectsPage() {
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);

  useEffect(() => {
    departmentsApi
      .list({ limit: 100 })
      .then((res) => setDepartments(res.data || []))
      .catch(() => setDepartments([]));

    semestersApi
      .list({ limit: 100 })
      .then((res) => setSemesters(res.data || []))
      .catch(() => setSemesters([]));
  }, []);

  const columns = [
    { key: 'name', label: 'Subject Name' },
    { key: 'code', label: 'Code' },
    { key: 'department', label: 'Department', render: (item) => item.department?.name || '—' },
    { key: 'semester', label: 'Semester', render: (item) => item.semester ? `Sem ${item.semester.semesterNumber} (${item.semester.academicYear})` : '—' },
    { key: 'credits', label: 'Credits' },
    { key: 'subjectType', label: 'Type' },
    { key: 'weeklyLectureHours', label: 'Lecture Hrs/Wk' },
    { key: 'weeklyLabHours', label: 'Lab Hrs/Wk' },
    { key: 'isActive', label: 'Status' },
  ];

  const fields = [
    { name: 'name', label: 'Subject Name', required: true, placeholder: 'Data Structures & Algorithms' },
    { name: 'code', label: 'Subject Code', required: true, placeholder: 'CS201' },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: departments.map((d) => ({ value: d.id || d._id, label: `${d.name} (${d.code})` })),
    },
    {
      name: 'semester',
      label: 'Semester',
      type: 'select',
      required: true,
      options: semesters.map((s) => ({
        value: s.id || s._id,
        label: `Sem ${s.semesterNumber} - ${s.course?.name || ''} (${s.academicYear})`,
      })),
    },
    { name: 'credits', label: 'Credits', type: 'number', required: true, defaultValue: 4 },
    {
      name: 'subjectType',
      label: 'Subject Type',
      type: 'select',
      required: true,
      options: [
        { value: 'THEORY', label: 'Theory' },
        { value: 'LAB', label: 'Lab' },
        { value: 'THEORY_AND_LAB', label: 'Theory + Lab' },
      ],
    },
    { name: 'weeklyLectureHours', label: 'Weekly Lecture Hours', type: 'number', defaultValue: 3 },
    { name: 'weeklyLabHours', label: 'Weekly Lab Hours', type: 'number', defaultValue: 2 },
  ];

  return <ResourceCrudPage title="Subjects" api={subjectsApi} columns={columns} fields={fields} />;
}

export default SubjectsPage;
