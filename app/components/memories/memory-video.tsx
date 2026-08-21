'use client'

import { useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import type { MemoryVideo } from '../../memories/data'

type MemoryVideoProps = {
  entry: MemoryVideo
  mediaNumber: number
}

export function MemoryVideoEntry({ entry, mediaNumber }: MemoryVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)

  const toggleMuted = () => {
    const video = videoRef.current
    if (!video) return

    const nextMuted = !muted
    video.muted = nextMuted
    setMuted(nextMuted)
    if (!nextMuted) void video.play().catch(() => undefined)
  }

  return (
    <figure
      className="memory-entry memory-video"
      data-layout={entry.layout}
      data-parallax={entry.parallax}
      data-memory-item
    >
      <span className="memory-video-window">
        <span className="memory-video-parallax" data-parallax>
          <video
            ref={videoRef}
            src={entry.localPath}
            poster={entry.poster}
            width={entry.width}
            height={entry.height}
            aria-label={entry.ariaLabel ?? 'Memory video'}
            autoPlay
            loop
            muted={muted}
            playsInline
            preload="metadata"
          />
        </span>
        <button
          type="button"
          className="memory-video-volume"
          aria-label={muted ? 'Unmute video' : 'Mute video'}
          onClick={toggleMuted}
        >
          {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
        </button>
      </span>
      <span className="memory-photo-index" aria-hidden="true">
        {String(mediaNumber).padStart(2, '0')}
      </span>
      {entry.caption ? <figcaption>{entry.caption}</figcaption> : null}
    </figure>
  )
}
