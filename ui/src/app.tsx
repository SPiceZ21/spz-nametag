import { useState, useEffect } from 'preact/hooks'

interface NametagData {
  id?: number
  name?: string
  licenseClass?: string
  crew?: string
  isTalking?: boolean
  isRacing?: boolean
  license?: string
}

interface WorldTag extends NametagData {
  x: number
  y: number
  scale: number
  opacity: number
}

const AudioEqualizer = () => (
  <div class="audio-equalizer" title="Speaking">
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
  </div>
)

function Nametag({
  data,
  x,
  y,
  scale,
  opacity,
  isStatic = false,
}: {
  data: NametagData
  x?: number
  y?: number
  scale?: number
  opacity?: number
  isStatic?: boolean
}) {
  const licenseClass = data.licenseClass || 'D'
  const rank = data.license || `${licenseClass}-5`
  const style = isStatic
    ? {}
    : { left: `${x}%`, top: `${y}%`, opacity, transform: `translate(-50%, -100%) scale(${scale})`, position: 'absolute' as const }

  return (
    <div class={`nt cls-${licenseClass} ${isStatic ? 'static-tag' : ''}`} style={style}>
      {/* rank plate — the only solid element */}
      <div class={`nt-plate ${data.isRacing ? 'racing' : ''} ${data.isTalking ? 'talking' : ''}`}>
        <span class="nt-plate-rank">{rank}</span>
        {data.isTalking && <AudioEqualizer />}
      </div>

      {/* floating name (no box) + crew tag box */}
      <div class="nt-body">
        {data.crew && <span class="nt-crew">{data.crew}</span>}
        <span class="nt-name">{data.name || 'Unknown'}</span>
      </div>
    </div>
  )
}

export function App() {
  const [worldTags, setWorldTags] = useState<WorldTag[]>([])
  const [selfTag, setSelfTag] = useState<NametagData | null>(null)

  useEffect(() => {
    if (typeof GetParentResourceName === 'undefined') {
      import('./mockdata').then(m => {
        setWorldTags(m.MOCK_NAMETAG_DATA.worldTags)
        setSelfTag(m.MOCK_NAMETAG_DATA.selfTag)
      })
      return
    }

    const handler = (e: MessageEvent) => {
      const { action, payload, nametags } = e.data
      if (action === 'update') {
        setWorldTags(nametags || [])
      } else if (action === 'updateSelf') {
        setSelfTag(payload)
      } else if (action === 'clear') {
        setWorldTags([])
        setSelfTag(null)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <>
      <div id="nametag-container">
        {worldTags.map(tag => (
          <Nametag
            key={tag.id}
            data={tag}
            x={tag.x}
            y={tag.y}
            scale={tag.scale}
            opacity={tag.opacity}
          />
        ))}
      </div>
      {selfTag && (
        <div id="self-nametag-container">
          <Nametag data={selfTag} isStatic />
        </div>
      )}
    </>
  )
}
