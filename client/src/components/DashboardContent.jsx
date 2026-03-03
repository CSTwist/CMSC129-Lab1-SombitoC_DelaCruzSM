import React, { useState, useEffect } from 'react';
import { Container, Modal, Button, Form } from 'react-bootstrap';
import '../styles/DashboardContent.css';
import JournalEntry from '../components/JournalEntry.jsx';

function DashboardContent({ user }) {
    const [journals, setJournals] = useState([]);
    const [username, setUsername] = useState("");
    
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // 1. Fetch Journals from Express
    const fetchJournals = async () => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.uid}/journals`);
            const data = await response.json();
            setJournals(data);
        } catch (error) {
            console.error("Error fetching journals", error);
        }
    };

    useEffect(() => {
        fetchJournals();
    }, [user]);

    // 2. Save a new Journal via Express
    const handleSaveJournal = async () => {
        if (!title.trim() || !content.trim()) return;
        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.uid}/journals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            
            if (response.ok) {
                setShowModal(false);
                setTitle("");
                setContent("");
                fetchJournals(); // Refresh list after adding
            }
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    // 3. Delete a Journal via Express
    const handleDeleteJournal = async (journalId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.uid}/journals/${journalId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchJournals(); // Refresh list after deleting
            }
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