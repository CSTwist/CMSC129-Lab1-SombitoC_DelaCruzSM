const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require("dotenv").config();

// Initialize Express
const app = express();

// Middleware
app.use(cors()); // Allows your React frontend to make requests here
app.use(express.json()); // Parses incoming JSON requests

// TODO: Initialize Firebase Admin (Requires serviceAccountKey.json from Firebase Console)
const serviceAccount = require('./config/serviceAccountKey.json');
admin.initializeApp({
credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
module.exports = { admin, db };

// GET user profile data (like username)
app.get('/api/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Send the user data (which includes the username) back to React
        res.status(200).json(userDoc.data());
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});
// GET all journals for a user
app.get('/api/users/:uid/journals', async (req, res) => {
    try {
        const { uid } = req.params;
        const journalsRef = db.collection('users').doc(uid).collection('journals');
        const snapshot = await journalsRef.orderBy('createdAt', 'desc').get();
        
        const journals = [];
        snapshot.forEach(doc => {
            journals.push({ id: doc.id, ...doc.data() });
        });
        
        res.status(200).json(journals);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch journals" });
    }
});

// POST a new journal
app.post('/api/users/:uid/journals', async (req, res) => {
    try {
        const { uid } = req.params;
        const { title, content } = req.body;
        
        const newJournal = {
            title,
            content,
            createdAt: Date.now()
        };
        
        const docRef = await db.collection('users').doc(uid).collection('journals').add(newJournal);
        res.status(201).json({ id: docRef.id, ...newJournal });
    } catch (error) {
        res.status(500).json({ error: "Failed to add journal" });
    }
});

// DELETE a journal
app.delete('/api/users/:uid/journals/:journalId', async (req, res) => {
    try {
        const { uid, journalId } = req.params;
        await db.collection('users').doc(uid).collection('journals').doc(journalId).delete();
        
        res.status(200).json({ message: "Journal deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete journal" });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});