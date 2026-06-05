'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import LinkExt from '@tiptap/extension-link'
import * as api from '../../../lib/api'
import { useTheme } from '../../../lib/theme'

export default function SharedNotePage() {
  const params = useParams()
  const token = String(params.token)
  const [theme] = useTheme()
  const isDark = theme === 'dark'

  const [state, setState] = useState<'loading' | 'ok' | 'password' | 'login' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [password, setPassword] = useState('')
  const [data, setData] = useState<api.SharedNoteResult | null>(null)
  const [saved, setSaved] = useState(true)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pwRef = useRef('')

  const canEdit = data?.permission === 'edit'

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit, Underline, TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ allowBase64: true }), Youtube,
      Table.configure({ resizable: true }), TableRow, TableCell, TableHeader,
      Color, TextStyle, Highlight.configure({ multicolor: true }),
      LinkExt.configure({ openOnClick: true }),
    ],
    content: { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => {
      if (!canEdit) return
      setSaved(false)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        api.updateSharedNote(token, { content: editor.getJSON() }, pwRef.current || undefined)
          .then(() => setSaved(true)).catch(() => {})
      }, 800)
    },
  })

  async function open(pw?: string) {
    setState('loading')
    try {
      const result = await api.getSharedNote(token, pw)
      setData(result)
      pwRef.current = pw || ''
      editor?.commands.setContent(result.note.content as object, { emitUpdate: false })
      editor?.setEditable(result.permission === 'edit')
      setState('ok')
    } catch (e) {
      const err = e as api.ApiError & { needsPassword?: boolean }
      if (err.needsPassword || /password/i.test(err.message)) { setState('password'); setErrorMsg(/incorrect/i.test(err.message) ? 'Incorrect password.' : '') }
      else if (err.status === 401) { setState('login') }
      else { setState('error'); setErrorMsg(err.message || 'Could not open this note.') }
    }
  }

  useEffect(() => { if (editor) open() /* eslint-disable-next-line */ }, [editor])

  const bg = isDark ? '#07050A' : '#FAFAF9'
  const text = isDark ? '#F1F0F0' : '#1a1a1a'
  const muted = isDark ? '#9CA3AF' : '#6B7280'

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>☁</span>
          CloudNotes
        </Link>
        {state === 'ok' && (
          <div className="flex items-center gap-3 text-xs" style={{ color: muted }}>
            <span className="px-2 py-1 rounded-full" style={{ background: canEdit ? '#8B5CF622' : '#10B98122', color: canEdit ? '#A78BFA' : '#10B981' }}>
              {canEdit ? '✏️ You can edit' : '👁 View only'}
            </span>
            {canEdit && <span style={{ color: saved ? '#10B981' : muted }}>{saved ? '✓ Saved' : 'Saving…'}</span>}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        {state === 'loading' && <p style={{ color: muted }}>Opening shared note…</p>}

        {state === 'password' && (
          <div className="max-w-sm mx-auto mt-16 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="font-bold text-xl mb-2">Password required</h1>
            <p className="text-sm mb-5" style={{ color: muted }}>This shared note is password-protected.</p>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') open(password) }}
              placeholder="Enter password" autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none border"
              style={{ background: isDark ? '#0F0B14' : '#fff', color: text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)' }} />
            {errorMsg && <p className="text-xs text-red-400 mb-3">{errorMsg}</p>}
            <button onClick={() => open(password)} className="w-full py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>Unlock</button>
          </div>
        )}

        {state === 'login' && (
          <div className="max-w-sm mx-auto mt-16 text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h1 className="font-bold text-xl mb-2">Sign up to collaborate</h1>
            <p className="text-sm mb-5" style={{ color: muted }}>
              This note was shared with you. Create a free account (or sign in) with the email it was sent to, and you&apos;ll jump straight into editing it live.
            </p>
            <Link href={`/register?next=/shared/${token}`} className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>Create account</Link>
            <p className="text-xs mt-4" style={{ color: muted }}>
              Already have an account?{' '}
              <Link href={`/login?next=/shared/${token}`} className="font-semibold" style={{ color: '#A78BFA' }}>Sign in</Link>
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="max-w-sm mx-auto mt-16 text-center">
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="font-bold text-xl mb-2">Can&apos;t open this note</h1>
            <p className="text-sm" style={{ color: muted }}>{errorMsg}</p>
            <Link href="/" className="inline-block mt-5 text-sm font-semibold" style={{ color: '#A78BFA' }}>← Back to CloudNotes</Link>
          </div>
        )}

        {state === 'ok' && data && (
          <>
            <div className="text-4xl mb-2">{data.note.icon}</div>
            <h1 className="text-3xl font-extrabold mb-1">{data.note.title || 'Untitled'}</h1>
            <p className="text-xs mb-6" style={{ color: muted }}>
              Shared note · {canEdit ? 'editable' : 'read-only'}
            </p>
            <EditorContent editor={editor} className={isDark ? 'editor-dark' : 'editor-light'} />
          </>
        )}
      </div>
    </div>
  )
}
