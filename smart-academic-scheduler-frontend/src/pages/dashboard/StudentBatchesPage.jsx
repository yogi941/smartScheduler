import { useEffect, useState } from 'react';
import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { studentBatchesApi, departmentsApi, semestersApi } from '../../api/resources';

function StudentBatchesPage() {
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
    { key: 'batchName', label: 'Batch Name' },
    { key: 'department', label: 'Department', render: (item) => item.department?.name || '—' },
    { key: 'semester', label: 'Semester', render: (item) => item.semester ? `Sem ${item.semester.semesterNumber}` : '—' },
    { key: 'section', label: 'Section' },
    { key: 'academicYear', label: 'Academic Year' },
    { key: 'strength', label: 'Student Strength' },
    { key: 'isActive', label: 'Status' },
  ];

  const fields = [
    { name: 'batchName', label: 'Batch Name', required: true, placeholder: 'CSE-2025-SecA' },
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
    { name: 'section', label: 'Section', required: true, placeholder: 'A' },
    { name: 'academicYear', label: 'Academic Year (YYYY-YYYY)', required: true, placeholder: '2025-2026' },
    { name: 'strength', label: 'Student Strength', type: 'number', required: true, defaultValue: 60 },
  ];

  return <ResourceCrudPage title="Student Batches" api={studentBatchesApi} columns={columns} fields={fields} />;
}

export default StudentBatchesPage;
