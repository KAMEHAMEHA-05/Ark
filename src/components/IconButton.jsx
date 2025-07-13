import React from 'react';

export default function IconButton({ img, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="aspect-square flex flex-col items-center justify-center p-4 bg-white/0 backdrop-blur-xl border border-white/0 rounded-xl hover:bg-white/10 transition-all"
    >
      <img src={img} alt={label} className="w-16 h-16 object-contain" />
      <span className="mt-2 text-sm">{label}</span>
    </button>
  );
}
