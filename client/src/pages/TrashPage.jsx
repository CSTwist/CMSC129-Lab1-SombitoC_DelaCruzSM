import React, { useEffect, useState, useCallback } from 'react';
import { Button, Alert, Modal } from 'react-bootstrap';
import { IoTrashBin } from "react-icons/io5";
import JournalEntry from '../components/JournalEntry';
import Header from '../components/Header';
import '../styles/TrashPage.css';

// Text dictionaries for clean modal rendering
const CONFIRM_MESSAGES = {
    empty: "Are you sure you want to permanently delete all items in the trash? This action cannot be undone.",
    restore: "Are you sure you want to restore this journal entry?",
    delete: "Are you sure you want to permanently delete this journal entry? This action cannot be undone."
};

const SUCCESS_MESSAGES = {
    empty: "All trash has been permanently deleted.",
    restore: "Your journal entry has been restored successfully.",
    delete: "The journal entry was permanently deleted."
};

function TrashPage({ user }) {
    const [trashJournals, setTrashJournals] = useState([]);
    
    // Modal States
    const [confirmModal, setConfirmModal] = useState({ show: false, action: null, targetId: null });
    const [successModal, setSuccessModal] = useState({ show: false, action: null });

    // Helper for base URL
    const API_BASE = user ? `http://localhost:5000/api/users/${user.uid}` : '';

    // Wrapped in useCallback to prevent unnecessary re-renders
    const refreshTrash = useCallback(async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_BASE}/trash`);
            if (response.ok) {
                const data = await response.json();
                setTrashJournals(data);
            }
        } catch (error) {
            console.error("Error fetching trash:", error);
        }
    }, [user, API_BASE]);

    // Initialization Effect (Cleanup -> Fetch)
    useEffect(() => {
        if (!user) return;
        
        const initTrash = async () => {
            try {
                // 1. Run the 30-day cleanup first
                await fetch(`${API_BASE}/trash/cleanup`, { method: 'POST' });
                // 2. Fetch the newly cleaned list
                refreshTrash(); 
            } catch (error) {
                console.error("Error initializing trash:", error);
            }
        };

        initTrash();
    }, [user, API_BASE, refreshTrash]); 

    // --- MODAL TRIGGERS ---
    const closeConfirm = () => setConfirmModal({ show: false, action: null, targetId: null });
    const closeSuccess = () => setSuccessModal({ show: false, action: null });
    
    const requestEmptyTrash = () => setConfirmModal({ show: true, action: 'empty', targetId: null });
    const requestRestore = (id) => setConfirmModal({ show: true, action: 'restore', targetId: id });
    const requestDelete = (id) => setConfirmModal({ show: true, action: 'delete', targetId: id });

    // --- MODAL EXECUTION ---
    const executeAction = async () => {
        const { action, targetId } = confirmModal;
        if (!action) return;

        // Dynamically set endpoint and method based on action
        let endpoint = '';
        let method = '';

        switch (action) {
            case 'empty':
                endpoint = '/trash/empty';
                method = 'DELETE';
                break;
            case 'restore':
                endpoint = `/journals/${targetId}/restore`;
                method = 'PUT';
                break;
            case 'delete':
                endpoint = `/journals/${targetId}/permanent`;
                method = 'DELETE';
                break;
            default:
                return;
        }

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, { method });
            
            if (response.ok) {
                closeConfirm();
                setSuccessModal({ show: true, action });
                refreshTrash();
            }
        } catch (error) {
            console.error(`Error executing ${action}:`, error);
        }
    };

    return (
        <div className='trash-page-container'>
            <Header user={user} />

            <div className="trash-page-content mt-4 p-4">
                <h2 className="trash-header text-center mb-4">Trash</h2>

                {trashJournals.length > 0 && (
                    <Alert variant="light" className="banner d-flex justify-content-between align-items-center shadow-sm">
                        <span className='banner-text'>Entries that have been in Trash will be permanently deleted after 30 days.</span>
                        <Button className='empty-trash-btn' variant="danger" size="sm" onClick={requestEmptyTrash}>
                            Empty Trash now
                        </Button>
                    </Alert>
                )}

                {trashJournals.length === 0 ? (
                    <div className="empty-trash-container d-flex flex-column align-items-center justify-content-center">
                        <IoTrashBin className='trash-icon mb-2' />
                        <p className='trash-text mb-1'>Nothing in the trash</p>
                        <small className="trash-subtext mb-4">Recently deleted entries will appear here.</small>
                        <Button className="back-btn" onClick={() => window.history.back()}>Back to my journal entries</Button>
                    </div>
                ) : (
                    trashJournals.map(journal => (
                        <JournalEntry
                            key={journal.id}
                            entry={journal}
                            isTrash={true}
                            onRestore={requestRestore}
                            onPermanentDelete={requestDelete}
                        />
                    ))
                )}
            </div>

            {/* CONFIRMATION MODAL */}
            <Modal show={confirmModal.show} onHide={closeConfirm} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: 'var(--coffee)', fontFamily: '"IM Fell DW Pica", serif', fontStyle: 'italic' }}>
                        {confirmModal.action === 'restore' ? 'Restore Entry' : 'Confirm Deletion'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ color: 'var(--coffee)' }}>
                        {CONFIRM_MESSAGES[confirmModal.action]}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeConfirm}>
                        Cancel
                    </Button>
                    <Button 
                        variant={confirmModal.action === 'restore' ? 'success' : 'danger'} 
                        onClick={executeAction}
                    >
                        {confirmModal.action === 'restore' ? 'Yes, Restore' : 'Yes, Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* SUCCESS MODAL */}
            <Modal show={successModal.show} onHide={closeSuccess} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: 'var(--coffee)', fontFamily: '"IM Fell DW Pica", serif', fontStyle: 'italic' }}>
                        Success
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ color: 'var(--coffee)' }}>
                        {SUCCESS_MESSAGES[successModal.action]}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" style={{ backgroundColor: 'var(--coffee)', border: 'none' }} onClick={closeSuccess}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default TrashPage;