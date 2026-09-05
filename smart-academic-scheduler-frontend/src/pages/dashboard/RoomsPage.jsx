import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { roomsApi } from '../../api/resources';

const columns = [
  { key: 'roomNumber', label: 'Room #' },
  { key: 'building', label: 'Building' },
  { key: 'floor', label: 'Floor' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'roomType', label: 'Room Type' },
  { key: 'hasProjector', label: 'Has Projector', render: (item) => (item.hasProjector ? 'Yes' : 'No') },
  { key: 'isActive', label: 'Status' },
];

const fields = [
  { name: 'roomNumber', label: 'Room Number', required: true, placeholder: 'CR-101' },
  { name: 'building', label: 'Building Name', required: true, placeholder: 'Main Academic Block' },
  { name: 'floor', label: 'Floor Level', type: 'number', required: true, defaultValue: 1 },
  { name: 'capacity', label: 'Capacity', type: 'number', required: true, defaultValue: 70 },
  {
    name: 'roomType',
    label: 'Room Type',
    type: 'select',
    options: [
      { value: 'CLASSROOM', label: 'Classroom' },
      { value: 'SEMINAR_HALL', label: 'Seminar Hall' },
      { value: 'AUDITORIUM', label: 'Auditorium' },
    ],
  },
  {
    name: 'hasProjector',
    label: 'Has Projector',
    type: 'select',
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ],
  },
];

function RoomsPage() {
  return <ResourceCrudPage title="Rooms" api={roomsApi} columns={columns} fields={fields} />;
}

export default RoomsPage;
