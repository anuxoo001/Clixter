export const isVideoUrl = (url = "") => {
  const str = String(url).toLowerCase();
  return (
    str.includes("video/upload") ||
    /\.(mp4|webm|mov|m4v)(\?|#|$)/.test(str)
  );
};