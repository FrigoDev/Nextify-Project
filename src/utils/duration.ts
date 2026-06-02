// Human-readable total duration, e.g. "42 min" or "1 h 5 min".
export const formatTotal = (ms: number): string => {
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  return `${hours} h ${totalMinutes % 60} min`;
};
