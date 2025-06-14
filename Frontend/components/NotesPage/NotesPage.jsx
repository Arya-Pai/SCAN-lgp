import React, { useState, useEffect } from "react";
import { FiUpload, FiSearch, FiFileText, FiDownload, FiEye } from "react-icons/fi";
import axios from "axios";
import "./NotesPage.css";


const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    type: "Lecture Notes",
    description: "",
    fileUrl: "",
  });

  // API Base URL (Update this to your backend's base URL)
  const API_BASE_URL = "http://localhost:3000";

  // Fetch notes on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/notes`);
        setNotes(res.data);
        setFilteredNotes(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      }
    };
    fetchNotes();
  }, []);

  // Filter notes based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredNotes(notes);
      return;
    }
    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.course.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Google Drive file selection
  const handleDrivePicker = () => {
    const google = window.google;
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.DOCS)
      .setOAuthToken(window.gapi.auth.getToken().access_token)
      .setDeveloperKey("YOUR_GOOGLE_API_KEY") // Replace with your API key
      .setCallback((data) => {
        if (data.action === google.picker.Action.PICKED) {
          const file = data.docs[0];
          setFormData({ ...formData, fileUrl: file.url });
        }
      })
      .build();
    picker.setVisible(true);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/notes`, {
        ...formData,
        author: "Current User", // Replace with actual username or auth
        pages: 0,
        downloads: 0,
        createdAt: new Date(),
      });
      setFormData({ title: "", course: "", type: "Lecture Notes", description: "", fileUrl: "" });
      setShowForm(false);
      setIsLoading(true);

      // Fetch updated notes
      const res = await axios.get(`${API_BASE_URL}/notes`);
      setNotes(res.data);
      setFilteredNotes(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error uploading note:", err);
    }
  };

  // Download file
  const handleDownload = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  return (
    <div className="notes-container">
      <div className="header">
        <div className="header-info">
          <h1>Shared Notes</h1>
          <p>Upload and access study materials</p>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setShowForm(true)} className="upload-button">
            <FiUpload /> Upload
          </button>
        </div>
      </div>

      {isLoading && <div className="loading-spinner" />}

      {!isLoading && (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <div key={note.id} className="note-card">
              <FiFileText className="note-icon" />
              <h3>{note.title}</h3>
              <p>{note.course}</p>
              <div className="note-meta">
                <span>{note.author}</span>
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="note-actions">
                <button onClick={() => handleDownload(note.fileUrl)}>
                  <FiDownload />
                </button>
                <button>
                  <FiEye />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredNotes.length === 0 && (
        <div className="empty-state">
          <h3>No notes found</h3>
          <p>{searchQuery ? "Try a different search" : "Be the first to upload a note!"}</p>
        </div>
      )}

      {showForm && (
        <div className="modal">
          <form onSubmit={handleSubmit} className="upload-form">
            <h2>Upload New Notes</h2>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              required
            />
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="Course"
              required
            />
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="Lecture Notes">Lecture Notes</option>
              <option value="Study Guide">Study Guide</option>
              <option value="Summary">Summary</option>
              <option value="Practice Problems">Practice Problems</option>
            </select>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
            />
            <input
              type="url"
              name="fileUrl"
              value={formData.fileUrl}
              onChange={handleChange}
              placeholder="Paste Google Drive File URL"
              required
            />
            {formData.fileUrl && !formData.fileUrl.includes("drive.google.com") && (
  <p style={{ color: "red" }}>Please enter a valid Google Drive link</p>
)}

            <div className="form-actions">
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit">Upload</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NotesPage;