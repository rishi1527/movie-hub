/**
 * Utility functions for formatting and common helpers
 */

// Format runtime minutes to 'Xh Ym' format
export const formatRuntime = (minutes) => {
  if (!minutes || typeof minutes !== 'number') return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

// Format date string to formatted release year or readable date
export const formatReleaseYear = (dateString) => {
  if (!dateString) return 'TBA';
  const date = new Date(dateString);
  return isNaN(date.getFullYear()) ? 'TBA' : date.getFullYear();
};

// Format rating number to 1 decimal place
export const formatRating = (rating) => {
  if (rating === undefined || rating === null) return 'NR';
  return Number(rating).toFixed(1);
};
