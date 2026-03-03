import React from 'react';
import Header from '../components/Header.jsx';
import DashboardContent from '../components/DashboardContent.jsx';

function DashboardPage() {

        return (
            <div className='dashboard-container'>
                <Header />
                <DashboardContent/>
            </div>
        )
}

export default DashboardPage