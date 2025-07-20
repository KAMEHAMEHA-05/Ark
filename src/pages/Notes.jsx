import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import CodeBlock from '@tiptap/extension-code-block';
import Code from '@tiptap/extension-code';
import './Notes.css'; // Import your CSS styles

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [noteName, setNoteName] = useState('');

  //const API_BASE = "https://zenmaster.coydog-parore.ts.net";
  //const API_BASE = "http://localhost:5000"; // Use your backend API base URL
  const API_BASE = import.meta.env.VITE_API_BASE;

  const fetchNotes = async () => {
    const res = await fetch(`${API_BASE}/api/notes`);
    const data = await res.json();
    setNotes(data.notes || []);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const editor = useEditor({
    extensions: [
        StarterKit.configure({
        italic: false, // Disable the default Italic
        bold: false,   // Disable default Bold to replace it manually (optional)
        strike: false, // Same for Strike (optional)
        }),
        Bold,
        Italic,
        Underline,
        Strike,
        Code,
        CodeBlock,
        TextStyle,
        Color,
        Image,
    ],
    content: '',
  });

  const openNote = (note) => {
    setSelectedNote(note);
    setNewNoteOpen(true);
    if (editor) {
      editor.commands.setContent(note.content);
      setNoteName(note.name.replace('.html', ''));
    }
  };

  const createNewNote = () => {
    setSelectedNote(null);
    setNewNoteOpen(true);
    if (editor) {
      editor.commands.setContent('');
    }
    setNoteName('');
  };

  const saveNote = async () => {
    const content = editor.getHTML();
    const payload = {
      name: noteName,
      content: content,
    };

    await fetch(`${API_BASE}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setNewNoteOpen(false);
    fetchNotes();
  };

  const deleteNote = async (noteName) => {
    await fetch(`${API_BASE}/api/notes/${noteName}`, {
      method: 'DELETE',
    });
    fetchNotes();
  };

  return (
    <div className="w-[100vw] h-[100vh] bg-gradient-to-br from-black to-gray-900 text-white font-montserrat overflow-hidden">

      {/* Header */}
      <header className="w-[100vw] h-[8vh] px-8 flex items-center justify-between bg-white/10 backdrop-blur-xl border-b border-white/20 relative">
        <img src="/icons/arklogo.png" alt="Ark Logo" className="h-6" />
        <img src="/icons/ark.png" alt="Center Icon" className="w-20 h-13 absolute left-1/2 transform -translate-x-1/2" />
        <div className="flex gap-4 text-sm"><span>Notes</span></div>
      </header>

      {/* Notes Grid */}
      <main className="w-[100vw] h-[92vh] flex flex-col pt-8 overflow-y-auto scrollbar-hide px-6 sm:px-10">

        <h1 className="text-3xl mb-6" style={{ fontFamily: 'Michroma, sans-serif' }}>NOTES</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
          {notes.map((note, index) => (
            <div
              key={index}
              onClick={() => openNote(note)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (window.confirm(`Delete note "${note.name.replace('.html', '')}"?`)) {
                  deleteNote(note.name);
                }
              }}
              className="bg-white/10 hover:bg-white/20 cursor-pointer p-4 rounded-xl border border-white/20 flex items-center justify-center text-center break-words text-sm sm:text-base"
            >
              {note.name.replace('.html', '')}
            </div>
          ))}
        </div>

        {/* Floating + Button */}
        <button
          onClick={createNewNote}
          className="fixed bottom-6 right-6 bg-white/10 hover:bg-white/20 p-4 rounded-full border border-white/20 flex items-center justify-center shadow-lg"
        >
          <img src="/icons/plus.png" alt="Add Note" className="w-8 h-8" />
        </button>

      </main>

      {/* Editor Modal */}
      {newNoteOpen && (
        <div className="fixed inset-0 bg-black/90 flex flex-col px-4 py-8 sm:px-10">

          <input
            type="text"
            value={noteName}
            onChange={(e) => setNoteName(e.target.value)}
            placeholder="Note Title"
            className="w-full text-3xl mb-4 bg-transparent text-white placeholder-white/50 outline-none"
          />

          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1 rounded ${editor.isActive('bold') ? 'bg-white/30' : 'bg-white/10'}`}>B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1 rounded ${editor.isActive('italic') ? 'bg-white/30' : 'bg-white/10'}`}>I</button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`px-3 py-1 rounded ${editor.isActive('underline') ? 'bg-white/30' : 'bg-white/10'}`}>U</button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-3 py-1 rounded ${editor.isActive('strike') ? 'bg-white/30' : 'bg-white/10'}`}>S</button>
            
            {/* Inline Code */}
            <button onClick={() => editor.chain().focus().toggleCode().run()} className={`px-3 py-1 rounded ${editor.isActive('code') ? 'bg-white/30' : 'bg-white/10'}`}>`</button>

            {/* Block Code */}
            <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`px-3 py-1 rounded ${editor.isActive('codeBlock') ? 'bg-white/30' : 'bg-white/10'}`}>[Code Block]</button>

            {/* Color Picker */}
            <input
                type="color"
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
            />
          </div>


          <div className="w-full flex-grow overflow-y-scroll border border-white/20 rounded-xl p-4">
            <EditorContent editor={editor} />
          </div>

          <div className="w-full flex justify-end gap-4 mt-4">
            <button
              onClick={saveNote}
              className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-lg"
            >
              Save (Ctrl+S)
            </button>

            <button
              onClick={() => setNewNoteOpen(false)}
              className="text-white/50 hover:text-white/80 text-lg"
            >
              Cancel
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
