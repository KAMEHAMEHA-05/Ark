import React, { useState } from 'react';
import IconButton from '../components/IconButton';
import { LucideTerminal, LucideNotebook, LucideShield, LucideFile, LucideBarChart2, LucideStickyNote } from 'lucide-react';

export default function Dashboard() {
  const [modal, setModal] = useState({ open: false, title: '' });

  const apps = [
    { icon: LucideFile, label: 'Files' },
    { icon: LucideNotebook, label: 'Jupyter' },
    { icon: LucideTerminal, label: 'Terminal' },
    { icon: LucideBarChart2, label: 'Resources' },
    { icon: LucideShield, label: 'Security' },
    { icon: LucideStickyNote, label: 'Notes' },
    { icon: LucideFile, label: 'Files' },
    { icon: LucideNotebook, label: 'Jupyter' },
    { icon: LucideTerminal, label: 'Terminal' },
    { icon: LucideBarChart2, label: 'Resources' },
    { icon: LucideShield, label: 'Security' },
    { icon: LucideStickyNote, label: 'Notes' },
    { icon: LucideFile, label: 'Files' },
    { icon: LucideNotebook, label: 'Jupyter' },
    { icon: LucideTerminal, label: 'Terminal' },
    { icon: LucideBarChart2, label: 'Resources' },
    { icon: LucideShield, label: 'Security' },
    { icon: LucideStickyNote, label: 'Notes' },
    // Add more icons here
  ];

  const openApp = (label) => {
    setModal({ open: true, title: label });
  };

  return (
    <div className="w-[100vw] h-[100vh] bg-gradient-to-br from-black to-gray-900 text-white font-montserrat overflow-hidden">

      <header className="w-[100vw] h-[8vh] px-8 flex items-center justify-between bg-white/10 backdrop-blur-xl border-b border-white/20">
        <span className="text-xl font-bold">MyServer</span>
        <div className="flex gap-4 text-sm">
          <span>Uptime: 2d 4h</span>
          <span>User: Admin</span>
        </div>
      </header>

      <main className="w-[100vw] h-[65vh] sm:h-[32vh] flex justify-center items-start pt-8">
        <div className="w-[80vw] mx-[10vw] h-full grid 
            grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10
            gap-x-2 [row-gap:5vh]">
            {apps.map((app) => (
            <IconButton key={app.label} {...app} onClick={() => openApp(app.label)} />
            ))}
        </div>
      </main>


      {modal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white w-[80vw] max-w-md text-center">
            <h2 className="text-lg mb-4">{modal.title}</h2>
            <p>Dummy API response for {modal.title}</p>
            <button onClick={() => setModal({ open: false, title: '' })} className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
