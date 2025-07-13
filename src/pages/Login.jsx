import React from 'react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 font-montserrat">
      <div className="p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white w-full max-w-sm">
        <h2 className="text-2xl mb-4 font-bold">Login</h2>
        <input type="text" placeholder="Username" className="w-full p-2 mb-3 bg-white/10 rounded-md border border-white/20 focus:outline-none" />
        <input type="password" placeholder="Password" className="w-full p-2 mb-4 bg-white/10 rounded-md border border-white/20 focus:outline-none" />
        <button className="w-full bg-white/20 hover:bg-white/30 p-2 rounded-md">Login</button>
      </div>
    </div>
  );
}
