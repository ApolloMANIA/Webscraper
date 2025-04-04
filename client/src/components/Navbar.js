import React from 'react';
import './Navbar.css'; // Ensure the CSS file is imported

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">WebPageScraper</div>
            <ul className="navbar-links">
                <li><a href="/" className="nav-link">Home</a></li>
                <li><a href="/about" className="nav-link">About</a></li>
                <li><a href="/contact" className="nav-link">Contact</a></li>
            </ul>
        </nav>
    );
}

export default Navbar;
