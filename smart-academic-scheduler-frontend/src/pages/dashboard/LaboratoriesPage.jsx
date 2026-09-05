import { useEffect, useState } from 'react';
import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { laboratoriesApi, departmentsApi } from '../../api/resources';

function LaboratoriesPage() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    departmentsApi
      .list({ limit: 100 })
      .then((res) => setDepartments(res.data || []))
      .catch(() => setDepartments([]));
  }, []);

  const columns = [
    { key: 'labName', label: 'Lab Name' },
    { key: 'labCode', label: 'Lab Code' },
    { key: 'department', label: 'Department', render: (item) => item.department?.name || '—' },
    { key: 'building', label: 'Building' },
    { key: 'floor', label: 'Floor' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'isActive', label: 'Status' },
  ];

  const fields = [
    { name: 'labName', label: 'Lab Name', required: true, placeholder: 'Advanced Computing Lab' },
    { name: 'labCode', label: 'Lab Code', required: true, placeholder: 'LAB-CS01' },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      options: departments.map((d) => ({ value: d.id || d._id, label: `${d.name} (${d.code})` })),
    },
    { name: 'building', label: 'Building Name', required: true, placeholder: 'Science & Tech Block' },
    { name: 'floor', label: 'Floor Level', type: 'number', required: true, defaultValue: 2 },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true, defaultValue: 40 },
  ];

  return <ResourceCrudPage title="Laboratories" api={laboratoriesApi} columns={columns} fields={fields} />;
}

export default LaboratoriesPage;
