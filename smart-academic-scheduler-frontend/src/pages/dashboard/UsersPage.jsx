import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { usersApi } from '../../api/resources';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'department', label: 'Department', render: (item) => item.department?.name || '—' },
  { key: 'phone', label: 'Phone' },
  { key: 'isActive', label: 'Status' },
];

const fields = [
  { name: 'name', label: 'Full Name', required: true, placeholder: 'Dr. Jane Smith' },
  { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'jsmith@institution.edu' },
  { name: 'password', label: 'Password', type: 'password', required: true, placeholder: '••••••••' },
  {
    name: 'role',
    label: 'User Role',
    type: 'select',
    required: true,
    options: [
      { value: 'STUDENT', label: 'Student' },
      { value: 'TEACHER', label: 'Teacher' },
      { value: 'ADMIN', label: 'Admin' },
      { value: 'SUPER_ADMIN', label: 'Super Admin' },
    ],
  },
  { name: 'phone', label: 'Phone (Optional)', placeholder: '10-digit number' },
];

function UsersPage() {
  return <ResourceCrudPage title="Users" api={usersApi} columns={columns} fields={fields} />;
}

export default UsersPage;
