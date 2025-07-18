import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Notes from './pages/Notes';
import WebTerminal from './pages/Terminal';

function PrivateRoute({ element }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return element;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/notes" element={<PrivateRoute element={<Notes />} />} />
          <Route path="/terminal" element={<PrivateRoute element={<WebTerminal />} />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
