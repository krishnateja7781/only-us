import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

const PairingScreen = ({ pairingSession, setPairingSession, isConnected, setIsConnected }) => {
  const [mode, setMode] = useState('waiting'); // 'waiting', 'creating', 'joining'
  const [pairingCode, setPairingCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const { user, logout, API } = useContext(AuthContext);
  const navigate = useNavigate();

  // Create pairing session
  const createPairingSession = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${API}/pairing/create`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setPairingCode(response.data.pairing_code);
      setPairingSession(response.data);
      setMode('creating');
      
      // Store in localStorage
      localStorage.setItem('pairing_session', JSON.stringify(response.data));
      
      // Start checking for partner connection
      startConnectionPolling(response.data.session_id);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create pairing session');
    } finally {
      setIsLoading(false);
    }
  };

  // Join pairing session
  const joinPairingSession = async () => {
    if (!joinCode.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${API}/pairing/join`,
        { pairing_code: joinCode.trim() },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const sessionData = { session_id: response.data.session_id, pairing_code: joinCode };
      setPairingSession(sessionData);
      setMode('joining');
      
      // Store in localStorage
      localStorage.setItem('pairing_session', JSON.stringify(sessionData));
      
      // Connection successful, redirect to chat
      setIsConnected(true);
      setConnectionStatus('connected');
      
      setTimeout(() => {
        navigate('/chat');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to join pairing session');
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for connection status
  const startConnectionPolling = (sessionId) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(
          `${API}/pairing/status/${sessionId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.is_paired) {
          setIsConnected(true);
          setConnectionStatus('connected');
          clearInterval(interval);
          
          setTimeout(() => {
            navigate('/chat');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking pairing status:', error);
      }
    }, 2000);

    // Clean up interval after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  // Copy pairing code to clipboard
  const copyPairingCode = async () => {
    try {
      await navigator.clipboard.writeText(pairingCode);
      // Show success feedback
      const button = document.getElementById('copy-button');
      const originalText = button.textContent;
      button.textContent = 'Copied! 💕';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Check for existing session
  useEffect(() => {
    const storedSession = localStorage.getItem('pairing_session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setPairingSession(session);
        if (session.pairing_code) {
          setPairingCode(session.pairing_code);
          setMode('creating');
          startConnectionPolling(session.session_id);
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem('pairing_session');
      }
    }
  }, []);

  if (mode === 'waiting') {
    return (
      <div className="pairing-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <motion.div
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💕
            </motion.div>
            <h1 className="text-3xl font-poppins font-bold text-gray-800 mb-2">
              Connect with Your Love
            </h1>
            <p className="text-gray-600 font-nunito">
              Create or join a private session
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <motion.button
              onClick={createPairingSession}
              disabled={isLoading}
              className="w-full btn-romantic text-white font-medium py-4 text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create New Session 💕
            </motion.button>

            <div className="text-center text-gray-500 font-nunito">
              or
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter pairing code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="auth-input text-center text-lg tracking-widest"
                maxLength={6}
              />
              <motion.button
                onClick={joinPairingSession}
                disabled={isLoading || !joinCode.trim()}
                className="w-full btn-romantic text-white font-medium py-4 text-lg disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Join Session 💝
              </motion.button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-red-500 text-center glass-effect rounded-lg p-3"
            >
              {error}
            </motion.div>
          )}

          {/* User info and logout */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm mb-2">
              Signed in as {user?.name}
            </p>
            <button
              onClick={logout}
              className="text-romantic-rose hover:text-romantic-lavender transition-colors duration-300 text-sm"
            >
              Sign out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === 'creating') {
    return (
      <div className="pairing-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="mb-8">
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💕
            </motion.div>
            <h1 className="text-2xl font-poppins font-bold text-gray-800 mb-2">
              Share this code with your love
            </h1>
          </div>

          {/* Pairing code display */}
          <motion.div
            className="pairing-code mb-6"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {pairingCode}
          </motion.div>

          {/* Copy button */}
          <motion.button
            id="copy-button"
            onClick={copyPairingCode}
            className="btn-romantic text-white font-medium px-8 py-3 mb-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Copy Code 📋
          </motion.button>

          {/* Connection status */}
          <div className="mb-6">
            <div className={`connection-status ${connectionStatus}`}>
              {connectionStatus === 'disconnected' && (
                <>
                  <div className="loading-dots mr-2">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                  Waiting for partner...
                </>
              )}
              {connectionStatus === 'connected' && (
                <>
                  💕 Connected! Redirecting to chat...
                </>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="glass-effect rounded-lg p-4 text-sm text-gray-600">
            <p className="mb-2">💝 Your partner needs to:</p>
            <p>1. Open the app and sign in</p>
            <p>2. Enter this 6-digit code</p>
            <p>3. Start chatting privately!</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (mode === 'joining') {
    return (
      <div className="pairing-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            💕
          </motion.div>
          <h1 className="text-3xl font-poppins font-bold text-gray-800 mb-4">
            Connected!
          </h1>
          <p className="text-gray-600 font-nunito text-lg">
            Entering your private space...
          </p>
          
          <div className="mt-6">
            <div className="loading-dots justify-center">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
};

export default PairingScreen;
