import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import IconButton from '../components/IconButton';

export default function Dashboard() {
  const [modal, setModal] = useState({ open: false, title: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const mainApps = [
    { img: '/icons/notes.png', label: 'Notes' },
    { img: '/icons/files.png', label: 'Files' },
    { img: '/icons/jupyter.png', label: 'Jupyter' },
    { img: '/icons/terminal.png', label: 'Terminal' },
    { img: '/icons/resources.png', label: 'Resources' },
    { img: '/icons/security.png', label: 'Security' },
  ];

  const otherApps = [
    //{ img: '/icons/spotify.png', label: 'Spotify' },
    { img: '/icons/chatgpt.png', label: 'ChatGPT' },
    { img: '/icons/claude.png', label: 'Claude' },
    { img: '/icons/gemini.png', label: 'Gemini' },
    { img: '/icons/grok.png', label: 'Grok' },
    { img: '/icons/github.png', label: 'Github' },
    { img: '/icons/axis3.png', label: 'Axis3' },
    { img: '/icons/nocturne.png', label: 'Nocturne' },
    { img: '/icons/pixelbeat.png', label: 'PixelBeat' },
    { img: '/icons/mirage.png', label: 'Mirage' },
    { img: '/icons/prism.png', label: 'Prism' },
    { img: '/icons/dynamicslam.png', label: 'Dynamic Slam' },
    { img: '/icons/skybeat.png', label: 'SkyBeat' },
    { img: '/icons/synapse.png', label: 'Synapse Vis' },
    { img: '/icons/pixelweaver.png', label: 'Pixel Weaver' },
    // Add more other apps here
  ];

  const combinedApps = [...mainApps, ...otherApps];

  const fuse = useMemo(() => new Fuse(combinedApps, {
    keys: ['label'],
    threshold: 0.5,
  }), []);

  const filteredApps = searchQuery
    ? fuse.search(searchQuery).map(result => result.item)
    : combinedApps;

  const openApp = (label) => {
    setModal({ open: true, title: label });
  };

  return (
    <div className="w-[100vw] h-[100vh] bg-gradient-to-br from-black to-gray-900 text-white font-montserrat overflow-hidden">

      <header className="w-[100vw] h-[8vh] px-8 flex items-center justify-between bg-white/10 backdrop-blur-xl border-b border-white/20 relative">
  
        {/* Left Image (Logo) */}
        <img src="/icons/arklogo.png" alt="Ark Logo" className="h-6"/>

        {/* Center Image */}
        <img src="/icons/ark.png" alt="Center Icon" className="w-20 h-13 absolute left-1/2 transform -translate-x-1/2" />

        {/* Right Info */}
        <div className="flex gap-4 text-sm">
            <span>2d 4h</span>
        </div>

      </header>


      <main className="w-[100vw] h-[92vh] flex flex-col items-center pt-8 overflow-hidden">
  
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[60%] mb-6 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-sm placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30"
        />

        {searchQuery ? (
          // Show filtered apps in one grid
          <div className="w-[80vw] mx-[10vw] h-full grid 
            grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10
            gap-x-2 [row-gap:3vh] overflow-y-auto scrollbar-hide">

            {filteredApps.map((app, index) => (
              <IconButton key={app.label + index} {...app} onClick={() => openApp(app.label)} />
            ))}

          </div>
        ) : (
          // Default layout: mainApps + spacer + otherApps
          <div className="w-[80vw] mx-[10vw] h-full overflow-y-auto scrollbar-hide flex flex-col items-center">
            
            <div className="w-full grid 
              grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10
              gap-x-2 [row-gap:3vh]">

              {mainApps.map((app, index) => (
                <IconButton key={app.label + index} {...app} onClick={() => openApp(app.label)} />
              ))}
            </div>

            <div className="h-[10vh]" /> {/* Spacer */}

            <div className="w-full grid 
              grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10
              gap-x-2 [row-gap:3vh]">

              {otherApps.map((app, index) => (
                <IconButton key={app.label + index} {...app} onClick={() => openApp(app.label)} />
              ))}
            </div>

          </div>
        )}

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
