import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // State for managing active tab (event or notice)
  const [activeTab, setActiveTab] = useState('event');

  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    maxParticipants: '',
    deadline: '',
    importance: 'low',
    image: null
  });

  // State for loading and message handling
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Authentication token not found. Please log in again.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      // Determine endpoint based on active tab
      const endpoint = activeTab === 'event' ? '/events' : '/notices';
      console.log('Sending request to:', `${BASE_URL}${endpoint}`);
      
      // Create request data object
      const requestData = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline
      };

      // Add fields based on active tab
      if (activeTab === 'event') {
        Object.assign(requestData, {
          maxParticipants: parseInt(formData.maxParticipants),
          date: formData.date,
          time: formData.time,
          venue: formData.venue
        });
      } else {
        Object.assign(requestData, {
          importance: formData.importance
        });
      }

      console.log('Request data:', requestData);

      const response = await axios.post(`${BASE_URL}${endpoint}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response:', response.data);

      // Show success message and reset form
      setMessage({ text: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} uploaded successfully!`, type: 'success' });
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        maxParticipants: '',
        deadline: '',
        importance: 'low',
        image: null
      });
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show error message
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Tab buttons for switching between event and notice */}
      <div className="tab-buttons">
        <button 
          className={activeTab === 'event' ? 'active' : ''}
          onClick={() => setActiveTab('event')}
        >
          Upload Event
        </button>
        <button 
          className={activeTab === 'notice' ? 'active' : ''}
          onClick={() => setActiveTab('notice')}
        >
          Upload Notice
        </button>
      </div>

      {/* Message display for success/error feedback */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Upload form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Event-specific fields */}
        {activeTab === 'event' && (
          <>
            <div className="form-group">
              <label>Maximum Participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Venue</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Registration Deadline</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )}

        {/* Notice-specific fields */}
        {activeTab === 'notice' && (
          <>
            <div className="form-group">
              <label>Importance Level</label>
              <select
                name="importance"
                value={formData.importance}
                onChange={handleInputChange}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notice Deadline</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : `Upload ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        </button>
      </form>
    </div>
  );
};

export default AdminDashboard;