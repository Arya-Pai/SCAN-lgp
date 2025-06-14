const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");

import { getAuth } from "firebase/auth"; // make sure Firebase is initialized




    const token = await user.getIdToken();
    console.log("Token:", token);

    await axios.post(`${API_BASE_URL}/notes`,
      {
        Title: formData.title,
        Course: formData.course,
        Description: formData.description,
        URL: formData.fileUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Reset form and refresh notes
    setFormData({ title: "", course: "", type: "Lecture Notes", description: "", fileUrl: "" });
    setShowForm(false);
    setIsLoading(true);

    const res = await axios.get(`${API_BASE_URL}/notes`);
    setNotes(res.data);
    setFilteredNotes(res.data);
    setIsLoading(false);
  } catch (err) {
    console.error("Error uploading note:", err);
    alert("Failed to upload note. Check console for details.");
  }
};



// Get user name from Firestore
const getUserName = async (uid) => {
  try {
    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    return userDoc.exists ? userDoc.data().name : "Anonymous";
  } catch (error) {
    console.error("Error fetching user:", error);
    return "Anonymous";
  }
};

// Create new note
router.post("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    // Verify token and get UID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userName = await getUserName(decodedToken.uid);

    const { Title, Course, Description, Time, URL } = req.body;
    
    if (!Title || !Course || !URL) {
      return res.status(400).json({ message: "Title, Course and URL are required" });
    }

    const noteData = {
      Title,
      Course,
      Description: Description || "",
      Time: Time ? Timestamp.fromDate(new Date(Time)) : Timestamp.now(),
      URL,
      author: userName,
      authorId: decodedToken.uid, // Store UID for reference
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      downloads: 0
    };

    const docRef = await admin.firestore().collection("notes").add(noteData);
    res.status(201).json({ 
      id: docRef.id,
      message: "Note created successfully",
      note: {
        ...noteData,
        Time: noteData.Time.toDate().toISOString(),
        createdAt: noteData.createdAt.toDate().toISOString(),
        updatedAt: noteData.updatedAt.toDate().toISOString()
      }
    });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Error creating note" });
  }
});

// Get all notes with author details
router.get("/", async (req, res) => {
  try {
    const notesSnapshot = await admin.firestore().collection("notes")
      .orderBy("Time", "desc")
      .get();

    const notes = await Promise.all(notesSnapshot.docs.map(async doc => {
      const noteData = doc.data();
      let authorName = noteData.author;
      
      // If we only have UID, fetch name from users collection
      if (noteData.authorId && !noteData.author) {
        authorName = await getUserName(noteData.authorId);
      }

      return {
        id: doc.id,
        ...noteData,
        author: authorName,
        Time: noteData.Time?.toDate().toISOString(),
        createdAt: noteData.createdAt?.toDate().toISOString(),
        updatedAt: noteData.updatedAt?.toDate().toISOString()
      };
    }));

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Error fetching notes" });
  }
});

// Update note with ownership check
router.put("/:id", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const noteRef = admin.firestore().collection("notes").doc(req.params.id);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) return res.status(404).json({ message: "Note not found" });
    if (noteDoc.data().authorId !== decodedToken.uid) {
      return res.status(403).json({ message: "Not authorized to update this note" });
    }

    const { Title, Course, Description, Time, URL } = req.body;
    await noteRef.update({
      Title,
      Course,
      Description,
      URL,
      Time: Time ? Timestamp.fromDate(new Date(Time)) : noteDoc.data().Time,
      updatedAt: Timestamp.now()
    });

    res.status(200).json({ message: "Note updated successfully" });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Error updating note" });
  }
});

module.exports = router;