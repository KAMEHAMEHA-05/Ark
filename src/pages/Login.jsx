import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const API_BASE = "https://zenmaster.coydog-parore.ts.net";
  //const API_BASE = "http://localhost:5000"; // Use your backend API base URL

  const handleLogin = async () => {
    const res = await fetch(API_BASE.concat('/api/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      setIsLoggedIn(true);
      navigate('/');
    } else {
      alert('Invalid credentials');
    }
  };


  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white">
      <h1 className="text-4xl mb-8">Ark Login</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        className="mb-4 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="mb-4 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
      />
      <button
        onClick={handleLogin}
        className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl"
      >
        Login
      </button>
    </div>
  );
}
