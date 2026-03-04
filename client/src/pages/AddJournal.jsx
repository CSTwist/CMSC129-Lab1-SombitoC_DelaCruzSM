import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import Header from '../components/Header.jsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function AddJournalPage({ user }) {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSaveJournal = async () => {
        const plainTextContent = content.replace(/<[^>]+>/g, '');
        if (!title.trim() || !plainTextContent.trim()) return;

        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.uid}/journals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                navigate('/dashboard'); // go back after saving
            }
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    return (
        <div className="dashboard-container">
            <Header />
            <Container className="mt-4 p-4 rounded-4 shadow-lg journal-form-container">
                <h2 className="journal-page-header">Dear Journal...</h2>

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Control
                            className='journal-title-input custom-theme-input'
                            type="text"
                            placeholder="Entry Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="theme-label">Content</Form.Label>
                        <div className="quill-theme-container">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                placeholder='Start writing here...'
                                style={{ height: '250px', marginBottom: '45px' }}
                            />
                        </div>
                    </Form.Group>

                    <div className="mt-3 d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={() => navigate('/dashboard')} className="px-4">
                            Cancel
                        </Button>
                        <Button variant="primary" className='save-entry-btn px-4' onClick={handleSaveJournal}>
                            Save Entry
                        </Button>
                    </div>
                </Form>
            </Container>
        </div>
    );
}

export default AddJournalPage;