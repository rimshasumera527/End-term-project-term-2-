// "HH:MM" helpers shared by the availability and booking engines.
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => toMin(aStart) < toMin(bEnd) && toMin(bStart) < toMin(aEnd);

// Combine a session date (day) with an "HH:MM" time into a full Date.
const atTime = (date, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
};

module.exports = { toMin, overlaps, atTime };
