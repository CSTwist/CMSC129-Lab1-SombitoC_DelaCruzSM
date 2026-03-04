import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Firebase imports
import { getAuth, signOut } from 'firebase/auth';

function ProfileButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Get the auth instance and sign the user out
      const auth = getAuth();
      await signOut(auth);
      // Redirects back to the login page
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <style>
        {`
          .dropdown-toggle::after {
            display: none !important;
          }
        `}
      </style>
      <Dropdown align="end">
        <Dropdown.Toggle
              variant="light"
              className="rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px" }}
          >
              👤
          </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item>Profile Settings</Dropdown.Item>
          <Dropdown.Item onClick={() => navigate('/trash')}>
            Trash
          </Dropdown.Item>
          
          <Dropdown.Item onClick={handleLogout} className="text-danger">
              Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}

export default ProfileButton;