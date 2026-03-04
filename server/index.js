const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require("dotenv").config();

// Initialize Express
const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// --- REQUEST LOGGER ---
// This will ensure you see every request in your terminal to debug 404s
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleString()} - ${req.method} request to ${req.url}`);
    next();
});

// Initialize Firebase Admin
const serviceAccount = require('./config/serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

// --- USER PROFILE ROUTES ---

app.get('/api/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
        res.status(200).json(userDoc.data());
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});

// --- JOURNAL ROUTES (ACTIVE ENTRIES) ---

app.get('/api/users/:uid/journals', async (req, res) => {
    try {
        const { uid } = req.params;
        const journalsRef = db.collection('users').doc(uid).collection('journals');
        // Requires Index: isDeleted (Asc), createdAt (Desc)
        const snapshot = await journalsRef.where('isDeleted', '==', false).orderBy('createdAt', 'desc').get();
        
        const journals = [];
        snapshot.forEach(doc => journals.push({ id: doc.id, ...doc.data() }));
        res.status(200).json(journals);
    } catch (error) {
        console.error("FIRESTORE ERROR (Journals):", error);
        res.status(500).json({ error: "Failed to fetch journals" });
    }
});

app.post('/api/users/:uid/journals', async (req, res) => {
    try {
        const { uid } = req.params;
        const { title, content } = req.body;
        const newJournal = {
            title,
            content,
            createdAt: Date.now(),
            isDeleted: false,
            deletedAt: Date.now() // Initialize deletedAt to prevent Firestore null issues
        };
        const docRef = await db.collection('users').doc(uid).collection('journals').add(newJournal);
        res.status(201).json({ id: docRef.id, ...newJournal });
    } catch (error) {
        res.status(500).json({ error: "Failed to add journal" });
    }
});

app.put('/api/users/:uid/journals/:journalId', async (req, res) => {
    try {
        const { uid, journalId } = req.params;
        const { title, content } = req.body;
        await db.collection('users').doc(uid).collection('journals').doc(journalId).update({ title, content });
        res.status(200).json({ message: "Journal updated successfully" });
    } catch (error) {
        console.error("Error updating journal:", error);
        res.status(500).json({ error: "Failed to update journal" });
    }
});

// Soft Delete
app.delete('/api/users/:uid/journals/:journalId', async (req, res) => {
    try {
        const { uid, journalId } = req.params;
        await db.collection('users').doc(uid).collection('journals').doc(journalId).update({
            isDeleted: true,
            deletedAt: Date.now()
        });
        res.status(200).json({ message: "Journal entry moved to Trash" });
    } catch (error) {
        res.status(500).json({ error: "Failed to move entry to Trash" });
    }
});

// --- TRASH ROUTES ---

// Fixes 404 for Trash Page load
app.get('/api/users/:uid/trash', async (req, res) => {
    try {
        const { uid } = req.params;
        // Requires Index: isDeleted (Asc), deletedAt (Desc)
        const snapshot = await db.collection('users').doc(uid).collection('journals')
            .where('isDeleted', '==', true)
            .orderBy('deletedAt', 'desc')
            .get();

        const journals = [];
        snapshot.forEach(doc => journals.push({ id: doc.id, ...doc.data() }));
        res.status(200).json(journals);
    } catch (error) {
        console.error("FIRESTORE ERROR (Trash):", error);
        res.status(500).json({ error: "Failed to fetch trash" });
    }
});

// Fixes 404 for Manual Cleanup
app.post('/api/users/:uid/trash/cleanup', async (req, res) => {
    try {
        const { uid } = req.params;
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        // Requires Index: isDeleted (Asc), deletedAt (Asc/Desc)
        const snapshot = await db.collection('users').doc(uid).collection('journals')
            .where('isDeleted', '==', true)
            .where('deletedAt', '<=', thirtyDaysAgo)
            .get();

        if (snapshot.empty) return res.status(200).json({ message: "No cleanup needed" });

        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        res.status(200).json({ message: "Old entries cleaned up" });
    } catch (error) {
        console.error("Cleanup error:", error);
        res.status(500).json({ error: "Cleanup failed" });
    }
});

app.put('/api/users/:uid/journals/:journalId/restore', async (req, res) => {
    try {
        const { uid, journalId } = req.params;
        await db.collection('users').doc(uid).collection('journals').doc(journalId).update({
            isDeleted: false,
            deletedAt: null
        });
        res.status(200).json({ message: "Journal restored" });
    } catch (error) {
        res.status(500).json({ error: "Restore failed" });
    }
});

app.delete('/api/users/:uid/journals/:journalId/permanent', async (req, res) => {
    try {
        const { uid, journalId } = req.params;
        await db.collection('users').doc(uid).collection('journals').doc(journalId).delete();
        res.status(200).json({ message: "Permanently deleted" });
    } catch (error) {
        res.status(500).json({ error: "Permanent delete failed" });
    }
});

// DELETE all items in trash (Empty Trash)
app.delete('/api/users/:uid/trash/empty', async (req, res) => {
    try {
        const { uid } = req.params;
        
        // Find all journals for this user that are currently in the trash
        const snapshot = await db.collection('users').doc(uid).collection('journals')
            .where('isDeleted', '==', true)
            .get();

        if (snapshot.empty) return res.status(200).json({ message: "Trash is already empty" });

        // Use a Firestore Batch to delete them all at once efficiently
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        res.status(200).json({ message: "Trash emptied successfully" });
    } catch (error) {
        console.error("Error emptying trash:", error);
        res.status(500).json({ error: "Failed to empty trash" });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});