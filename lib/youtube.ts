export interface YouTubeVideoInfo {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();

  // If already 11 chars
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Standard or short URLs
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = clean.match(regExp);
  return match ? match[1] : null;
}

export function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([^#&?]+)/);
  return match ? match[1] : null;
}

export async function fetchYouTubeVideoInfo(videoId: string): Promise<YouTubeVideoInfo> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      return {
        id: videoId,
        title: data.title || `Video ${videoId}`,
        thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch {
    // Fallback on error
  }

  return {
    id: videoId,
    title: `Pujian/Doa (${videoId})`,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}
