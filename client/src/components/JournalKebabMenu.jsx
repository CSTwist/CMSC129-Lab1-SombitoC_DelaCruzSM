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
    // Add some basic styling for the three dots
    style={{ cursor: 'pointer', textDecoration: 'none', color: 'white' }}
  >
    {children}
  </a>
));

// Kebab Menu component
function KebabMenu() {
  return (
    <Dropdown>
      {/* Using the vertical ellipsis character as the icon */}
      <Dropdown.Toggle as={KebabToggle} id="dropdown-kebab">
        &#x22EE; {/* Vertical ellipsis character */}
      </Dropdown.Toggle>

      <Dropdown.Menu align="end"> {/* Align right for better positioning */}
        <Dropdown.Item href="#/action-1">Edit</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Delete</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default KebabMenu;
