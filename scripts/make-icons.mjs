// Génère les icônes PNG de la PWA sans dépendance (pièce dorée sur fond émeraude).
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

const BRAND = [12, 125, 94]
const LIGHT = [233, 185, 73]

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size, { rounded }) {
  const raw = Buffer.alloc((size * 3 + 1) * size)
  const c = size / 2
  const rOuter = size * 0.29
  const rInner = size * 0.19
  const corner = size * 0.22
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c)
      let col = BRAND
      if (d < rOuter) col = d < rInner ? BRAND : LIGHT
      if (rounded) {
        const dx = Math.max(Math.abs(x + 0.5 - c) - (c - corner), 0)
        const dy = Math.max(Math.abs(y + 0.5 - c) - (c - corner), 0)
        if (Math.hypot(dx, dy) > corner) col = LIGHT
      }
      const o = y * (size * 3 + 1) + 1 + x * 3
      raw[o] = col[0]
      raw[o + 1] = col[1]
      raw[o + 2] = col[2]
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })
writeFileSync('public/icons/icon-192.png', png(192, { rounded: true }))
writeFileSync('public/icons/icon-512.png', png(512, { rounded: true }))
writeFileSync('public/icons/icon-512-maskable.png', png(512, { rounded: false }))
console.log('icons generated')

