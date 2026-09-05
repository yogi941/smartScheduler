function buildColorPalette(timeSlots) {
  const palette = { LECTURE: [], LAB: [] };

  timeSlots
    .filter((slot) => slot.slotType === 'LECTURE' || slot.slotType === 'LAB')
    .forEach((slot) => {
      const timeSlotId = slot._id.toString();
      const color = {
        colorKey: `${slot.day}::${timeSlotId}`,
        day: slot.day,
        timeSlotId,
      };

      if (slot.slotType === 'LAB') {
        palette.LAB.push(color);
      } else {
        palette.LECTURE.push(color);
      }
    });

  return palette;
}

module.exports = { buildColorPalette };
