export const parseTimestamp = (timestamp) => {
  if (!timestamp) return null;

  if (typeof timestamp?.toDate === "function") {
    return timestamp.toDate();
  }

  if (timestamp?.seconds) {
    const milliseconds = timestamp.seconds * 1000;
    const nanoseconds = timestamp.nanoseconds || 0;
    return new Date(milliseconds + Math.floor(nanoseconds / 1000000));
  }

  if (typeof timestamp === "number") {
    return new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);
  }

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatCreatedTimestamp = (timestamp) => {
  const date = parseTimestamp(timestamp);
  if (!date) return null;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
