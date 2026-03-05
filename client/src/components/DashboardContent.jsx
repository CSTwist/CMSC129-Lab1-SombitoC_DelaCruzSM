import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Modal, Button, Form } from 'react-bootstrap';
import '../styles/DashboardContent.css';
import JournalEntry from '../components/JournalEntry.jsx';

// --- IMPORT REACT QUILL ---
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Standard rich text theme

function DashboardContent({ user, searchQuery }) {
    const [journals, setJournals] = useState([]);
    const [username, setUsername] = useState("");
    

    // --- EDIT STATE ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [editEntryId, setEditEntryId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");

    const navigate = useNavigate();

    // Filter the journals based on the search query
    const filteredJournals = journals.filter((journal) => {
        if (!searchQuery) return true; // Show all if query is empty
        
        const lowerCaseQuery = searchQuery.toLowerCase();
        const plainTextContent = (journal.content || "").replace(/<[^>]+>/g, '').toLowerCase(); // Strip HTML tags for searching
        
        return (
            (journal.title && journal.title.toLowerCase().includes(lowerCaseQuery)) ||
            plainTextContent.includes(lowerCaseQuery)
        );
    });

    // 1. Fetch User Profile
    useEffect(() => {
        if (!user) return;
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/users/${user.uid}`);
                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            }
        };
        fetchUserProfile();
    }, [user]);

    const fetchJournals = async () => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.uid}/journals`);
            const data = await response.json();
            
            // --- ADD THIS CHECK ---
            if (response.ok && Array.isArray(data)) {
                setJournals(data);
            } else {
                console.error("Backend error or invalid data format:", data);
                setJournals([]); // Fallback to empty array to prevent crashing
            }
        } catch (error) {
            console.error("Error fetching journals", error);
            setJournals([]); // Fallback to empty array on network error
        }
    };

    useEffect(() => {
        fetchJournals();
    }, [user]);

    // 3. Save a new Journal
    const handleSaveJournal = async () => {
        // Strip HTML tags to ensure the entry isn't just empty spaces
        const plainTextContent = content.replace(/<[^>]+>/g, '');
        if (!title.trim() || !plainTextContent.trim()) return;
        
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
                fetchJournals(); 
            }
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    // 4. Delete a Journal
    const handleDeleteJournal = async (journalId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.uid}/journals/${journalId}`, {
                method: 'DELETE'
            });
            if (response.ok) fetchJournals(); 
        } catch (e) {
            console.error("Error deleting document: ", e);
        }
    };

    // --- TRIGGER EDIT MODAL ---
    const handleEditClick = (entry) => {
        setEditEntryId(entry.id);
        setEditTitle(entry.title);
        // React Quill seamlessly handles both older plain text and new HTML!
        setEditContent(entry.content || ""); 
        setShowEditModal(true);
    };

    // --- SAVE EDITS ---
    const handleUpdateJournal = async () => {
        if (!editTitle.trim()) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.uid}/journals/${editEntryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle, content: editContent })
            });
            
            if (response.ok) {
                setShowEditModal(false);
                fetchJournals(); 
            }
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    return (
        <Container className="dashboard-content d-flex flex-column align-items-center min-vh-100">
            <p id="dashboard-greetings">How was your day, {username || 'friend'}?</p>
            
            <button
            className="add-journal btn btn-primary d-flex align-items-center justify-content-center gap-2 rounded-4"
            onClick={() => navigate('/add-journal')}
            >
            <i className="bi bi-plus-square"></i> New entry
            </button>

            {filteredJournals.length === 0 ? (
                <div style={{color: 'white', marginTop: '20px'}}>
                    {journals.length === 0 ? "No journal entries yet. Start writing!" : "No journal entries match your search."}
                </div>
            ) : (
                filteredJournals.map(journal => (
                    <JournalEntry 
                        key={journal.id} 
                        entry={journal} 
                        onEdit={handleEditClick} 
                        onDelete={handleDeleteJournal} 
                    />
                ))
            )}

            {/* EDIT ENTRY MODAL */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Journal Entry</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Control className="edit-form-control" type="text" placeholder="Entry Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Content</Form.Label>
                            {/* REACT QUILL EDITOR */}
                            <div style={{ backgroundColor: 'white', color: 'black', borderRadius: '4px' }}>
                                <ReactQuill theme="snow" value={editContent} onChange={setEditContent} style={{ height: '250px', marginBottom: '45px' }} />
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleUpdateJournal}>Update Entry</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default DashboardContent;