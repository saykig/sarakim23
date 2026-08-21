import type { MemoryEphemera } from '../../memories/data'

type EphemeraNoteProps = {
  entry: MemoryEphemera
}

export function EphemeraNote({ entry }: EphemeraNoteProps) {
  return (
    <aside
      className="ephemera-note"
      data-note-type={entry.noteType}
      data-related-photo={entry.relatedPhoto}
      aria-label={`${entry.noteType[0].toUpperCase()}${entry.noteType.slice(1)} note`}
    >
      <span className="ephemera-note-mark" aria-hidden="true" />
      <p>{entry.text}</p>
    </aside>
  )
}
