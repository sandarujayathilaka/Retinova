const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const getStartEndOfDay = (dateString) => {
  const date = new Date(dateString);
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
};

const getStartEndOfMonth = (monthString) => {
  const [year, month] = monthString.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
};

module.exports = { isValidDate, getStartEndOfDay, getStartEndOfMonth };
