import { useEffect, useState } from 'react';
import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { teachersApi, departmentsApi, usersApi } from '../../api/resources';

function TeachersPage() {
  const [departments, setDepartments] = useState([]);
  const [teacherUsers, setTeacherUsers] = useState([]);

  useEffect(() => {
    departmentsApi
      .list({ limit: 100 })
      .then((res) => setDepartments(res.data || []))
      .catch(() => setDepartments([]));

    usersApi
      .list({ role: 'TEACHER', limit: 100 })
      .then((res) => setTeacherUsers(res.data || []))
      .catch(() => setTeacherUsers([]));
  }, []);

  const columns = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'user', label: 'Teacher Name', render: (item) => item.user?.name || '—' },
    { key: 'userEmail', label: 'Email', render: (item) => item.user?.email || '—' },
    { key: 'department', label: 'Department', render: (item) => item.department?.name || '—' },
    { key: 'designation', label: 'Designation' },
    { key: 'maxWeeklyHours', label: 'Max Weekly Hrs' },
    { key: 'isActive', label: 'Status' },
  ];

  const fields = [
    {
      name: 'user',
      label: 'Linked User Account',
      type: 'select',
      required: true,
      options: teacherUsers.map((u) => ({ value: u.id || u._id, label: `${u.name} (${u.email})` })),
    },
    { name: 'employeeId', label: 'Employee ID', required: true, placeholder: 'EMP-1001' },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: departments.map((d) => ({ value: d.id || d._id, label: `${d.name} (${d.code})` })),
    },
    {
      name: 'designation',
      label: 'Designation',
      type: 'select',
      required: true,
      options: [
        { value: 'PROFESSOR', label: 'Professor' },
        { value: 'ASSOCIATE_PROFESSOR', label: 'Associate Professor' },
        { value: 'ASSISTANT_PROFESSOR', label: 'Assistant Professor' },
        { value: 'LECTURER', label: 'Lecturer' },
        { value: 'LAB_INSTRUCTOR', label: 'Lab Instructor' },
      ],
    },
    { name: 'maxWeeklyHours', label: 'Max Weekly Hours', type: 'number', defaultValue: 20 },
  ];

  return <ResourceCrudPage title="Teachers" api={teachersApi} columns={columns} fields={fields} />;
}

export default TeachersPage;
