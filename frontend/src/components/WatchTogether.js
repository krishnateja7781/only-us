import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';

const WatchTogether = ({ pairingSession }) => {
  const [videoId, setVideoId] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced');
  
  const navigate = useNavigate();
  const lastSyncTime = useRef(0);

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Handle video URL submission
  const handleVideoSubmit = () => {
    const id = extractVideoId(videoUrl);
    if (id) {
      setCurrentVideoId(id);
      setVideoUrl('');
      // In real implementation, broadcast to partner via WebRTC
      broadcastVideoChange(id);
    } else {
      alert('Please enter a valid YouTube URL');
    }
  };

  // Broadcast video change to partner (simulated)
  const broadcastVideoChange = (videoId) => {
    // In real implementation, this would use WebRTC DataChannel
    console.log('Broadcasting video change:', videoId);
  };

  // Handle player ready
  const onPlayerReady = (event) => {
    setPlayer(event.target);
  };

  // Handle player state change
  const onPlayerStateChange = (event) => {
    const playerState = event.data;
    
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    if (playerState === 1) {
      setIsPlaying(true);
      broadcastPlayerEvent('play', event.target.getCurrentTime());
    } else if (playerState === 2) {
      setIsPlaying(false);
      broadcastPlayerEvent('pause', event.target.getCurrentTime());
    }
  };

  // Broadcast player events
  const broadcastPlayerEvent = (action, currentTime) => {
    const message = {
      type: 'video-sync',
      action: action,
      currentTime: currentTime,
      timestamp: Date.now()
    };
    
    // In real implementation, send via WebRTC DataChannel
    console.log('Broadcasting player event:', message);
    lastSyncTime.current = Date.now();
  };

  // Sync drift compensation
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      // Check for drift and resync if needed
      const timeSinceLastSync = Date.now() - lastSyncTime.current;
      if (timeSinceLastSync > 5000) { // 5 seconds without sync
        setSyncStatus('checking');
        
        // In real implementation, request sync from partner
        setTimeout(() => {
          setSyncStatus('synced');
        }, 1000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [player, isPlaying]);

  // Add reaction
  const addReaction = (emoji) => {
    const reaction = {
      id: Date.now(),
      emoji: emoji,
      x: Math.random() * 80 + 10, // 10-90% of width
      y: Math.random() * 80 + 10   // 10-90% of height
    };
    
    setReactions(prev => [...prev, reaction]);
    
    // Remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
    
    // Broadcast reaction to partner
    broadcastReaction(reaction);
  };

  // Broadcast reaction
  const broadcastReaction = (reaction) => {
    // In real implementation, send via WebRTC DataChannel
    console.log('Broadcasting reaction:', reaction);
  };

  // Player options
  const playerOptions = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/chat')}
            className="text-2xl hover:scale-110 transition-transform duration-300"
          >
            ←
          </button>
          <h1 className="text-2xl font-poppins font-bold">
            Watch Together 📺
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '💕 Connected' : '❌ Disconnected'}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${
            syncStatus === 'synced' ? 'bg-green-600' : 
            syncStatus === 'checking' ? 'bg-yellow-600' : 'bg-red-600'
          }`}>
            {syncStatus === 'synced' ? '🎬 Synced' : 
             syncStatus === 'checking' ? '⏳ Syncing...' : '⚠️ Out of sync'}
          </div>
        </div>
      </div>

      {/* Video URL input */}
      <div className="mb-6">
        <div className="flex space-x-3">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste YouTube URL to watch together..."
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-romantic-rose focus:border-transparent"
          />
          <motion.button
            onClick={handleVideoSubmit}
            disabled={!videoUrl.trim()}
            className="btn-romantic text-white px-6 py-3 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Load Video 📺
          </motion.button>
        </div>
      </div>

      {/* Video player */}
      <div className="relative mb-6">
        {currentVideoId ? (
          <div className="youtube-container">
            <YouTube
              videoId={currentVideoId}
              opts={playerOptions}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              className="w-full h-full"
            />
            
            {/* Floating reactions */}
            {reactions.map(reaction => (
              <motion.div
                key={reaction.id}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ 
                  opacity: 0, 
                  scale: 2,
                  y: -50
                }}
                transition={{ duration: 3 }}
                className="absolute text-4xl pointer-events-none z-10"
                style={{ 
                  left: `${reaction.x}%`, 
                  top: `${reaction.y}%` 
                }}
              >
                {reaction.emoji}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="youtube-container flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="text-6xl mb-4">📺</div>
              <h2 className="text-xl font-poppins font-semibold mb-2">
                No video loaded
              </h2>
              <p className="text-gray-400">
                Enter a YouTube URL above to start watching together
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reaction buttons */}
      <div className="mb-6">
        <h3 className="text-lg font-poppins font-semibold mb-3">
          React together 💕
        </h3>
        <div className="flex space-x-3 flex-wrap gap-2">
          {['❤️', '😍', '😂', '😮', '👏', '🔥', '💕', '🥰'].map(emoji => (
            <motion.button
              key={emoji}
              onClick={() => addReaction(emoji)}
              className="text-3xl p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Popular videos suggestions */}
      <div className="mb-6">
        <h3 className="text-lg font-poppins font-semibold mb-3">
          Romantic suggestions 💝
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Beautiful Love Songs Playlist", id: "dQw4w9WgXcQ" },
            { title: "Romantic Movie Scenes", id: "dQw4w9WgXcQ" },
            { title: "Sunset Timelapse", id: "dQw4w9WgXcQ" },
            { title: "Cozy Fireplace Ambience", id: "dQw4w9WgXcQ" }
          ].map((video, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentVideoId(video.id)}
              className="p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-300 text-left"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📹</div>
                <span className="font-medium">{video.title}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat integration */}
      <div className="glass-effect rounded-lg p-4">
        <h3 className="text-lg font-poppins font-semibold mb-3">
          While watching 💬
        </h3>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/chat')}
            className="btn-romantic text-white px-4 py-2"
          >
            Open Chat 💕
          </button>
          <button
            onClick={() => navigate('/video')}
            className="btn-romantic text-white px-4 py-2"
          >
            Video Call 📹
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchTogether;
