import { Dropdown, Image } from 'react-bootstrap';
import '../styles/ProfileButton.css';

function ProfileButton() {
  return (
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
        <Dropdown.Item>Trash</Dropdown.Item>
        <Dropdown.Item>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ProfileButton