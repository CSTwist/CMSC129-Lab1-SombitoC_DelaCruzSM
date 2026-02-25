import React from 'react';
import Header from '../components/Header.jsx';

function DashboardPage() {

        return (
            <div className='dashboard-container'>
                <Header />
                <div className='dashboard-content'>
                    <h2>Dashboard</h2>
                    <p>Welcome to your dashboard! Here you can view your journal entries and manage your account.</p>
                </div>
            </div>
        )
}

export default DashboardPage