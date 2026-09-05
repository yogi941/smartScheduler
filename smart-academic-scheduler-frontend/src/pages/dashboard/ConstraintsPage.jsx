import ResourceCrudPage from '../../components/crud/ResourceCrudPage';
import { constraintsApi } from '../../api/resources';

const columns = [
  { key: 'constraintType', label: 'Constraint Type' },
  { key: 'appliesToModel', label: 'Target Model' },
  { key: 'day', label: 'Day' },
  { key: 'description', label: 'Description' },
  { key: 'isActive', label: 'Status' },
];

const fields = [
  {
    name: 'constraintType',
    label: 'Constraint Type',
    type: 'select',
    required: true,
    options: [
      { value: 'TEACHER_AVAILABILITY', label: 'Teacher Availability' },
      { value: 'ROOM_AVAILABILITY', label: 'Room Availability' },
      { value: 'LAB_AVAILABILITY', label: 'Lab Availability' },
      { value: 'SUBJECT_HOURS', label: 'Subject Hours' },
      { value: 'LUNCH_BREAK', label: 'Lunch Break' },
      { value: 'HOLIDAY', label: 'Holiday' },
      { value: 'SEMESTER_RULE', label: 'Semester Rule' },
    ],
  },
  {
    name: 'appliesToModel',
    label: 'Target Model',
    type: 'select',
    required: true,
    options: [
      { value: 'Teacher', label: 'Teacher' },
      { value: 'Room', label: 'Room' },
      { value: 'Laboratory', label: 'Laboratory' },
      { value: 'StudentBatch', label: 'Student Batch' },
      { value: 'Subject', label: 'Subject' },
      { value: 'Semester', label: 'Semester' },
    ],
  },
  { name: 'appliesTo', label: 'Target Entity ObjectId', required: true, placeholder: 'MongoDB ObjectId' },
  {
    name: 'day',
    label: 'Day of Week (Optional)',
    type: 'select',
    options: [
      { value: 'MONDAY', label: 'Monday' },
      { value: 'TUESDAY', label: 'Tuesday' },
      { value: 'WEDNESDAY', label: 'Wednesday' },
      { value: 'THURSDAY', label: 'Thursday' },
      { value: 'FRIDAY', label: 'Friday' },
      { value: 'SATURDAY', label: 'Saturday' },
    ],
  },
  { name: 'description', label: 'Description', required: true, placeholder: 'Teacher unavailable on Friday mornings' },
];

function ConstraintsPage() {
  return <ResourceCrudPage title="Constraints" api={constraintsApi} columns={columns} fields={fields} />;
}

export default ConstraintsPage;
