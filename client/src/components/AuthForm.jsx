import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import '../styles/AuthForm.css';
import logoImg from '../assets/logo.png';

// Firebase
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function AuthForm({ form }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (form === "signup") {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match. Try again.");
                }
                
                // 1. Create User in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                
                // 2. Save Username to Firestore Database (Users Collection)
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    username: formData.username,
                    email: formData.email,
                    createdAt: Date.now()
                });
                
            } else {
                // Login existing user
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
            }
            navigate('/dashboard'); // Go to dashboard on success
        } catch (err) {
            setError(err.message.replace("Firebase: ", "")); // Clean up Firebase error string
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="auth-container vh-100">
            <Row className="h-100 m-0">
                <Col md={6} className="bg-image d-none d-md-block p-0"> </Col>
                <Col xs={12} md={6} className="auth-form-panel d-flex align-items-center justify-content-center">
                    <div className="auth-content-wrapper p-0 w-100">
                        <div className='auth-right d-flex align-items-center mb-4'>
                            <div className='logo me-3'> 
                                <img src={logoImg} alt="The Journal Logo" className="header-logo-img" />
                            </div> 
                            <h1 className='auth-title-header m-0'>The Journal</h1>
                        </div>

                        <Form onSubmit={handleSubmit} className="auth-form">
                            <h2 className="auth-header mb-0">{form === "login" ? "Welcome back!" : "Create an account"}</h2>
                            <p className="auth-subtitle mb-4">{form === "login" ? "Let's get you signed in." : 'Start your journaling journey.'}</p>

                            {error && <Alert variant="danger">{error}</Alert>}

                            {form === "signup" && (
                                <Form.Group className='form-group mb-2'>
                                    <Form.Control type='text' name='username' placeholder='Username' value={formData.username} onChange={handleChange} required />
                                </Form.Group>
                            )}

                            <Form.Group className='form-group mb-2'>
                                <Form.Control type='email' name='email' placeholder='Email' value={formData.email} onChange={handleChange} required />
                            </Form.Group>

                            <Form.Group className='form-group mb-3'>
                                <Form.Control type='password' name='password' placeholder='Password' value={formData.password} onChange={handleChange} required />
                            </Form.Group>

                            {form === "signup" && (
                                <Form.Group className='form-group mb-3'>
                                    <Form.Control type='password' name='confirmPassword' placeholder='Confirm Password' value={formData.confirmPassword} onChange={handleChange} required />
                                </Form.Group>
                            )}

                             {form === "login" && <p className="forgot-psd mb-4">Forgot password?</p>}

                            <Button variant='primary' type='submit' className="w-100 mt-5 py-2 auth-btn" disabled={loading}>
                                {loading ? "Processing..." : (form === "login" ? "Log in" : "Sign up")}
                            </Button>

                            {form === "signup" ? (
                                <div className='text-center mt-4'>
                                    Already have an account? <a href="/login" className='auth-link'>Log in</a>
                                </div>
                            ) : (
                                <div className='text-center mt-4'>
                                    Don't have an account? <a href="/signup" className='auth-link'>Sign up</a>
                                </div>
                            )}
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default AuthForm;