/**
 * Formats a Unix timestamp (seconds) into localized string
 */
export function formatTimestamp(timestampInSeconds: number | bigint): string {
  const ts = Number(timestampInSeconds) * 1000;
  if (!ts || isNaN(ts)) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).format(new Date(ts));
}

/**
 * Formats a Unix timestamp (seconds) into UTC ISO-like format
 */
export function formatUtc(timestampInSeconds: number | bigint): string {
  const ts = Number(timestampInSeconds) * 1000;
  if (!ts || isNaN(ts)) return 'N/A';
  return new Date(ts).toUTCString();
}

/**
 * Relative time calculation (e.g. "12 seconds ago" or "in 5 minutes")
 */
export function formatRelativeTime(timestampInSeconds: number | bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Number(timestampInSeconds) - now;
  const absDiff = Math.abs(diff);

  const seconds = absDiff;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let str = '';
  if (days > 0) {
    str = `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    str = `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    str = `${minutes}m ${seconds % 60}s`;
  } else {
    str = `${seconds}s`;
  }

  if (diff > 0) {
    return `in ${str}`;
  } else if (diff < 0) {
    return `${str} ago`;
  } else {
    return 'just now';
  }
}

/**
 * Formats duration given in seconds (e.g. 125s -> "2m 5s")
 */
export function formatDurationSeconds(seconds: number | bigint): string {
  const s = Math.abs(Number(seconds));
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = Math.floor(s % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Shorten Ethereum address or hash
 */
export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function shortenHash(hash?: string, chars = 6): string {
  if (!hash) return '';
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.substring(0, chars + 2)}...${hash.substring(hash.length - chars)}`;
}

/**
 * Format gas number into friendly display with commas
 */
export function formatNumberWithCommas(num: number | bigint | string): string {
  if (num === undefined || num === null) return '0';
  return BigInt(num).toLocaleString();
}
