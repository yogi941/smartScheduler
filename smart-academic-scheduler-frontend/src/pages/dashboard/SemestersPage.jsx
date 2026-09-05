import { useEffect, useState } from 'react';
import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { semestersApi, coursesApi } from '../../api/resources';

function SemestersPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    coursesApi
      .list({ limit: 100 })
      .then((res) => setCourses(res.data || []))
      .catch(() => setCourses([]));
  }, []);

  const columns = [
    { key: 'semesterNumber', label: 'Semester #' },
    { key: 'course', label: 'Course', render: (item) => item.course?.name || '—' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'startDate', label: 'Start Date', render: (item) => (item.startDate ? item.startDate.split('T')[0] : '—') },
    { key: 'endDate', label: 'End Date', render: (item) => (item.endDate ? item.endDate.split('T')[0] : '—') },
    { key: 'isActive', label: 'Status' },
  ];

  const fields = [
    { name: 'semesterNumber', label: 'Semester Number', type: 'number', required: true, defaultValue: 1 },
    {
      name: 'course',
      label: 'Course',
      type: 'select',
      required: true,
      options: courses.map((c) => ({ value: c.id || c._id, label: `${c.name} (${c.code})` })),
    },
    { name: 'academicYear', label: 'Academic Year (YYYY-YYYY)', required: true, placeholder: '2025-2026' },
    { name: 'startDate', label: 'Start Date (YYYY-MM-DD)', required: true, placeholder: '2025-08-01' },
    { name: 'endDate', label: 'End Date (YYYY-MM-DD)', required: true, placeholder: '2025-12-20' },
  ];

  return <ResourceCrudPage title="Semesters" api={semestersApi} columns={columns} fields={fields} />;
}

export default SemestersPage;
