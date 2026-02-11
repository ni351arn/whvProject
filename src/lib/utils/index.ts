export function generateId(): string {
  // Use native crypto.randomUUID if available (Secure Contexts: HTTPS, localhost)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 generator for HTTP (e.g. mobile testing on LAN)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern API (works in HTTPS / Localhost)
  try {
    if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
    }
  } catch (e) {
    // Fall through to fallback
  }

  // 2. Fallback for HTTP / Older Browsers
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Low-key styling to avoid layout shift
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard failed', err);
    return false;
  }
}
