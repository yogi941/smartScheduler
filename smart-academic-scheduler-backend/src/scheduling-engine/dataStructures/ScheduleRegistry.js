class ScheduleRegistry {
  constructor() {
    this.teacherSchedule = new Map();
    this.roomSchedule = new Map();
    this.batchSchedule = new Map();
  }

  _bucket(map, key) {
    if (!map.has(key)) {
      map.set(key, new Set());
    }
    return map.get(key);
  }

  isTeacherFree(teacherId, colorKey) {
    return !this._bucket(this.teacherSchedule, teacherId).has(colorKey);
  }

  isRoomFree(roomId, colorKey) {
    return !this._bucket(this.roomSchedule, roomId).has(colorKey);
  }

  isBatchFree(batchId, colorKey) {
    return !this._bucket(this.batchSchedule, batchId).has(colorKey);
  }

  bookTeacher(teacherId, colorKey) {
    this._bucket(this.teacherSchedule, teacherId).add(colorKey);
  }

  bookRoom(roomId, colorKey) {
    this._bucket(this.roomSchedule, roomId).add(colorKey);
  }

  bookBatch(batchId, colorKey) {
    this._bucket(this.batchSchedule, batchId).add(colorKey);
  }

  releaseTeacher(teacherId, colorKey) {
    this._bucket(this.teacherSchedule, teacherId).delete(colorKey);
  }

  releaseRoom(roomId, colorKey) {
    this._bucket(this.roomSchedule, roomId).delete(colorKey);
  }

  releaseBatch(batchId, colorKey) {
    this._bucket(this.batchSchedule, batchId).delete(colorKey);
  }
}

module.exports = ScheduleRegistry;
