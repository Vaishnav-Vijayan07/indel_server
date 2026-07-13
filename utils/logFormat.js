// Formats a Date as "Jul 3, 2026, 2:45:10 PM" in the server's local timezone
const formatDateTime = (date) =>
  date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

// Formats a millisecond duration as "30d" / "15m" / "45s", for log readability
const formatDuration = (ms) => {
  const totalSeconds = Math.round(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds && !days) parts.push(`${seconds}s`);

  return parts.length ? parts.join(" ") : "0s";
};

module.exports = { formatDateTime, formatDuration };
