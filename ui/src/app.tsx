import { useState, useEffect } from 'preact/hooks'
import { Pencil, Eye, X, Check, Link } from 'lucide-preact'
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
}

function nuiPost(endpoint: string, data: object = {}) {
  fetch(`https://${GetParentResourceName()}/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }).catch(() => {})
}

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
  const avatarUrl = data.avatar || 'https://i.imgur.com/8NzA8m8.png'
  const style = isStatic
    ? {}
    : { left: `${x}%`, top: `${y}%`, opacity, transform: `translate(-50%, -100%) scale(${scale})`, position: 'absolute' as const }

  return (
    <div class={isStatic ? '' : 'nametag'} style={style}>
      <div class="nametag-card">
        <div class="bg-num">{licenseClass}</div>
        {data.banner && <img class="nametag-banner-img" src={data.banner} />}
        <div class="nametag-content">
          <div class="nametag-avatar-container">
            <img class="nametag-avatar" src={avatarUrl} />
            {data.isTalking && <div class="talking-indicator" />}
          </div>
          <div class="nametag-details">
            <div class="nametag-top">
              {data.crew && <span class="nametag-crew">[{data.crew}]</span>}
              <span class="nametag-name">{data.name || 'Unknown'}</span>
            </div>
            <div>
              <div class={`nametag-license license-${licenseClass}`}>{data.license || 'D-5'}</div>
            </div>
          </div>
        </div>
        {data.isRacing && <div class="racing-glow" />}
      </div>
    </div>
  )
}

function Editor({ data, onSave, onCancel }: { data: NametagData; onSave: (d: Partial<NametagData>) => void; onCancel: () => void }) {
  const [avatar, setAvatar] = useState(data.avatar || '')
  const [banner, setBanner] = useState(data.banner || '')

  const fetchDiscord = () => {
    fetch(`https://${GetParentResourceName()}/fetchDiscord`, { method: 'POST', body: JSON.stringify({}) })
      .then(r => r.json())
      .then(d => { if (d.avatar) setAvatar(d.avatar) })
      .catch(() => {})
  }

  return (
    <div class="editor-screen">
      <div class="editor-backdrop" onClick={onCancel} />
      <Card className="editor-modal" variant="glass" padding="lg">
        <div class="editor-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--color-primary)', display: 'flex' }}><Pencil size={16} /></span>
            <div>
              <h3 style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: 15, color: 'var(--gray-50)', margin: 0 }}>
                Edit Nametag
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: 12, margin: 0 }}>Customize your presence on track</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onCancel}><X size={14} /></Button>
        </div>

        <div class="editor-preview-section">
          <div class="spz-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={12} /> Live Preview
          </div>
          <div style={{ width: 300, minHeight: 60 }}>
            <Nametag data={{ ...data, avatar, banner }} isStatic />
          </div>
        </div>

        <div class="editor-form">
          <div>
            <label class="spz-eyebrow" style={{ display: 'block', marginBottom: 6 }}>Avatar URL</label>
            <Input value={avatar} onInput={(e: Event) => setAvatar((e.target as HTMLInputElement).value)} placeholder="https://..." />
            <Button variant="outline" style={{ width: '100%', marginTop: 4 }} onClick={fetchDiscord}>
              <Link size={13} /> Use Discord Avatar
            </Button>
          </div>
          <div>
            <label class="spz-eyebrow" style={{ display: 'block', marginBottom: 6 }}>Banner URL</label>
            <Input value={banner} onInput={(e: Event) => setBanner((e.target as HTMLInputElement).value)} placeholder="https://..." />
          </div>
        </div>

        <div class="editor-footer">
          <Button variant="ghost" onClick={onCancel}><X size={13} /> Cancel</Button>
          <Button variant="primary" onClick={() => onSave({ avatar, banner })}><Check size={13} /> Save Changes</Button>
        </div>
      </Card>
    </div>
  )
}

export function App() {
  const [worldTags, setWorldTags] = useState<WorldTag[]>([])
  const [selfTag, setSelfTag] = useState<NametagData | null>(null)
  const [editorData, setEditorData] = useState<NametagData | null>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const { action, payload, nametags } = e.data
      if (action === 'update') setWorldTags(nametags || [])
      else if (action === 'updateSelf') setSelfTag(payload)
      else if (action === 'clear') { setWorldTags([]); setSelfTag(null) }
      else if (action === 'openEditor') setEditorData(payload)
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
          <Nametag key={tag.id} data={tag} x={tag.x} y={tag.y} scale={tag.scale} opacity={tag.opacity} />
        ))}
      </div>
      {selfTag && (
        <div id="self-nametag-container">
          <Nametag data={selfTag} isStatic />
        </div>
      )}
      {editorData && <Editor data={editorData} onSave={save} onCancel={cancel} />}
    </>
  )
}
