import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import '../styles/JournalKebabMenu.css';

// Custom Kebab Toggle component
const KebabToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    className="kebab-toggle"
  >
    {children}
  </a>
));

// Kebab Menu component: accept the onDelete prop
function KebabMenu({ onEdit, onDelete }) {
  return (
    <Dropdown>
      <Dropdown.Toggle as={KebabToggle} id="dropdown-kebab">
        &#x22EE;
      </Dropdown.Toggle>

      <Dropdown.Menu align="end">
        <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
        <Dropdown.Item onClick={onDelete} className="text-danger">Delete</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default KebabMenu;