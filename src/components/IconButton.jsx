import React from 'react';

export default function IconButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-20 aspect-square p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition"
    >
      <Icon className="w-8 h-8 mb-1 text-white" />
      <span className="text-xs text-white font-montserrat">{label}</span>
    </button>
  );
}


