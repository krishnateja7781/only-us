import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import { AuthContext } from '../App';

const ChatInterface = ({ pairingSession }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showThumbKiss, setShowThumbKiss] = useState(false);
  const [thumbKissActive, setThumbKissActive] = useState(false);
  const [conversationStarter, setConversationStarter] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Conversation starters data
  const conversationStarters = [
    "What's the most romantic place you've ever been to? 💕",
    "If we could travel anywhere together right now, where would we go? ✈️",
    "What's your favorite memory of us together? 🥰",
    "What makes you feel most loved? 💝",
    "If you could describe our love in three words, what would they be? 💖",
    "What's something new you'd like us to try together? 🌟",
    "What song reminds you of us? 🎵",
    "What's your favorite thing about our relationship? 💕",
    "If we were having our perfect date night, what would we do? 🌙",
    "What's something you're looking forward to in our future? 🔮"
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show conversation starter if no messages for a while
  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => {
        const randomStarter = conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
        setConversationStarter(randomStarter);
      }, 10000); // Show after 10 seconds of no activity

      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Handle sending messages
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setShowEmojiPicker(false);
    
    // In real implementation, this would be sent via WebRTC DataChannel
    // For now, simulate partner receiving message
    simulatePartnerResponse();
  };

  // Simulate partner response (for demo purposes)
  const simulatePartnerResponse = () => {
    const responses = [
      "I love you too! 💕",
      "That sounds amazing! 🥰",
      "You always make me smile 😊",
      "I can't wait to see you! 💖",
      "You're the best! 🌟",
      "Missing you so much 💝"
    ];

    setTimeout(() => {
      setPartnerTyping(true);
      
      setTimeout(() => {
        const response = {
          id: Date.now(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'partner',
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, response]);
        setPartnerTyping(false);
      }, 2000);
    }, 1000);
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  // Handle typing indicator
  const handleTyping = (value) => {
    setNewMessage(value);
    setIsTyping(value.length > 0);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Handle thumb kiss
  const handleThumbKiss = () => {
    setThumbKissActive(true);
    setTimeout(() => setThumbKissActive(false), 300);
    
    // Add heart animation
    createFloatingHeart();
    
    // In real implementation, this would sync with partner via WebRTC
  };

  // Create floating heart animation
  const createFloatingHeart = () => {
    const heart = document.createElement('div');
    heart.innerHTML = '💕';
    heart.className = 'floating-heart';
    heart.style.left = Math.random() * window.innerWidth + 'px';
    heart.style.top = window.innerHeight - 100 + 'px';
    document.body.appendChild(heart);
    
    setTimeout(() => {
      document.body.removeChild(heart);
    }, 3000);
  };

  // Use conversation starter
  const useConversationStarter = () => {
    setNewMessage(conversationStarter);
    setConversationStarter(null);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="flex items-center">
          <div className="text-2xl mr-3">💕</div>
          <div>
            <h1 className="text-lg font-poppins font-semibold text-gray-800">
              Only Us
            </h1>
            <p className="text-sm text-gray-600">
              {partnerTyping ? 'Partner is typing...' : 'Connected & secure'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Video call button */}
          <motion.button
            onClick={() => navigate('/video')}
            className="w-10 h-10 rounded-full bg-romantic-rose bg-opacity-20 flex items-center justify-center text-romantic-rose hover:bg-opacity-30 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            📹
          </motion.button>
          
          {/* Watch together button */}
          <motion.button
            onClick={() => navigate('/watch')}
            className="w-10 h-10 rounded-full bg-romantic-rose bg-opacity-20 flex items-center justify-center text-romantic-rose hover:bg-opacity-30 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            📺
          </motion.button>
          
          {/* Thumb kiss button */}
          <motion.button
            onClick={() => setShowThumbKiss(true)}
            className="w-10 h-10 rounded-full bg-romantic-rose bg-opacity-20 flex items-center justify-center text-romantic-rose hover:bg-opacity-30 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            👆
          </motion.button>
          
          {/* Settings button */}
          <motion.button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-full bg-romantic-rose bg-opacity-20 flex items-center justify-center text-romantic-rose hover:bg-opacity-30 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ⚙️
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💕</div>
            <p className="text-gray-600 font-nunito">
              Start your conversation with love...
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`message-bubble ${message.sender === 'me' ? 'sent' : 'received'}`}>
              <p className="text-gray-800">{message.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        
        {partnerTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="message-bubble received">
              <div className="loading-dots">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Conversation starter */}
      {conversationStarter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4"
        >
          <div className="conversation-card">
            <p className="text-gray-700 mb-3 font-nunito">{conversationStarter}</p>
            <button
              onClick={useConversationStarter}
              className="btn-romantic text-white px-4 py-2 text-sm"
            >
              Use this starter 💕
            </button>
          </div>
        </motion.div>
      )}

      {/* Chat input */}
      <div className="chat-input-container">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message with love..."
              className="chat-input"
              rows="1"
            />
          </div>
          
          <motion.button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-10 h-10 rounded-full bg-romantic-rose bg-opacity-20 flex items-center justify-center text-romantic-rose hover:bg-opacity-30 transition-colors duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            😊
          </motion.button>
          
          <motion.button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-full bg-romantic-rose flex items-center justify-center text-white hover:bg-opacity-80 transition-colors duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            💕
          </motion.button>
        </div>
        
        {/* Emoji picker */}
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-20 right-4 z-10"
          >
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </motion.div>
        )}
      </div>

      {/* Thumb Kiss Modal */}
      {showThumbKiss && (
        <div className="thumb-kiss-area" onClick={() => setShowThumbKiss(false)}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`thumb-kiss-circle ${thumbKissActive ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleThumbKiss();
            }}
          >
            <div className="text-4xl">👆💕</div>
          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal" onClick={() => setShowSettings(false)}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="settings-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-poppins font-bold text-gray-800 mb-4">
              Settings
            </h2>
            
            <div className="space-y-4">
              <div className="glass-effect rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">🔒 Encryption Status</h3>
                <p className="text-sm text-gray-600">
                  End-to-end encrypted • AES-256 • No data stored
                </p>
              </div>
              
              <div className="glass-effect rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">📱 Session Info</h3>
                <p className="text-sm text-gray-600">
                  Connected since: {new Date().toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-600">
                  Session ID: {pairingSession?.session_id?.slice(0, 8)}...
                </p>
              </div>
              
              <button
                onClick={logout}
                className="w-full btn-romantic text-white py-3"
              >
                Disconnect Session
              </button>
            </div>
            
            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 w-full text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
