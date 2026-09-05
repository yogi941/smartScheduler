import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { timeSlotsApi } from '../../api/resources';

const columns = [
  { key: 'day', label: 'Day' },
  { key: 'slotIndex', label: 'Slot #' },
  { key: 'startTime', label: 'Start Time' },
  { key: 'endTime', label: 'End Time' },
  { key: 'slotType', label: 'Slot Type' },
  { key: 'isActive', label: 'Status' },
];

const fields = [
  {
    name: 'day',
    label: 'Day of Week',
    type: 'select',
    required: true,
    options: [
      { value: 'MONDAY', label: 'Monday' },
      { value: 'TUESDAY', label: 'Tuesday' },
      { value: 'WEDNESDAY', label: 'Wednesday' },
      { value: 'THURSDAY', label: 'Thursday' },
      { value: 'FRIDAY', label: 'Friday' },
      { value: 'SATURDAY', label: 'Saturday' },
    ],
  },
  { name: 'slotIndex', label: 'Slot Index', type: 'number', required: true, defaultValue: 1 },
  { name: 'startTime', label: 'Start Time (HH:mm)', required: true, placeholder: '09:00' },
  { name: 'endTime', label: 'End Time (HH:mm)', required: true, placeholder: '10:00' },
  {
    name: 'slotType',
    label: 'Slot Type',
    type: 'select',
    options: [
      { value: 'LECTURE', label: 'Lecture' },
      { value: 'LAB', label: 'Lab' },
      { value: 'BREAK', label: 'Break' },
      { value: 'LUNCH', label: 'Lunch' },
    ],
  },
];

function TimeSlotsPage() {
  return <ResourceCrudPage title="Time Slots" api={timeSlotsApi} columns={columns} fields={fields} />;
}

export default TimeSlotsPage;
