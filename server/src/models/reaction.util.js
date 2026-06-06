// Shared helpers for emoji reactions (posts/comments)
// Keeping this file small and optional; not required at runtime.

export const isValidEmoji = (emoji) => {
  // Basic sanity: non-empty string.
  return typeof emoji === 'string' && emoji.trim().length > 0;
};

