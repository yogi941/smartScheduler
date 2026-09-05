import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { departmentsApi } from '../../api/resources';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'code', label: 'Code' },
  { key: 'headOfDepartment', label: 'Head of Department', render: (item) => item.headOfDepartment?.name || '—' },
  { key: 'description', label: 'Description' },
  { key: 'isActive', label: 'Status' },
];

const fields = [
  { name: 'name', label: 'Department Name', required: true, placeholder: 'Computer Science & Engineering' },
  { name: 'code', label: 'Department Code', required: true, placeholder: 'CSE' },
  { name: 'description', label: 'Description', placeholder: 'Department description' },
];

function DepartmentsPage() {
  return <ResourceCrudPage title="Departments" api={departmentsApi} columns={columns} fields={fields} />;
}

export default DepartmentsPage;
