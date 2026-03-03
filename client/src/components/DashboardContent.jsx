import React, { useState, useEffect } from 'react';
import { Container, Modal, Button, Form } from 'react-bootstrap';
import '../styles/DashboardContent.css';
import JournalEntry from '../components/JournalEntry.jsx';

// Firebase
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';

function DashboardContent({ user }) {
    const [journals, setJournals] = useState([]);
    const [username, setUsername] = useState("");
    
    // Modal state for adding a journal
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // 1. Fetch User Profile (Username)
    useEffect(() => {
        if (!user) return;
        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                setUsername(docSnap.data().username);
            }
        });
        return () => unsubscribe();
    }, [user]);

    // 2. Fetch Journals Subcollection
    useEffect(() => {
        if (!user) return;
        
        // Target: users -> [User ID] -> journals
        const q = query(collection(db, 'users', user.uid, 'journals'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const journalsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sort by newest first
            journalsData.sort((a, b) => b.createdAt - a.createdAt);
            setJournals(journalsData);
        });

        return () => unsubscribe();
    }, [user]);

    // 3. Save a new Journal
    const handleSaveJournal = async () => {
        if (!title.trim() || !content.trim()) return;
        try {
            await addDoc(collection(db, 'users', user.uid, 'journals'), {
                title: title,
                content: content,
                createdAt: Date.now() // Timestamp
            });
            setShowModal(false);
            setTitle("");
            setContent("");
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    // 4. Delete a Journal
    const handleDeleteJournal = async (journalId) => {
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'journals', journalId));
        } catch (e) {
            console.error("Error deleting document: ", e);
        }
    };

    return (
        <Container className="dashboard-content d-flex flex-column align-items-center min-vh-100">
            <p id="dashboard-greetings">How was your day, {username || 'friend'}?</p>
            
            <button className="add-journal btn btn-primary d-flex align-items-center justify-content-center gap-2 rounded-4" onClick={() => setShowModal(true)}>
                <i className="bi bi-plus-square"></i> New entry
            </button>

            {journals.length === 0 ? (
                <div style={{color: 'white', marginTop: '20px'}}>No journal entries yet. Start writing!</div>
            ) : (
                journals.map(journal => (
                    <JournalEntry key={journal.id} entry={journal} onDelete={handleDeleteJournal} />
                ))
            )}

            {/* Modal for new entry */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Dear Journal...</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control type="text" placeholder="Entry Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Control as="textarea" rows={6} placeholder="Write your thoughts here..." value={content} onChange={(e) => setContent(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveJournal}>Save Entry</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default DashboardContent;