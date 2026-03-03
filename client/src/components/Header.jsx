import React from 'react';
import SearchBar from './SearchBar';
import ProfileButton from './ProfileButton';        
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Header.css';

function Header() {
    return (
        
        <header className='header-container d-flex align-items-center px-4 justify-content-between'>

            {/* LOGO + TITLE CONTAINER */}
            <div className='logo-title-container d-flex align-items-center'>
                <div className='logo me-3'> </div>
                                
                <h1 className='title-header m-0'>The Journal</h1>
            </div>
            
            <div className='header-actions d-flex align-items-center gap-3'>
                <SearchBar />
                <ProfileButton />
            </div>

        </header>
    );
}

export default Header