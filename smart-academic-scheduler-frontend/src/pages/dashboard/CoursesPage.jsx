import { useEffect, useState } from 'react';
import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { coursesApi, departmentsApi } from '../../api/resources';

function CoursesPage() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    departmentsApi
      .list({ limit: 100 })
      .then((res) => setDepartments(res.data || []))
      .catch(() => setDepartments([]));
  }, []);

  const columns = [
    { key: 'name', label: 'Course Name' },
    { key: 'code', label: 'Code' },
    { key: 'department', label: 'Department', render: (item) => item.department?.name || '—' },
    { key: 'durationYears', label: 'Duration (Years)' },
    { key: 'totalSemesters', label: 'Total Semesters' },
    { key: 'isActive', label: 'Status' },
  ];

  const fields = [
    { name: 'name', label: 'Course Name', required: true, placeholder: 'Bachelor of Technology in CSE' },
    { name: 'code', label: 'Course Code', required: true, placeholder: 'BTECH-CSE' },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: departments.map((d) => ({ value: d.id || d._id, label: `${d.name} (${d.code})` })),
    },
    { name: 'durationYears', label: 'Duration Years', type: 'number', required: true, defaultValue: 4 },
    { name: 'totalSemesters', label: 'Total Semesters', type: 'number', required: true, defaultValue: 8 },
  ];

  return <ResourceCrudPage title="Courses" api={coursesApi} columns={columns} fields={fields} />;
}

export default CoursesPage;
