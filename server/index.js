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

const DbService = require('./services/dbService');

// --- USER PROFILE ROUTES ---

// --- USER PROFILE ROUTES ---

app.get('/api/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        // Delegated to DbService
        const userProfile = await DbService.getUserProfile(uid);
        
        if (!userProfile) return res.status(404).json({ error: "User not found" });
        res.status(200).json(userProfile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});

app.put('/api/users/:uid/profile', async (req, res) => {
    try {
        const { uid } = req.params;
        const { username, email } = req.body;
        
        const updateData = { updatedAt: Date.now() };
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        
        // Delegated to DbService
        await DbService.updateUserProfile(uid, updateData);

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// --- JOURNAL ROUTES (ACTIVE ENTRIES) ---

app.get('/api/users/:uid/journals', async (req, res) => {
    try {
        const { uid } = req.params;
        const journals = await DbService.getActiveJournals(uid);
        res.status(200).json(journals);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch journals from all databases" });
    }
});

app.post('/api/users/:uid/journals', async (req, res) => {
    try {
        const { uid } = req.params;
        const { title, content } = req.body;
        
        const journal = await DbService.createJournal(uid, { title, content });
        res.status(201).json(journal);
    } catch (error) {
        res.status(500).json({ error: "Failed to add journal" });
    }
});

app.put('/api/users/:uid/journals/:journalId', async (req, res) => {
    try {
        const { uid, journalId } = req.params;
        const { title, content } = req.body;
        // Delegated to service
        await DbService.updateJournal(uid, journalId, { title, content });
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
        // Delegated to service
        await DbService.softDeleteJournal(uid, journalId);
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
        // Delegated to service (Will need failover read logic)
        const journals = await DbService.getTrash(uid);
        res.status(200).json(journals);
    } catch (error) {
        console.error("FIRESTORE ERROR (Trash):", error);
        res.status(500).json({ error: "Failed to fetch trash" });
    }
});

app.put('/api/users/:uid/journals/:journalId/restore', async (req, res) => {
    try {
        const { uid, journalId } = req.params;
        // Delegated to service
        await DbService.restoreJournal(uid, journalId);
        res.status(200).json({ message: "Journal restored" });
    } catch (error) {
        res.status(500).json({ error: "Restore failed" });
    }
});

app.delete('/api/users/:uid/journals/:journalId/permanent', async (req, res) => {
    try {
        const { uid, journalId } = req.params;
        // Delegated to service
        await DbService.permanentDelete(uid, journalId);
        res.status(200).json({ message: "Permanently deleted" });
    } catch (error) {
        res.status(500).json({ error: "Permanent delete failed" });
    }
});

// DELETE all items in trash (Empty Trash)
app.delete('/api/users/:uid/trash/empty', async (req, res) => {
    try {
        const { uid } = req.params;
        // Delegated to service
        await DbService.emptyTrash(uid);
        res.status(200).json({ message: "Trash emptied successfully" });
    } catch (error) {
        console.error("Error emptying trash:", error);
        res.status(500).json({ error: "Failed to empty trash" });
    }
});

const startSyncWorker = require('./services/syncWorker');
startSyncWorker();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});