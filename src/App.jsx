import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Notes from './pages/Notes';
import WebTerminal from './pages/Terminal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        <Route
          path="/"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/notes"
          element={isLoggedIn ? <Notes /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/terminal"
          element={isLoggedIn ? <WebTerminal /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
