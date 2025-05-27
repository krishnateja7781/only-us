import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const VideoCall = ({ pairingSession }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showHearts, setShowHearts] = useState([]);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const navigate = useNavigate();

  // Simulate call duration timer
  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Start call
  const startCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsCallActive(true);
      
      // In real implementation, this would initiate WebRTC connection
      // For demo, simulate remote video
      simulateRemoteVideo();
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  // Simulate remote video (for demo)
  const simulateRemoteVideo = () => {
    // In real implementation, this would be the partner's video stream
    if (remoteVideoRef.current) {
      // Create a canvas with a gradient for demo
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      const drawFrame = () => {
        const gradient = ctx.createLinearGradient(0, 0, 640, 480);
        gradient.addColorStop(0, '#FADADD');
        gradient.addColorStop(0.5, '#E8DAEF');
        gradient.addColorStop(1, '#D6ECFF');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 480);
        
        // Add heart emoji
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💕', 320, 240);
        
        ctx.font = '20px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Partner\'s Video', 320, 300);
        
        requestAnimationFrame(drawFrame);
      };
      
      drawFrame();
      const stream = canvas.captureStream(30);
      remoteVideoRef.current.srcObject = stream;
    }
  };

  // End call
  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      const tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    
    setIsCallActive(false);
    setCallDuration(0);
    navigate('/chat');
  };

  // Toggle mute
  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTracks = localVideoRef.current.srcObject.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle video
  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const videoTracks = localVideoRef.current.srcObject.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
      });
    }
    setIsVideoOn(!isVideoOn);
  };

  // Add floating heart
  const addFloatingHeart = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const heart = {
      id: Date.now(),
      x: x,
      y: y
    };
    
    setShowHearts(prev => [...prev, heart]);
    
    // Remove heart after animation
    setTimeout(() => {
      setShowHearts(prev => prev.filter(h => h.id !== heart.id));
    }, 3000);
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isCallActive) {
    return (
      <div className="video-call-container">
        <div className="text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-8xl mb-6"
          >
            📹
          </motion.div>
          
          <h1 className="text-3xl font-poppins font-bold mb-4">
            Video Call
          </h1>
          
          <p className="text-lg mb-8 text-gray-300">
            Connect face to face with your love
          </p>
          
          <div className="space-y-4">
            <motion.button
              onClick={startCall}
              className="btn-romantic text-white px-8 py-4 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Video Call 💕
            </motion.button>
            
            <div>
              <button
                onClick={() => navigate('/chat')}
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Back to Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-container" onClick={addFloatingHeart}>
      {/* Remote video (main) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="video-main object-cover"
      />
      
      {/* Local video (picture-in-picture) */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="video-pip object-cover"
      />
      
      {/* Call info */}
      <div className="absolute top-4 left-4 text-white">
        <div className="glass-effect rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Connected securely</span>
          </div>
          <div className="text-lg font-mono mt-1">
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>
      
      {/* Video controls */}
      <div className="video-controls">
        <motion.button
          onClick={toggleMute}
          className={`video-control-btn ${isMuted ? 'bg-red-500' : ''}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMuted ? '🔇' : '🎤'}
        </motion.button>
        
        <motion.button
          onClick={toggleVideo}
          className={`video-control-btn ${!isVideoOn ? 'bg-red-500' : ''}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isVideoOn ? '📹' : '📷'}
        </motion.button>
        
        <motion.button
          onClick={endCall}
          className="video-control-btn bg-red-500"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          📞
        </motion.button>
      </div>
      
      {/* Floating hearts */}
      {showHearts.map(heart => (
        <motion.div
          key={heart.id}
          initial={{ opacity: 1, scale: 1, x: heart.x, y: heart.y }}
          animate={{ 
            opacity: 0, 
            scale: 2, 
            y: heart.y - 100,
            x: heart.x + (Math.random() - 0.5) * 100
          }}
          transition={{ duration: 3 }}
          className="absolute text-4xl pointer-events-none"
          style={{ left: 0, top: 0 }}
        >
          💕
        </motion.div>
      ))}
      
      {/* Instructions */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-75">
          Click anywhere to send hearts 💕
        </p>
      </div>
    </div>
  );
};

export default VideoCall;
