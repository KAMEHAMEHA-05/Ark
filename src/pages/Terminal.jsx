import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { io } from 'socket.io-client';

export default function WebTerminal() {
  const terminalRef = useRef(null);
  const socketRef = useRef(null);
  const term = useRef(null);
  const fitAddon = useRef(null);
  const inputBuffer = useRef('');

  //const API_BASE = "http://localhost:5000"; // or Tailscale IP / MagicDNS / Funnel URL /
  //const API_BASE = "https://zenmaster.coydog-parore.ts.net/";
  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    socketRef.current = io(API_BASE);

    term.current = new Terminal({
        theme: { background: '#0000000d', foreground: '#FFFFFF' },
        cursorBlink: true,
        fontSize: 14,
    });

    fitAddon.current = new FitAddon();
    term.current.loadAddon(fitAddon.current);

    term.current.open(terminalRef.current);
    fitAddon.current.fit();

    term.current.writeln('Welcome to Ark Terminal');
    term.current.write('ark>>> '); // Initial prompt

    inputBuffer.current = '';

    term.current.onData(data => {
        if (data === '\r') {
        socketRef.current.emit('run_command', { command: inputBuffer.current });
        inputBuffer.current = '';
        // Wait for output_end event to print prompt again
        } else if (data === '\u007F') {
        if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            term.current.write('\b \b');
        }
        } else {
        inputBuffer.current += data;
        term.current.write(data);
        }
    });

    socketRef.current.on('output', data => {
        // Use writeln to properly print each output line and move cursor to next line
        term.current.write('\r\n');
        term.current.writeln(data.output.trimEnd());
        term.current.scrollToBottom();
    });

    socketRef.current.on('output_end', () => {
        // Print prompt at the beginning of a new line without extra spaces
        term.current.write('\r\n\r\nark>>> ');
    });

    window.addEventListener('resize', () => {
        fitAddon.current.fit();
    });

    return () => {
        window.removeEventListener('resize', () => fitAddon.current.fit());
        socketRef.current.disconnect();
        term.current.dispose();
    };
    }, []);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black to-gray-900 text-white font-montserrat overflow-hidden">

      {/* Ark Header */}
      <header className="w-full h-[8vh] px-8 flex items-center justify-between bg-white/10 backdrop-blur-xl border-b border-white/20 relative">
        <img src="/icons/arklogo.png" alt="Ark Logo" className="h-6" />
        <img src="/icons/ark.png" alt="Center Icon" className="w-20 h-13 absolute left-1/2 transform -translate-x-1/2" />
        <div className="flex gap-4 text-sm"><span>Terminal</span></div>
      </header>

      <div className="flex items-center mb-6 mt-6 ml-4">
          <a href="/" rel="noopener noreferrer">
            <img 
              src="/icons/backbutton.png" 
              alt="Icon" 
              className="w-8 h-8 mr-3" 
              style={{ cursor: 'pointer' }}
            />
          </a>
          <h1 className="text-3xl" style={{ fontFamily: 'Michroma, sans-serif' }}>
            ARK TERMINAL
          </h1>
      </div>
      {/* Terminal Content */}
      <main className="w-full h-[80vh] flex items-center justify-center p-4">
        <div ref={terminalRef} className="w-full h-full rounded-xl border border-white/20 overflow-hidden" />
      </main>

    </div>
  );
}
