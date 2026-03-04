import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsSearch } from 'react-icons/bs';
import '../styles/SearchBar.css';

function SearchBar({ onSearch }) {
    const [query, setSearch] = useState("");

    const handleChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (onSearch) {
            onSearch(value); // trigger search immediately
        }
    };

    return (
        <Form className="search-bar d-flex align-items-center">
            <InputGroup className='search-input'>
                <InputGroup.Text className='search-icon-wrapper'>
                    <BsSearch className='search-icon' />
                </InputGroup.Text>

                <Form.Control
                    className='search-input-field'
                    type="text"
                    placeholder="Search entries..."
                    value={query}
                    onChange={handleChange}
                />
            </InputGroup>
        </Form>
    )
}

export default SearchBar;