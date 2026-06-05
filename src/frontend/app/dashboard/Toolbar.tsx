'use client'

import { type Editor } from '@tiptap/react'
import { useRef, useState } from 'react'
import type { Note } from './types'
import { downloadFile } from './types'
import TurndownService from 'turndown'
import { marked } from 'marked'

interface Props {
  editor: Editor
  note: Note
}

function Btn({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1.5 rounded-md text-sm font-medium transition ${active ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/8'}`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />
}

export default function Toolbar({ editor, note }: Props) {
  const [showExport, setShowExport] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showYtInput, setShowYtInput] = useState(false)
  const [ytUrl, setYtUrl] = useState('')
  const [showEmbedInput, setShowEmbedInput] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [aiError, setAiError] = useState('')
  const [aiSetup, setAiSetup] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const attachRef = useRef<HTMLInputElement>(null)
  // Selection is captured when the AI menu opens, before the click blurs the editor.
  const aiSelRef = useRef<{ from: number; to: number } | null>(null)

  // Import a Markdown / Notion-export / HTML / text file into the current note.
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lower = file.name.toLowerCase()
    let html: string
    if (lower.endsWith('.html') || lower.endsWith('.htm')) {
      html = text
    } else if (lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.txt')) {
      // Notion exports pages as Markdown — this imports them faithfully.
      html = await marked.parse(text)
    } else {
      html = `<p>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').split('\n').join('<br>')}</p>`
    }
    editor.chain().focus().insertContent(html).run()
    e.target.value = ''
  }

  // Attach any document (docx, xlsx, pdf, …) as a downloadable chip in the note.
  async function handleAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Attachment too large (max 5MB). For larger files use object storage (S3 / GCS).')
      e.target.value = ''
      return
    }
    const dataUrl: string = await new Promise((res, rej) => {
      const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file)
    })
    const ext = (file.name.split('.').pop() || 'file').toLowerCase()
    const emoji = ext.match(/xlsx?|csv|numbers/) ? '📊'
      : ext.match(/docx?|pages|odt/) ? '📄'
      : ext.match(/pdf/) ? '📕'
      : ext.match(/pptx?|key/) ? '📑'
      : ext.match(/zip|tar|gz/) ? '🗜️' : '📎'
    const kb = Math.max(1, Math.round(file.size / 1024))
    const chip = `<p><a href="${dataUrl}" download="${file.name}" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:#1e1b4b;color:#c7d2fe;border:1px solid #4338ca;border-radius:10px;text-decoration:none;font-size:13px;">${emoji} ${file.name} <span style="opacity:0.6">· ${kb} KB · download</span></a></p>`
    editor.chain().focus().insertContent(chip).run()
    e.target.value = ''
  }

  const AI_ACTIONS: { key: string; label: string; icon: string }[] = [
    { key: 'improve', label: 'Improve writing', icon: '✨' },
    { key: 'rephrase', label: 'Rephrase', icon: '🔄' },
    { key: 'grammar', label: 'Fix grammar', icon: '✓' },
    { key: 'shorter', label: 'Make shorter', icon: '✂️' },
    { key: 'longer', label: 'Make longer', icon: '➕' },
    { key: 'summarize', label: 'Summarize', icon: '📝' },
    { key: 'professional', label: 'Professional tone', icon: '💼' },
    { key: 'casual', label: 'Casual tone', icon: '😊' },
    { key: 'bullets', label: 'Turn into bullets', icon: '•' },
  ]

  // Capture the current selection the moment the AI button is pressed.
  function openAI() {
    const { from, to } = editor.state.selection
    aiSelRef.current = from !== to ? { from, to } : null
    setShowAI(v => !v)
    setAiError('')
  }

  async function runAI(action: string) {
    const sel = aiSelRef.current
    const range = sel ?? { from: editor.state.selection.from, to: editor.state.selection.to }
    const text = editor.state.doc.textBetween(range.from, range.to, ' ')
    if (!text.trim()) {
      setAiError('Highlight some text in the note first, then click ✨ AI.')
      return
    }
    setAiError('')
    setAiLoading(action)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text }),
      })
      const data = await res.json()
      if (res.status === 503) { setAiSetup(true); return }   // not configured
      if (!res.ok) throw new Error(data.error || 'AI request failed')
      editor.chain().focus().insertContentAt(range, data.result).run()
      aiSelRef.current = null
      setShowAI(false)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI request failed')
    } finally {
      setAiLoading(null)
    }
  }

  function exportMarkdown() {
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' })
    const md = `# ${note.title || 'Untitled'}\n\n${td.turndown(editor.getHTML())}`
    downloadFile(md, `${note.title || 'untitled'}.md`, 'text/markdown')
    setShowExport(false)
  }

  function exportJSON() {
    const data = JSON.stringify({ title: note.title, icon: note.icon, content: editor.getJSON(), createdAt: note.createdAt }, null, 2)
    downloadFile(data, `${note.title || 'untitled'}.json`, 'application/json')
    setShowExport(false)
  }

  function exportHTML() {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${note.title || 'Untitled'}</title><style>body{font-family:sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;line-height:1.7;color:#1a1a1a}h1,h2,h3{margin-top:2rem}pre{background:#f4f4f4;padding:1rem;border-radius:6px;overflow-x:auto}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px 12px}img{max-width:100%;border-radius:8px}</style></head><body><h1>${note.title || 'Untitled'}</h1>${editor.getHTML()}</body></html>`
    downloadFile(html, `${note.title || 'untitled'}.html`, 'text/html')
    setShowExport(false)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) { alert('Image too large (max 8MB)'); return }
    const reader = new FileReader()
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result as string }).run()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function insertLink() {
    if (!linkUrl) { setShowLinkInput(false); return }
    editor.chain().focus().setLink({ href: linkUrl }).run()
    setLinkUrl(''); setShowLinkInput(false)
  }

  function insertYouTube() {
    if (!ytUrl) { setShowYtInput(false); return }
    editor.chain().focus().setYoutubeVideo({ src: ytUrl }).run()
    setYtUrl(''); setShowYtInput(false)
  }

  function insertTable() {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  // Excel-style auto-sum: appends a "Total" row summing each numeric column.
  function sumTable() {
    const { $from } = editor.state.selection
    let tableNode = null as null | import('@tiptap/pm/model').Node
    let tablePos = -1
    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d)
      if (node.type.name === 'table') { tableNode = node; tablePos = $from.before(d); break }
    }
    if (!tableNode) { alert('Place the cursor inside a table first, then click Σ.'); return }

    const rows: string[][] = []
    tableNode.forEach(row => {
      const cells: string[] = []
      row.forEach(cell => cells.push(cell.textContent.trim()))
      rows.push(cells)
    })
    const colCount = Math.max(...rows.map(r => r.length))
    const parseNum = (s: string): number | null => {
      const m = s.replace(/,/g, '').match(/-?\d+(\.\d+)?/)
      return m ? parseFloat(m[0]) : null
    }

    const { tableRow, tableCell, paragraph } = editor.schema.nodes
    const cellNodes = []
    let foundAny = false
    for (let c = 0; c < colCount; c++) {
      let sum = 0, has = false
      for (let r = 0; r < rows.length; r++) {
        const n = parseNum(rows[r][c] || '')
        if (n !== null) { sum += n; has = true }
      }
      let label = ''
      if (c === 0) label = 'Total'
      else if (has) { label = Number.isInteger(sum) ? String(sum) : sum.toFixed(2); foundAny = true }
      const para = label ? paragraph.create(null, editor.schema.text(label)) : paragraph.create()
      cellNodes.push(tableCell.create(null, para))
    }
    if (!foundAny) { alert('No numeric columns found to sum.'); return }

    const rowNode = tableRow.create(null, cellNodes)
    const insertPos = tablePos + tableNode.nodeSize - 1   // just before the table closes
    editor.chain().focus().insertContentAt(insertPos, rowNode.toJSON()).run()
  }

  const blockType = editor.isActive('heading', { level: 1 }) ? 'H1'
    : editor.isActive('heading', { level: 2 }) ? 'H2'
    : editor.isActive('heading', { level: 3 }) ? 'H3'
    : editor.isActive('blockquote') ? 'Quote'
    : editor.isActive('codeBlock') ? 'Code'
    : 'Para'

  return (
    <div className="relative">
      <div className="flex items-center flex-wrap gap-0.5 px-4 py-2 border-b border-white/5 bg-[#111114] overflow-x-auto">

        {/* Block type dropdown (simplified as buttons) */}
        <div className="flex gap-0.5">
          <Btn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraph">¶</Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</Btn>
        </div>
        <Sep />

        {/* Inline formatting */}
        <div className="flex gap-0.5">
          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><b>B</b></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><i>I</i></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><u>U</u></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><s>S</s></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">`</Btn>
        </div>
        <Sep />

        {/* Highlight colors */}
        <div className="flex gap-0.5 items-center">
          {['#fef08a','#bbf7d0','#bfdbfe','#fecaca','#e9d5ff'].map(color => (
            <button
              key={color}
              onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color }).run() }}
              title={`Highlight`}
              className={`w-5 h-5 rounded-full border-2 transition hover:scale-110 ${editor.isActive('highlight', { color }) ? 'border-white' : 'border-transparent'}`}
              style={{ background: color }}
            />
          ))}
        </div>
        <Sep />

        {/* Lists */}
        <div className="flex gap-0.5">
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">•</Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">1.</Btn>
        </div>
        <Sep />

        {/* Block elements */}
        <div className="flex gap-0.5">
          <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">"</Btn>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">{'</>'}</Btn>
          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider">—</Btn>
        </div>
        <Sep />

        {/* Alignment */}
        <div className="flex gap-0.5">
          <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" /></svg>
          </Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M6 18h12" /></svg>
          </Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M8 18h12" /></svg>
          </Btn>
        </div>
        <Sep />

        {/* Insert media */}
        <div className="flex gap-0.5">
          <Btn onClick={() => imageRef.current?.click()} active={false} title="Upload image (⌘⌥I for URL)">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </Btn>
          <Btn onClick={() => setShowYtInput(v => !v)} active={showYtInput} title="Embed YouTube video (⌘⌥Y)">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </Btn>
          <Btn onClick={insertTable} active={editor.isActive('table')} title="Insert table (⌘⌥T)">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6z" /></svg>
          </Btn>
          {editor.isActive('table') && (
            <Btn onClick={sumTable} active={false} title="Auto-sum columns (adds a Total row)">
              <span className="font-bold text-sm">Σ</span>
            </Btn>
          )}
          <Btn onClick={() => setShowLinkInput(v => !v)} active={editor.isActive('link') || showLinkInput} title="Insert link (⌘K)">🔗</Btn>
          <Btn onClick={() => setShowEmbedInput(v => !v)} active={showEmbedInput} title="Embed diagram (Excalidraw / Miro / Lucidchart)">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
          </Btn>
          <Btn onClick={() => importRef.current?.click()} active={false} title="Import Markdown / Notion export / HTML">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
          </Btn>
          <Btn onClick={() => attachRef.current?.click()} active={false} title="Attach a document or spreadsheet (docx, xlsx, pdf…)">📎</Btn>
        </div>
        <Sep />

        {/* Undo/Redo */}
        <div className="flex gap-0.5">
          <Btn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">↩</Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">↪</Btn>
        </div>
        <Sep />

        {/* AI assist */}
        <div className="relative">
          <button
            onMouseDown={e => { e.preventDefault(); openAI() }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition text-white"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}
            title="AI writing assistant (highlight text first)"
          >
            ✨ AI
          </button>
          {showAI && (
            <div className="absolute right-0 top-9 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 w-64">
              {aiSetup ? (
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-white mb-1.5">✨ Enable AI assist</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                    AI rewrites need a Claude API key. It runs server-side — your key never reaches the browser.
                  </p>
                  <ol className="text-[11px] text-slate-300 space-y-1 list-decimal pl-4 mb-2">
                    <li>Get a key at <span className="text-violet-300">console.anthropic.com</span></li>
                    <li>Add to <code className="text-violet-300">src/frontend/.env.local</code>:</li>
                  </ol>
                  <pre className="text-[10px] bg-black/40 rounded-lg p-2 text-emerald-300 overflow-x-auto mb-2">ANTHROPIC_API_KEY=sk-ant-...</pre>
                  <p className="text-[11px] text-slate-400">3. Restart the dev server. Done!</p>
                  <button onClick={() => { setAiSetup(false); setShowAI(false) }} className="mt-2 text-[11px] text-violet-300 hover:text-violet-200">Got it</button>
                </div>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 px-3 pt-1 pb-1.5">
                    {aiSelRef.current ? 'Choose an action' : 'Highlight text first'}
                  </p>
                  {AI_ACTIONS.map(a => (
                    <button
                      key={a.key}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => runAI(a.key)}
                      disabled={aiLoading !== null}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/8 text-sm text-slate-200 transition disabled:opacity-50"
                    >
                      <span className="w-5 text-center">{a.icon}</span>
                      {a.label}
                      {aiLoading === a.key && (
                        <svg className="animate-spin h-3.5 w-3.5 ml-auto text-violet-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                    </button>
                  ))}
                  {aiError && <p className="text-[11px] text-amber-400 px-3 py-1.5">{aiError}</p>}
                </>
              )}
            </div>
          )}
        </div>
        <Sep />

        {/* Export */}
        <div className="relative" ref={exportRef}>
          <button
            onMouseDown={e => { e.preventDefault(); setShowExport(v => !v) }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>
          {showExport && (
            <div className="absolute right-0 top-9 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 w-44">
              {[
                { label: 'Markdown (.md)', fn: exportMarkdown, icon: '#' },
                { label: 'HTML (.html)',   fn: exportHTML,     icon: '<>' },
                { label: 'JSON (.json)',   fn: exportJSON,     icon: '{}' },
              ].map(item => (
                <button key={item.label} onClick={item.fn} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/8 text-sm text-slate-300 transition">
                  <span className="text-xs font-mono text-slate-500 w-5 text-center">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hidden image input */}
        <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input ref={importRef} type="file" accept=".md,.markdown,.txt,.html,.htm" className="hidden" onChange={handleImport} />
        <input ref={attachRef} type="file" className="hidden" onChange={handleAttach} />
      </div>

      {/* Link input bar */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#111114] border-b border-white/5">
          <input
            autoFocus
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') insertLink(); if (e.key === 'Escape') setShowLinkInput(false) }}
            placeholder="https://…"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button onClick={insertLink} className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition">Insert</button>
          <button onClick={() => setShowLinkInput(false)} className="text-sm text-slate-500 hover:text-white transition">Cancel</button>
        </div>
      )}

      {/* YouTube URL bar */}
      {showYtInput && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#111114] border-b border-white/5">
          <input
            autoFocus
            value={ytUrl}
            onChange={e => setYtUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') insertYouTube(); if (e.key === 'Escape') setShowYtInput(false) }}
            placeholder="Paste YouTube URL…"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button onClick={insertYouTube} className="text-sm bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition">Embed</button>
          <button onClick={() => setShowYtInput(false)} className="text-sm text-slate-500 hover:text-white transition">Cancel</button>
        </div>
      )}

      {/* Embed diagram bar (Excalidraw / Miro / Lucidchart / any iframe URL) */}
      {showEmbedInput && (
        <div className="flex flex-col gap-2 px-4 py-2.5 bg-[#111114] border-b border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Supported:</span>
            {['Excalidraw', 'Miro', 'Lucidchart', 'draw.io', 'FigJam'].map(t => (
              <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">{t}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={embedUrl}
              onChange={e => setEmbedUrl(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (embedUrl) {
                    editor.chain().focus().insertContent(
                      `<p><a href="${embedUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 16px;background:#1e1b4b;color:#a5b4fc;border-radius:8px;text-decoration:none;font-size:13px;border:1px solid #3730a3;">🔗 Open diagram in ${embedUrl.includes('excalidraw') ? 'Excalidraw' : embedUrl.includes('miro') ? 'Miro' : embedUrl.includes('lucidchart') ? 'Lucidchart' : 'external tool'} ↗</a></p>`
                    ).run()
                    setEmbedUrl('')
                    setShowEmbedInput(false)
                  }
                }
                if (e.key === 'Escape') setShowEmbedInput(false)
              }}
              placeholder="Paste Excalidraw / Miro / Lucidchart share URL…"
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={() => {
                if (embedUrl) {
                  editor.chain().focus().insertContent(
                    `<p><a href="${embedUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 16px;background:#1e1b4b;color:#a5b4fc;border-radius:8px;text-decoration:none;font-size:13px;border:1px solid #3730a3;">🔗 Open diagram in ${embedUrl.includes('excalidraw') ? 'Excalidraw' : embedUrl.includes('miro') ? 'Miro' : embedUrl.includes('lucidchart') ? 'Lucidchart' : 'diagram tool'} ↗</a></p>`
                  ).run()
                  setEmbedUrl('')
                  setShowEmbedInput(false)
                }
              }}
              className="text-sm bg-violet-700 hover:bg-violet-600 text-white px-3 py-1.5 rounded-lg transition">
              Embed
            </button>
            <button onClick={() => setShowEmbedInput(false)} className="text-sm text-slate-500 hover:text-white transition">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
