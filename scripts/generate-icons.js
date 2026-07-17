import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const sizes = [192, 256, 512]
const badgeSize = 96

function svgIcon(size, isBadge = false) {
  const stroke = isBadge ? 0 : 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d97706"/>
      <stop offset="100%" style="stop-color:#b45309"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
  <text x="${size / 2}" y="${size * 0.72}" text-anchor="middle" font-size="${size * 0.55}" font-weight="800" fill="white" font-family="-apple-system,BlinkMacSystemFont,sans-serif">F</text>
</svg>`
}

for (const size of sizes) {
  const name = `pwa-${size}x${size}.png`
  const svgContent = svgIcon(size)
  writeFileSync(join(publicDir, `${name}.svg`), svgContent)
  console.log(`Created ${name}.svg`)
}

const badge = svgIcon(badgeSize, true)
writeFileSync(join(publicDir, 'badge-icon.svg'), badge)
console.log('Created badge-icon.svg')

console.log('\nSVG icons created. Convert to PNG via:\n  npx svgexport public/pwa-192x192.svg public/pwa-192x192.png 192:192')
console.log('Or use any SVG-to-PNG converter.')
