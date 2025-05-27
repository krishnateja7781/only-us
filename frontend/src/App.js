import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Import components (will create these)
import AuthScreen from './components/AuthScreen';
import PairingScreen from './components/PairingScreen';
import ChatInterface from './components/ChatInterface';
import VideoCall from './components/VideoCall';
import WatchTogether from './components/WatchTogether';

// API configuration
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth context
const AuthContext = React.createContext();

// Main App component
function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pairingSession, setPairingSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  // Auth functions
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setPairingSession(null);
    setIsConnected(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('pairing_session');
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="app-container">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">💕</div>
            <div className="text-2xl font-poppins text-gray-700 mb-4">Only Us</div>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, API }}>
      <div className="app-container">
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/auth" 
                element={
                  user ? <Navigate to="/pairing" replace /> : <AuthScreen />
                } 
              />
              <Route 
                path="/pairing" 
                element={
                  user ? (
                    <PairingScreen 
                      pairingSession={pairingSession}
                      setPairingSession={setPairingSession}
                      isConnected={isConnected}
                      setIsConnected={setIsConnected}
                    />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                } 
              />
              <Route 
                path="/chat" 
                element={
                  user && pairingSession && isConnected ? (
                    <ChatInterface 
                      pairingSession={pairingSession}
                    />
                  ) : (
                    <Navigate to="/pairing" replace />
                  )
                } 
              />
              <Route 
                path="/video" 
                element={
                  user && pairingSession && isConnected ? (
                    <VideoCall 
                      pairingSession={pairingSession}
                    />
                  ) : (
                    <Navigate to="/pairing" replace />
                  )
                } 
              />
              <Route 
                path="/watch" 
                element={
                  user && pairingSession && isConnected ? (
                    <WatchTogether 
                      pairingSession={pairingSession}
                    />
                  ) : (
                    <Navigate to="/pairing" replace />
                  )
                } 
              />
              <Route 
                path="/" 
                element={
                  user ? (
                    pairingSession && isConnected ? (
                      <Navigate to="/chat" replace />
                    ) : (
                      <Navigate to="/pairing" replace />
                    )
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                } 
              />
            </Routes>
          </AnimatePresence>
        </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}

// Export context for use in components
export { AuthContext };
export default App;
