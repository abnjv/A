import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RoomsPage from './components/RoomsPage';
import Room from './components/Room';
import ProfilePage from './components/ProfilePage'; // Import the new page
import './index.css'; // Assuming Tailwind is set up here

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/room/:roomName" element={<Room />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* Add the profile route */}
      </Routes>
    </Router>
  );
}

export default App;
