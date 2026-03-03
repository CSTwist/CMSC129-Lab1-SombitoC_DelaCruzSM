import React from 'react';
import Header from '../components/Header.jsx';
import DashboardContent from '../components/DashboardContent.jsx';

function DashboardPage({ user }) {

        return (
            <div className='dashboard-container'>
                <Header />
                <DashboardContent user={user} />
            </div>
        )
}

export default DashboardPage