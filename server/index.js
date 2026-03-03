const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

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

// A basic test route
app.get('/api/test', (req, res) => {
    res.json({ message: "Hello from your Express backend!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});