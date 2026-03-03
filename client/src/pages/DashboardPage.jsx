// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import DashboardContent from '../components/DashboardContent.jsx';

function DashboardPage({ user }) {
    // State to hold the current search query
    const [searchQuery, setSearchQuery] = useState("");

    // Callback to update the search query
    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    return (
        <div className='dashboard-container'>
            <Header onSearch={handleSearch} />
            <DashboardContent user={user} searchQuery={searchQuery} />
        </div>
    )
}

export default DashboardPage;