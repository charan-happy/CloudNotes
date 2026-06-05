import { Extension } from '@tiptap/core'

// Tab behaviour + insert shortcuts, Notion-style.
//
//   Tab / Shift-Tab : indent / outdent list items (tables handle their own Tab);
//                     in plain text Tab inserts an indent.
//   Cmd/Ctrl-K      : insert link
//   Cmd/Ctrl-Alt-T  : insert 3×3 table
//   Cmd/Ctrl-Alt-Y  : embed YouTube video
//   Cmd/Ctrl-Alt-I  : insert image by URL
export const EditorShortcuts = Extension.create({
  name: 'editorShortcuts',

  addKeyboardShortcuts() {
    const editor = this.editor

    return {
      Tab: () => {
        // Let the table extension move between cells.
        if (editor.isActive('table')) return false
        if (editor.can().sinkListItem('listItem')) {
          return editor.chain().focus().sinkListItem('listItem').run()
        }
        // Plain text: insert two non-breaking spaces as an indent.
        return editor.chain().focus().insertContent('  ').run()
      },

      'Shift-Tab': () => {
        if (editor.isActive('table')) return false
        if (editor.can().liftListItem('listItem')) {
          return editor.chain().focus().liftListItem('listItem').run()
        }
        return true // swallow so focus doesn't leave the editor
      },

      'Mod-k': () => {
        const prev = editor.getAttributes('link').href as string | undefined
        const url = window.prompt('Link URL:', prev || 'https://')
        if (url === null) return true
        if (url === '') {
          editor.chain().focus().unsetLink().run()
        } else {
          editor.chain().focus().setLink({ href: url }).run()
        }
        return true
      },

      'Mod-Alt-t': () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),

      'Mod-Alt-y': () => {
        const url = window.prompt('YouTube or Vimeo URL:')
        if (url) editor.commands.setYoutubeVideo({ src: url })
        return true
      },

      'Mod-Alt-i': () => {
        const url = window.prompt('Image URL:')
        if (url) editor.chain().focus().setImage({ src: url }).run()
        return true
      },
    }
  },
})
