import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import './Notices.css';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      console.log('Fetching notices from:', `${BASE_URL}/notices`);
      const response = await axios.get(`${BASE_URL}/notices`);
      console.log('Raw notices data:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response data:', response.data);
        setError('Invalid response from server');
        return;
      }

      const currentTime = new Date();

      // Filter out expired notices and sort by importance and date
      const validNotices = response.data
        .filter(notice => {
          if (!notice.deadline) return true; // Keep notices without deadlines
          const deadline = new Date(notice.deadline);
          return deadline > currentTime;
        })
        .sort((a, b) => {
          // First sort by importance (high = 1, medium = 2, low = 3)
          const importanceOrder = { high: 1, medium: 2, low: 3 };
          const importanceDiff = importanceOrder[a.importance] - importanceOrder[b.importance];
          
          if (importanceDiff !== 0) return importanceDiff;
          
          // If importance is the same, sort by date (newest first)
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });

      console.log('Filtered and sorted notices:', validNotices);
      setNotices(validNotices);
    } catch (err) {
      console.error('Error fetching notices:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(`Failed to fetch notices: ${err.response.data.message || err.message}`);
      } else {
        setError('Failed to fetch notices. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="notices-loading">Loading notices...</div>;
  }

  if (error) {
    return <div className="notices-error">{error}</div>;
  }

  return (
    <div className="notices-container">
      <h2>Important Notices</h2>
      
      {notices.length === 0 ? (
        <p className="no-notices">No notices available at the moment.</p>
      ) : (
        <div className="notices-grid">
          {notices.map(notice => (
            <div 
              key={notice.id} 
              className={`notice-card importance-${notice.importance || 'medium'}`}
            >
              <div className="notice-header">
                <h3>{notice.title}</h3>
                <span className={`importance-badge ${notice.importance || 'medium'}`}>
                  {(notice.importance || 'medium').toUpperCase()}
                </span>
              </div>
              <div className="notice-content">
                <p className="notice-description">{notice.description}</p>
                <p className="notice-content-text">{notice.content}</p>
                <div className="notice-meta">
                  <span className="notice-date">
                    Posted: {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'Date not available'}
                  </span>
                  {notice.deadline && (
                    <span className="notice-deadline">
                      Valid until: {new Date(notice.deadline).toLocaleDateString()}
                    </span>
                  )}
                  {notice.author && (
                    <span className="notice-author">
                      By: {notice.author}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notices; 