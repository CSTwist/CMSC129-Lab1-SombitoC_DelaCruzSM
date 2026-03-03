import React from 'react';
import Header from '../components/Header.jsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function DashboardPage({ user }) {

        return (
            <div className='dashboard-container'>
                <Header />
                <div style={{ backgroundColor: 'white', color: 'black', borderRadius: '4px' }}>
                    <ReactQuill theme="snow" value={editContent} onChange={setEditContent} style={{ height: '250px', marginBottom: '45px' }} />
                </div>
            </div>
        )
}

export default DashboardPage