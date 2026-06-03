'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'

import Toolbar from './Toolbar'
import { NOTE_COLORS, EMOJIS, type Note, downloadFile } from './types'
import TurndownService from 'turndown'

interface Props {
  note: Note
  onUpdate: (patch: Partial<Note>) => void
  appTheme: 'dark' | 'light'
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file)
  })
}

export default function NoteEditor({ note, onUpdate, appTheme }: Props) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const noteTheme = note.noteTheme ?? 'inherit'
  const effectiveTheme = noteTheme === 'inherit' ? appTheme : noteTheme
  const isDark = effectiveTheme === 'dark'

  const colorConfig = NOTE_COLORS.find(c => c.name === note.color) ?? NOTE_COLORS[0]

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      Youtube.configure({ controls: true, nocookie: true }),
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
      Placeholder.configure({ placeholder: 'Start writing… (paste images, embed YouTube, add tables)' }),
      Color, TextStyle,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-indigo-400 underline cursor-pointer' } }),
      CharacterCount,
    ],
    content: note.content,
    editorProps: {
      attributes: {
        class: `focus:outline-none prose-editor min-h-[50vh] ${isDark ? 'prose-dark' : 'prose-light'}`,
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate({ content: editor.getJSON() })
    },
  })

  // Sync content when note changes
  useEffect(() => {
    if (editor && editor.getJSON() !== note.content) {
      editor.commands.setContent(note.content, false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id])

  // Drag-drop image onto editor
  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    for (const file of Array.from(e.dataTransfer.files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 8 * 1024 * 1024) { alert('Image too large (max 8MB)'); continue }
      const src = await fileToBase64(file)
      editor?.chain().focus().setImage({ src }).run()
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Cover too large (max 5MB)'); return }
    onUpdate({ cover: await fileToBase64(file) })
  }

  function exportBackup() {
    if (!editor) return
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
    const md = `# ${note.title || 'Untitled'}\n\n${td.turndown(editor.getHTML())}`
    downloadFile(md, `${note.title || 'untitled'}.md`, 'text/markdown')
  }

  const wordCount = editor?.storage.characterCount?.words() ?? 0
  const charCount = editor?.storage.characterCount?.characters() ?? 0

  return (
    <div
      className={`flex-1 flex flex-col min-h-0 transition-colors ${isDark ? 'bg-[#0f0f12] text-white' : 'bg-white text-slate-900'}`}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      {/* ── Cover banner (colour lives here only, does NOT bleed into title) ── */}
      <div
        className="relative w-full shrink-0 group overflow-hidden"
        style={{
          height: note.cover ? 180 : 100,
          ...(note.cover
            ? { backgroundImage: `url(${note.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: `linear-gradient(135deg, ${colorConfig.from} 0%, ${colorConfig.from}80 60%, transparent 100%)` }
          ),
        }}
      >
        {/* Hard bottom edge — colour stops here, content area below is clean */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8"
          style={{ background: `linear-gradient(to bottom, transparent, ${isDark ? '#0f0f12' : '#ffffff'})` }}
        />
        {note.cover && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />}

        {/* Emoji — anchored inside cover at bottom-left, NOT overlapping content */}
        <div className="absolute bottom-3 left-10 z-10">
          <button
            onClick={() => { setShowEmojiPicker(v => !v); setShowColorPicker(false) }}
            className="text-4xl hover:scale-110 transition-transform block drop-shadow-lg"
            title="Change icon"
          >
            {note.icon}
          </button>
          {showEmojiPicker && (
            <div className="absolute top-12 left-0 bg-[#1a1a1f] border border-white/10 rounded-2xl p-3 grid grid-cols-8 gap-1 z-30 shadow-2xl w-72">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { onUpdate({ icon: e }); setShowEmojiPicker(false) }} className="text-xl hover:bg-white/10 rounded-lg p-1.5 transition">{e}</button>
              ))}
            </div>
          )}
        </div>

        {/* Cover controls (top-right, fade in on hover) */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition z-10">
          <label className="cursor-pointer flex items-center gap-1.5 text-xs bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Change cover
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </label>
          {note.cover && (
            <button onClick={() => onUpdate({ cover: undefined })} className="text-xs bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm transition">
              Remove
            </button>
          )}
        </div>

        {/* Color + theme pickers (top-left) */}
        <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition z-10">
          <div className="relative">
            <button onClick={() => { setShowColorPicker(v => !v); setShowEmojiPicker(false) }} className="flex items-center gap-1.5 text-xs bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm transition">
              <span className="w-3 h-3 rounded-full" style={{ background: colorConfig.accent }} />
              Color
            </button>
            {showColorPicker && (
              <div className="absolute top-9 left-0 bg-[#1a1a1f] border border-white/10 rounded-xl p-3 z-30 shadow-2xl">
                <p className="text-xs text-slate-500 mb-2">Note accent</p>
                <div className="flex gap-2 mb-3">
                  {NOTE_COLORS.map(c => (
                    <button key={c.name} onClick={() => { onUpdate({ color: c.name }); setShowColorPicker(false) }}
                      className="w-6 h-6 rounded-full transition hover:scale-110"
                      style={{ background: c.accent, outline: note.color === c.name ? `2px solid white` : 'none', outlineOffset: 2 }}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mb-2">Note theme</p>
                <div className="flex gap-2">
                  {(['inherit', 'dark', 'light'] as const).map(t => (
                    <button key={t} onClick={() => onUpdate({ noteTheme: t } as Partial<Note>)}
                      className={`text-xs px-3 py-1.5 rounded-lg capitalize border transition ${(note as any).noteTheme === t || (!(note as any).noteTheme && t === 'inherit') ? 'bg-white/15 border-white/30 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
                    >
                      {t === 'inherit' ? 'Auto' : t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Title area — clean background, no colour bleed from above ── */}
      <div className="max-w-[680px] w-full mx-auto px-10 pt-5">
        <input
          type="text"
          value={note.title}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Untitled"
          className={`w-full bg-transparent text-4xl font-extrabold focus:outline-none leading-tight mb-1 ${isDark ? 'text-white placeholder-slate-700' : 'text-slate-900 placeholder-slate-300'}`}
        />
        <p className={`text-xs mb-5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          {new Date(note.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Toolbar */}
      {editor && <Toolbar editor={editor} note={note} />}

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[680px] mx-auto px-10 py-4 pb-10">
          <EditorContent editor={editor} className={isDark ? 'editor-dark' : 'editor-light'} />
        </div>
      </div>

      {/* Footer */}
      <div className={`h-8 px-10 border-t flex items-center gap-4 text-xs shrink-0 max-w-[680px] w-full mx-auto ${isDark ? 'border-white/5 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
        <span>{wordCount} words</span>
        <span>{charCount} chars</span>
        <span className="ml-auto flex items-center gap-1 text-emerald-500">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Saved
        </span>
      </div>
    </div>
  )
}
