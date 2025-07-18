import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after login
  const from = location.state?.from?.pathname || '/';

  //const API_BASE = "http://localhost:5000";
  const API_BASE = "https://zenmaster.coydog-parore.ts.net";

  const handleLogin = async () => {
    const res = await fetch(API_BASE.concat('/api/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      login();
      navigate(from, { replace: true }); // Redirect back to intended page
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
