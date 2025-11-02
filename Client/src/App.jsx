import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';


function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/home" element={
            <Home />
        } />
      </Routes>
    </main>
  );
}

export default App;