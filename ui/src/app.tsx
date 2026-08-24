import { useState, useEffect } from 'preact/hooks'

interface NametagData {
  id?: number
  name?: string
  licenseClass?: string
  crew?: string
  isTalking?: boolean
  isRacing?: boolean
  license?: string
  nation?: string      // ISO 3166-1 alpha-2, lowercase
  raceNumber?: number  // 1-99
  records?: number     // track records currently held (crown when > 0)
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
  const licenseClass = (data.licenseClass && data.licenseClass !== '**INVALID**') ? data.licenseClass : 'D'
  const rawRank = (data.license && data.license !== '**INVALID**') ? data.license : `${licenseClass}-5`
  const rank = rawRank.includes('**INVALID**') ? 'D-5' : rawRank

  let displayName = data.name || ''
  if (!displayName || displayName === '**INVALID**' || displayName.includes('**INVALID**')) {
    displayName = 'Driver'
  }

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

      {/* floating name (no box) + F1-style flag/number */}
      <div class="nt-body">
        {typeof data.records === 'number' && data.records > 0 && (
          <span class="nt-crown" title="Track record holder">
            👑{data.records > 1 ? data.records : ''}
          </span>
        )}
        {data.nation && (
          <img class="nt-flag" src={`flags/${data.nation}.webp`} alt="" />
        )}
        {data.crew && <span class="nt-crew">{data.crew}</span>}
        <span class="nt-name">{displayName}</span>
        {data.raceNumber != null && <span class="nt-num">{data.raceNumber}</span>}
      </div>
    </div>
  )
}

// Base theme (server.cfg spz_theme_* convars, pushed from spz-core) mapped
// onto this page's own CSS variable names (theme.css). Unknown/missing keys
// are a no-op since the stylesheet's own defaults still apply.
const THEME_VARS: Record<string, string> = {
  accent: '--color-primary',
  accent2: '--color-secondary',
  bg: '--bg-app',
  bg2: '--bg-card',
}
// rgba(...) glows/tints reference the accent as raw components so they can
// carry their own alpha — keep those in sync too.
const THEME_RGB_VARS: Record<string, string> = { accent: '--color-primary-rgb' }
function hexToRgbTriplet(hex?: string): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : null
}
function applyTheme(theme?: Record<string, string>) {
  if (!theme) return
  for (const key in THEME_VARS) {
    if (theme[key]) document.documentElement.style.setProperty(THEME_VARS[key], theme[key])
  }
  for (const key in THEME_RGB_VARS) {
    const rgb = theme[key] && hexToRgbTriplet(theme[key])
    if (rgb) document.documentElement.style.setProperty(THEME_RGB_VARS[key], rgb)
  }
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
      const { action, payload, nametags, theme } = e.data
      if (action === 'update') {
        setWorldTags(nametags || [])
      } else if (action === 'updateSelf') {
        setSelfTag(payload)
      } else if (action === 'clear') {
        setWorldTags([])
        setSelfTag(null)
      } else if (action === 'theme') {
        applyTheme(theme)
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
