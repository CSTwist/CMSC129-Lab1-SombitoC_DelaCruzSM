import React from 'react';
import SearchBar from './SearchBar';
import ProfileButton from './ProfileButton';        
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Header.css';
import logoImg from '../assets/logo.png';

function Header({ onSearch }) {
    return (
        <header className='header-container d-flex align-items-center px-4 justify-content-between'>
            <div className='logo-title-container d-flex align-items-center'>
                {/* 2. Add the img tag inside the logo div */}
                <div className='logo me-3'> 
                    <img src={logoImg} alt="The Journal Logo" className="header-logo-img" />
                </div>                
                <h1 className='title-header m-0'>The Journal</h1>
            </div>
            
            <div className='header-actions d-flex align-items-center gap-3'>
                <SearchBar onSearch={onSearch} />
                <ProfileButton />
            </div>
        </header>
    );
}

export default Header;