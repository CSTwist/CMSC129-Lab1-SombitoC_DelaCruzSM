import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

// Custom Kebab Toggle component
const KebabToggle = React.forwardRef(({ children, onClick }, ref) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    style={{ cursor: 'pointer', textDecoration: 'none', color: 'black' }}
  >
    {children}
  </a>
));

// Kebab Menu component: accept the onDelete prop
function KebabMenu({ onDelete }) {
  return (
    <Dropdown>
      <Dropdown.Toggle as={KebabToggle} id="dropdown-kebab">
        &#x22EE;
      </Dropdown.Toggle>

      <Dropdown.Menu align="end">
        <Dropdown.Item href="#/action-1">Edit</Dropdown.Item>
        {/* Attach the onDelete prop to the Delete dropdown item */}
        <Dropdown.Item onClick={onDelete} className="text-danger">Delete</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default KebabMenu;