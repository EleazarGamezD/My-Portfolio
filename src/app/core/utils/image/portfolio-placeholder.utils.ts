function escapeSvgText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createPortfolioPlaceholder(label: string, width = 1200, height = 800) {
  const safeLabel = escapeSvgText(label);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#eff4fb"/>
          <stop offset="100%" stop-color="#d9e6f5"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="28" fill="none" stroke="#7f8da1" stroke-dasharray="14 10" stroke-width="4"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#24416b" font-family="Arial, sans-serif" font-size="${Math.max(
        28,
        Math.floor(width / 18),
      )}" font-weight="700">${safeLabel}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
