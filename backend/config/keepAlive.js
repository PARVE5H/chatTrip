import axios from 'axios';

// Keep-alive service for Render free tier
const keepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000';
  
  const pingServer = async () => {
    try {
      await axios.get(`${url}/api/keep-alive`);
      console.log('Keep-alive ping sent successfully');
    } catch (error) {
      console.log('Keep-alive ping failed:', error.message);
    }
  };

  // Ping every 14 minutes (before 15-minute timeout)
  const interval = setInterval(pingServer, 14 * 60 * 1000);

  // Return cleanup function
  return () => clearInterval(interval);
};

export default keepAlive;
