function buildConstraintIndex(constraints) {
  const index = {
    teacher: new Map(),
    room: new Map(),
    laboratory: new Map(),
    batch: new Map(),
  };

  const modelToBucket = {
    Teacher: 'teacher',
    Room: 'room',
    Laboratory: 'laboratory',
    StudentBatch: 'batch',
  };

  constraints.forEach((constraint) => {
    if (!constraint.day || !constraint.timeSlot) {
      return;
    }

    const bucketName = modelToBucket[constraint.appliesToModel];
    if (!bucketName) {
      return;
    }

    const bucket = index[bucketName];
    const entityId = (constraint.appliesTo._id || constraint.appliesTo).toString();
    const timeSlotId = (constraint.timeSlot._id || constraint.timeSlot).toString();
    const colorKey = `${constraint.day}::${timeSlotId}`;

    if (!bucket.has(entityId)) {
      bucket.set(entityId, new Set());
    }
    bucket.get(entityId).add(colorKey);
  });

  return index;
}

module.exports = { buildConstraintIndex };
