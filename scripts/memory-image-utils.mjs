import { createHash } from 'node:crypto'

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

export function readImageMetadata(buffer) {
  if (isJpeg(buffer)) {
    return { mimeType: 'image/jpeg', ...readJpegDimensions(buffer) }
  }

  if (isPng(buffer)) {
    if (buffer.length < 24) throw new Error('Truncated PNG')
    return {
      mimeType: 'image/png',
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    }
  }

  throw new Error(`Unsupported or corrupt image signature: ${buffer.subarray(0, 12).toString('hex')}`)
}

function isJpeg(buffer) {
  return buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8
}

function isPng(buffer) {
  return (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
}

function readJpegDimensions(buffer) {
  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ])

  let offset = 2
  while (offset + 4 <= buffer.length) {
    while (offset < buffer.length && buffer[offset] !== 0xff) offset += 1
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1
    if (offset >= buffer.length) break

    const marker = buffer[offset]
    offset += 1

    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue
    if (offset + 2 > buffer.length) break

    const segmentLength = buffer.readUInt16BE(offset)
    if (segmentLength < 2 || offset + segmentLength > buffer.length) {
      throw new Error('Corrupt JPEG segment length')
    }

    if (startOfFrameMarkers.has(marker)) {
      if (segmentLength < 7) throw new Error('Truncated JPEG start-of-frame segment')
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3),
      }
    }

    offset += segmentLength
  }

  throw new Error('JPEG dimensions were not found')
}
