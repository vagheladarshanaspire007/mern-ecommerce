const API_URL = import.meta.env.VITE_API_URL || '';
export const DEFAULT_IMAGE_PLACEHOLDER = 'https://placehold.co/600x400?text=No+Image';

function getApiOrigin() {
  if (!API_URL) return '';

  try {
    const parsed = new URL(API_URL);
    return parsed.origin;
  } catch {
    return '';
  }
}

const API_ORIGIN = getApiOrigin();

export function resolveImageUrl(url?: string | null): string {
  if (!url) {
    return DEFAULT_IMAGE_PLACEHOLDER;
  }

  if (/^(?:https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return API_ORIGIN ? `${API_ORIGIN}${url}` : url;
  }

  return API_ORIGIN ? `${API_ORIGIN}/${url}` : url;
}
