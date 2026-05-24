import { useState, useEffect } from 'preact/hooks'
import { Pencil, Eye, X, Check, Link, Car, Sparkles, Image, User } from 'lucide-preact'
import { Button } from './components/Button'
import { Input } from './components/Input'
import { Card } from './components/Card'
import './components/Button.css'
import './components/Input.css'
import './components/Card.css'

interface NametagData {
  id?: number
  name?: string
  licenseClass?: string
  avatar?: string
  banner?: string
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
  distance?: number
  vehicleName?: string
}

interface PresetItem {
  name: string
  value: string
}

interface PresetsData {
  banners: PresetItem[]
  avatars: PresetItem[]
}

function nuiPost(endpoint: string, data: object = {}) {
  if (typeof GetParentResourceName === 'undefined') {
    console.log(`[Browser Preview] NUI Post to ${endpoint}:`, data);
    return;
  }
  fetch(`https://${GetParentResourceName()}/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).catch(() => {})
}

function getBannerStyle(banner: string | undefined) {
  if (!banner) return {}
  if (banner.startsWith('gradient:')) {
    return { background: banner.substring(9) }
  }
  return { backgroundImage: `url(${banner})` }
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
  distance,
  vehicleName,
  isStatic = false,
}: {
  data: NametagData
  x?: number
  y?: number
  scale?: number
  opacity?: number
  distance?: number
  vehicleName?: string
  isStatic?: boolean
}) {
  const licenseClass = data.licenseClass || 'D'
  const avatarUrl = data.avatar || 'https://raw.githubusercontent.com/SPiceZ21/spz-core-media-kit/main/Extra/nametag_profile.png'
  const style = isStatic
    ? {}
    : { left: `${x}%`, top: `${y}%`, opacity, transform: `translate(-50%, -100%) scale(${scale})`, position: 'absolute' as const }

  return (
    <div class={`nametag-wrapper ${isStatic ? 'static-tag' : ''}`} style={style}>
      <div class={`nametag-card license-border-${licenseClass}`}>
        <div class="bg-num">{licenseClass}</div>
        
        {/* Banner Area */}
        <div class="nametag-banner" style={getBannerStyle(data.banner)} />
        
        {/* Content Area */}
        <div class="nametag-content">
          <div class="nametag-avatar-container">
            <img class="nametag-avatar" src={avatarUrl} alt="Avatar" />
            {data.isTalking && <AudioEqualizer />}
          </div>
          
          <div class="nametag-details">
            <div class="nametag-top">
              {data.crew && <span class="nametag-crew">[{data.crew}]</span>}
              <span class="nametag-name">{data.name || 'Unknown'}</span>
            </div>
            
            <div class="nametag-telemetry">
              <div class={`nametag-license license-${licenseClass}`}>
                {data.license || 'D-5'}
              </div>
              
              {vehicleName && (
                <div class="nametag-vehicle" title="Driving vehicle">
                  <Car size={10} style={{ marginRight: 3 }} />
                  <span>{vehicleName}</span>
                </div>
              )}
              
              {distance !== undefined && (
                <div class="nametag-distance" title="Distance to player">
                  <span>{distance}m</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {data.isRacing && <div class="racing-glow" />}
      </div>
    </div>
  )
}

function Editor({ 
  data, 
  presets, 
  onSave, 
  onCancel 
}: { 
  data: NametagData
  presets: PresetsData
  onSave: (d: Partial<NametagData>) => void
  onCancel: () => void 
}) {
  const [avatar, setAvatar] = useState(data.avatar || '')
  const [banner, setBanner] = useState(data.banner || '')
  const [activeTab, setActiveTab] = useState<'custom' | 'avatars' | 'banners'>('custom')
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const fetchDiscord = () => {
    if (typeof GetParentResourceName === 'undefined') {
      setAvatar("https://i.ibb.co/F8bBfPy/helmet-gold.png")
      return
    }
    fetch(`https://${GetParentResourceName()}/fetchDiscord`, { method: 'POST', body: JSON.stringify({}) })
      .then(r => r.json())
      .then(d => { if (d.avatar) setAvatar(d.avatar) })
      .catch(() => {})
  }

  const handleMouseMove = (e: MouseEvent) => {
    const card = e.currentTarget as HTMLElement
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = -(y / rect.height) * 20
    const rotateY = (x / rect.width) * 20
    setTilt({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div class="editor-screen">
      <div class="editor-backdrop" onClick={onCancel} />
      <Card className="editor-modal" variant="glass" padding="lg">
        <div class="editor-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--color-primary)', display: 'flex' }}><Pencil size={16} /></span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: 13, color: 'var(--gray-50)', margin: 0, textTransform: 'uppercase' }}>
                Edit Nametag
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: 11, margin: 0 }}>Customize your identity on the grid</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onCancel}><X size={14} /></Button>
        </div>

        {/* 3D Interactive Live Preview */}
        <div class="editor-preview-section">
          <div class="spz-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Eye size={12} /> Live Preview (Move cursor over tag)
          </div>
          <div 
            class="interactive-preview-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.5s ease' : 'none'
            }}
          >
            <Nametag data={{ ...data, avatar, banner }} isStatic distance={35} vehicleName="BANSHEE" />
          </div>
        </div>

        {/* Editor Tabs Navigation */}
        <div class="editor-tabs">
          <button class={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => setActiveTab('custom')}>
            <Sparkles size={12} /> Custom
          </button>
          <button class={`tab-btn ${activeTab === 'avatars' ? 'active' : ''}`} onClick={() => setActiveTab('avatars')}>
            <User size={12} /> Presets Avatars
          </button>
          <button class={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => setActiveTab('banners')}>
            <Image size={12} /> Presets Banners
          </button>
        </div>

        <div class="editor-content-box">
          {activeTab === 'custom' && (
            <div class="editor-form">
              <div>
                <label class="spz-eyebrow" style={{ display: 'block', marginBottom: 6 }}>Custom Avatar URL</label>
                <Input value={avatar} onInput={(e: Event) => setAvatar((e.target as HTMLInputElement).value)} placeholder="https://i.imgur.com/..." />
                <Button variant="outline" style={{ width: '100%', marginTop: 6, fontSize: 11 }} onClick={fetchDiscord}>
                  <Link size={12} style={{ marginRight: 6 }} /> Sync Discord Profile Photo
                </Button>
              </div>
              <div>
                <label class="spz-eyebrow" style={{ display: 'block', marginBottom: 6 }}>Custom Banner URL</label>
                <Input value={banner} onInput={(e: Event) => setBanner((e.target as HTMLInputElement).value)} placeholder="https://i.imgur.com/..." />
              </div>
            </div>
          )}

          {activeTab === 'avatars' && (
            <div class="presets-grid">
              {presets.avatars.map(av => (
                <div 
                  class={`preset-card avatar-preset ${avatar === av.value ? 'selected' : ''}`}
                  onClick={() => setAvatar(av.value)}
                  title={av.name}
                >
                  <img src={av.value} alt={av.name} />
                  <div class="preset-name">{av.name}</div>
                  {avatar === av.value && <div class="badge-check"><Check size={10} /></div>}
                </div>
              ))}
              {presets.avatars.length === 0 && (
                <div class="no-presets">No preset avatars configured.</div>
              )}
            </div>
          )}

          {activeTab === 'banners' && (
            <div class="presets-grid">
              {presets.banners.map(bn => (
                <div 
                  class={`preset-card banner-preset ${banner === bn.value ? 'selected' : ''}`}
                  onClick={() => setBanner(bn.value)}
                  title={bn.name}
                >
                  <div class="preset-banner-preview" style={getBannerStyle(bn.value)} />
                  <div class="preset-name">{bn.name}</div>
                  {banner === bn.value && <div class="badge-check"><Check size={10} /></div>}
                </div>
              ))}
              {presets.banners.length === 0 && (
                <div class="no-presets">No preset banners configured.</div>
              )}
            </div>
          )}
        </div>

        <div class="editor-footer">
          <Button variant="ghost" onClick={onCancel} style={{ fontSize: 12 }}><X size={13} style={{ marginRight: 4 }} /> Cancel</Button>
          <Button variant="primary" onClick={() => onSave({ avatar, banner })} style={{ fontSize: 12 }}><Check size={13} style={{ marginRight: 4 }} /> Save Changes</Button>
        </div>
      </Card>
    </div>
  )
}

export function App() {
  const [worldTags, setWorldTags] = useState<WorldTag[]>([])
  const [selfTag, setSelfTag] = useState<NametagData | null>(null)
  const [editorData, setEditorData] = useState<NametagData | null>(null)
  const [presets, setPresets] = useState<PresetsData>({ banners: [], avatars: [] })

  useEffect(() => {
    if (typeof GetParentResourceName === 'undefined') {
      import('./mockdata').then(m => {
        setWorldTags(m.MOCK_NAMETAG_DATA.worldTags)
        setSelfTag(m.MOCK_NAMETAG_DATA.selfTag)
        setPresets(m.MOCK_NAMETAG_DATA.presets)
        setEditorData(m.MOCK_NAMETAG_DATA.selfTag)
      })
      return
    }

    const handler = (e: MessageEvent) => {
      const { action, payload, nametags, presets: loadedPresets } = e.data
      if (action === 'update') {
        setWorldTags(nametags || [])
      } else if (action === 'updateSelf') {
        setSelfTag(payload)
      } else if (action === 'clear') {
        setWorldTags([])
        setSelfTag(null)
      } else if (action === 'openEditor') {
        setEditorData(payload)
        if (loadedPresets) {
          setPresets(loadedPresets)
        }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const save = (data: Partial<NametagData>) => {
    nuiPost('saveNametag', data)
    nuiPost('closeEditor')
    setEditorData(null)
  }

  const cancel = () => {
    nuiPost('closeEditor')
    setEditorData(null)
  }

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
            distance={tag.distance} 
            vehicleName={tag.vehicleName} 
          />
        ))}
      </div>
      {selfTag && (
        <div id="self-nametag-container">
          <Nametag data={selfTag} isStatic />
        </div>
      )}
      {editorData && <Editor data={editorData} presets={presets} onSave={save} onCancel={cancel} />}
    </>
  )
}
