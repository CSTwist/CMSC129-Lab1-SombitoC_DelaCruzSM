import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Container, Modal, Toast, ToastContainer } from 'react-bootstrap';
import { updatePassword, signOut, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail, verifyBeforeUpdateEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

function ProfileForm({ user }) {
    const navigate = useNavigate();
    
    // Form States
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState(""); 
    const [newPassword, setNewPassword] = useState("");         
    const [originalUsername, setOriginalUsername] = useState(""); 
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showToast, setShowToast] = useState({ show: false, message: '' });

    // Fetch the current custom username on load
    useEffect(() => {
        if (user) {
            setEmail(user.email);
            fetch(`http://localhost:5000/api/users/${user.uid}`)
                .then(res => res.json())
                .then(data => {
                    setUsername(data.username || "");
                    setOriginalUsername(data.username || "");
                })
                .catch(err => console.error("Failed to fetch user:", err));
        }
    }, [user]);

    // Handle Forgot Password Email
    const handleForgotPassword = async () => {
        setMessage({ type: '', text: '' });
        try {
            await sendPasswordResetEmail(auth, user.email);
            setMessage({ type: 'success', text: `A password reset link has been sent to ${user.email}. Check your inbox!` });
        } catch (error) {
            console.error("Error sending reset email:", error);
            setMessage({ type: 'danger', text: "Failed to send reset email. Please try again later." });
        }
    };

    const handleRequestSubmit = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        
        if (username === originalUsername && email === user.email && !newPassword) {
            setMessage({ type: 'info', text: 'No changes have been made.' });
            return;
        }

        const isAuthChanged = (email !== user.email) || (newPassword.length > 0);
        if (isAuthChanged && !currentPassword) {
            setMessage({ type: 'danger', text: 'Please enter your Current Password to change your email or set a new password.' });
            return;
        }

        setShowConfirmModal(true); 
    };

    const executeUpdates = async () => {
        setShowConfirmModal(false);
        setLoading(true);

        const isAuthChanged = (email !== user.email) || (newPassword.length > 0);

        try {
            if (isAuthChanged) {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(auth.currentUser, credential);
                
                if (email !== user.email) {
                    await verifyBeforeUpdateEmail(auth.currentUser, email);
                }
                if (newPassword) {
                    await updatePassword(auth.currentUser, newPassword);
                }
            }

            if (username !== originalUsername || email !== user.email) {
                const response = await fetch(`http://localhost:5000/api/users/${user.uid}/profile`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email }) 
                });
                if (!response.ok) throw new Error("Failed to update database.");
            }

            if (isAuthChanged) {
                let toastMsg = "";
                
                if (email !== user.email && newPassword.length > 0) {
                    toastMsg = "Password changed & verification email sent! Logging out...";
                } else if (email !== user.email) {
                    toastMsg = `A verification link has been sent to ${email}! Please check your inbox.`;
                } else if (newPassword.length > 0) {
                    toastMsg = "Password changed successfully! Logging out for security...";
                }

                setShowToast({ show: true, message: toastMsg });
                
                if (newPassword.length > 0) {
                    setTimeout(async () => {
                        await signOut(auth);
                        navigate('/login');
                    }, 3000);
                } else {
                    setOriginalUsername(username); 
                    setCurrentPassword(""); 
                    setLoading(false);
                }

            } else {
                setMessage({ type: 'success', text: "Profile updated successfully!" });
                setOriginalUsername(username); 
                setCurrentPassword(""); 
                setNewPassword("");
                setLoading(false);
            }

        } catch (error) {
            console.error("Error updating profile:", error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                setMessage({ type: 'danger', text: 'Incorrect Current Password. Please try again.' });
            } else {
                setMessage({ type: 'danger', text: error.message || "An error occurred." });
            }
            setLoading(false);
        }
    };

    return (
        <Container className="profile-form-container mt-4">
            
            <h2 className="profile-page-header text-center mb-4">Profile Settings</h2>
            
            {message.text && <Alert variant={message.type}>{message.text}</Alert>}
            
            <Form onSubmit={handleRequestSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label className="profile-theme-label">Username</Form.Label>
                    <Form.Control className="profile-theme-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="profile-theme-label">Email Address</Form.Label>
                    <Form.Control className="profile-theme-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>

                <hr style={{ borderColor: 'var(--toffee-brown)', margin: '1.5rem 0', opacity: 0.3 }} />

                {/* Security Section */}
                <Form.Group className="mb-3">
                    <Form.Label className="profile-theme-label">Current Password</Form.Label>
                    <Form.Control className="profile-theme-input" type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    
                    <div className="d-flex justify-content-between mt-1">
                        <small className="profile-text-muted">Required to change email or password.</small>
                        <Button 
                            variant="link" 
                            className="p-0 text-decoration-none shadow-none profile-forgot-btn" 
                            onClick={handleForgotPassword}
                        >
                            Forgot password?
                        </Button>
                    </div>
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label className="profile-theme-label">New Password</Form.Label>
                    <Form.Control className="profile-theme-input" type="password" placeholder="Leave blank to keep current password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </Form.Group>

                <div className="d-flex gap-3 mt-4">
                    <Button 
                        variant="outline-secondary" 
                        className="w-50 py-2" 
                        onClick={() => navigate(-1)} // Navigates to the previous page
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading} 
                        className="profile-save-btn w-50 py-2"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </Form>

            {/* CONFIRMATION MODAL */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton style={{ backgroundColor: 'var(--tan)', borderBottom: '1px solid var(--toffee-brown)' }}>
                    <Modal.Title style={{ color: 'var(--coffee)', fontFamily: '"IM Fell DW Pica", serif', fontStyle: 'italic' }}>
                        Confirm Changes
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: 'var(--cream)', color: 'var(--coffee)', fontFamily: "'Montserrat', sans-serif" }}>
                    Are you sure you want to save these profile changes? 
                    {(email !== user?.email || newPassword.length > 0) && (
                        <strong><br/><br/>Note: Changing your password will log you out. Changing your email requires verification.</strong>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: 'var(--cream)', borderTop: 'none' }}>
                    <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        Cancel
                    </Button>
                    <Button style={{ backgroundColor: 'var(--coffee)', border: 'none', fontFamily: "'Montserrat', sans-serif" }} onClick={executeUpdates}>
                        Yes, Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* LOGOUT TOAST */}
            <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
                <Toast show={showToast.show} bg="success" delay={3000} autohide>
                    <Toast.Body className="text-white text-center fw-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        {showToast.message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
}

export default ProfileForm;