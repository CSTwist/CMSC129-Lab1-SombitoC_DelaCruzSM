import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Form, Container, Row, Col, Alert } from 'react-bootstrap';
import '../styles/AuthForm.css';

function AuthForm({ form, onSubmit }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        identifier: "", 
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (form === "signup") {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match. Try again.");
                return;
            }
        }
        setError("");
        onSubmit(formData);
    };

    return (
        <Container fluid className="auth-container vh-100">
            <Row className="h-100 m-0">
                
                {/* Left Side: Background Image */}
                <Col md={6} className="bg-image d-none d-md-block p-0"> </Col>
                
                {/* Right Side: Login/Signup form */}
                <Col xs={12} md={6} className="d-flex align-items-center justify-content-center">

                    <div className="auth-content-wrapper p-0 w-100">

                        {/* LOGO + TITLE CONTAINER */}
                        <div className='d-flex align-items-center mb-4'>
                                <div className='logo me-2'> </div>
                               
                                <h1 className='title-header m-0'>The Journal</h1>
                        </div>

                        <Form onSubmit={ handleSubmit } className="auth-form">
                            <h2 className="auth-header mb-0">{form === "login" ? "Welcome back!" : "Create an account"}</h2>
                            <p className="subtitle mb-4">{form === "login" ? "Let's get you signed in." : ''}</p>

                            {error && <Alert variant="danger">{error}</Alert>}

                            {form === "login" ? (
                                <Form.Group className='form-group mb-2'>
                                    <Form.Control 
                                        type='text'
                                        name='identifier'
                                        placeholder='Email or username'
                                        value={formData.identifier}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            ) : ( 
                                // if form === "signup"
                                <>
                                    <Form.Group className='form-group mb-2'>
                                        <Form.Control 
                                            className='form-control'
                                            type='text'
                                            name='username'
                                            placeholder='Username'
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className='form-group mb-2'>
                                        <Form.Control 
                                            className='form-control'
                                            type='email'
                                            name='email'
                                            placeholder='Email'
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </>
                            )}

                            <Form.Group className='form-group mb-3'>
                                <Form.Control 
                                    className='form-control'
                                    type='password'
                                    name='password'
                                    placeholder='Password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            {form === "signup" && (
                                <Form.Group className='form-group mb-3'>
                                    <Form.Control 
                                        className='form-control'
                                        type='password'
                                        name='confirmPassword'
                                        placeholder='Confirm Password'
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            )}

                             <p className="forgot-psd mb-4">Forgot password?</p>


                            <Button variant='primary' type='submit' className="w-100 mt-5 py-2 auth-btn">
                                {form === "login" ? "Log in" : "Sign up"}
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