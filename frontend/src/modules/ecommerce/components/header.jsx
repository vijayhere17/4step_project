import React, { useState, useRef, useEffect } from 'react'
import { CgProfile } from "react-icons/cg";
import { RiShoppingBagLine } from "react-icons/ri";
import { FaSearch, FaUser, FaBox, FaTruck, FaSignOutAlt } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { Link, useLocation } from 'react-router-dom';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("user");
        setIsProfileOpen(false);
        // Add your logout logic here
        window.location.href = '/';
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main header */}
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <Link to='/home' className="shrink-0 transition-transform duration-200 hover:scale-105">
                        <img
                            src="./images/ecom/4steplogo.png"
                            alt="4step"
                            className="h-10 sm:h-14 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-6 lg:gap-10 text-sm font-medium text-gray-700 mx-8">
                        <Link to="/home" className="hover:text-blue-600 transition-colors duration-200 relative group py-1">
                            Home
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                        </Link>
                        <Link to="/allproduct" className="hover:text-blue-600 transition-colors duration-200 relative group py-1">
                            All Products
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                        </Link>
                        <Link to="/helpform" className="hover:text-blue-600 transition-colors duration-200 relative group py-1">
                            Contact
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
                        </Link>
                    </nav>

                    {/* Right section */}
                    <div className="hidden md:flex items-center gap-4 lg:gap-6">
                        {/* Search bar */}
                        <div className="flex items-center border border-gray-200 bg-gray-50 rounded-full px-4 py-2 gap-2 transition-all duration-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-md">
                            <FaSearch className="text-gray-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="outline-none text-sm px-2 py-0.5 bg-transparent w-40 lg:w-48 placeholder:text-gray-400"
                            />
                        </div>

                        {/* User info - only show if NOT logged in */}
                        {!user && (
                            <div className="text-xs font-medium text-gray-700 border-l border-gray-200 pl-4 lg:pl-6">
                                <div className="whitespace-nowrap">
                                    <p className="text-gray-500 mb-1">Welcome</p>
                                    <div className="flex items-center gap-1">
                                        <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">Sign In</Link>
                                        <span className="text-gray-400">/</span>
                                        <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">Register</Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Icons */}
                        <div className="flex gap-3 items-center">
                            <Link
                                to="/checkout"
                                className="relative bg-gray-50 p-2.5 rounded-full text-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <RiShoppingBagLine />
                                {/* Optional: Add cart count badge */}
                                {/* <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">3</span> */}
                            </Link>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={toggleProfile}
                                    className="bg-gray-50 p-2.5 rounded-full text-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <CgProfile />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-slideDown">
                                        {user ? (
                                            <>
                                                {/* User Info Header */}
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                            {user.fullname?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 text-sm">{user.fullname}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="py-2">
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <FaUser className="text-base" />
                                                        <span className="font-medium">My Profile</span>
                                                    </Link>

                                                    <Link
                                                        to="/orders"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <FaBox className="text-base" />
                                                        <span className="font-medium">My Orders</span>
                                                    </Link>

                                                    <Link
                                                        to="/track-order"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <FaTruck className="text-base" />
                                                        <span className="font-medium">Track Order</span>
                                                    </Link>

                                                    <hr className="my-2" />

                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                                    >
                                                        <FaSignOutAlt className="text-base" />
                                                        <span className="font-medium">Logout</span>
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="px-4 py-3">
                                                <p className="text-sm text-gray-600 mb-3">Please sign in to access your account</p>
                                                <Link
                                                    to="/"
                                                    className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    Sign In
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-2xl text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <HiX /> : <HiMenu />}
                    </button>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 py-4 animate-slideDown">
                        {/* Mobile Search */}
                        <div className="mb-4 px-3">
                            <div className="flex items-center border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 gap-2">
                                <FaSearch className="text-gray-400 text-sm" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="outline-none text-sm px-2 bg-transparent w-full placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col space-y-1 text-sm font-medium text-gray-700 px-3">
                            {/* User section */}
                            {user ? (
                                <div className="py-3 px-4 bg-linear-to-r from-blue-50 to-blue-100 rounded-lg mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {user.fullname?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Welcome back,</p>
                                            <p className="font-semibold text-gray-800">{user.fullname}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link to="/" className="hover:bg-gray-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200">
                                        Sign In
                                    </Link>
                                    <Link to="/signup" className="hover:bg-gray-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200">
                                        Register
                                    </Link>
                                    <hr className="my-2" />
                                </>
                            )}

                            {/* Navigation links */}
                            <Link to="/home" className="hover:bg-gray-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200">
                                Home
                            </Link>
                            {/* <a href="#" className="hover:bg-gray-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200">
                                About
                            </a>
                            <a href="#" className="hover:bg-gray-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200">
                                Opportunity
                            </a> */}
                            <Link to="/allproduct" className="hover:bg-gray-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200">
                                All Products
                            </Link>
                            {/* <Link to="/product" className="hover:bg-gray-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200">
                                Products
                            </Link> */}
                            <Link to="/helpform" className="hover:bg-gray-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200">
                                Contact
                            </Link>

                            <hr className="my-2" />

                            {/* User Menu Items (Mobile) */}
                            {user && (
                                <>
                                    <Link to="/profile" className="hover:bg-blue-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-3">
                                        <FaUser className="text-base" />
                                        <span>My Profile</span>
                                    </Link>
                                    <Link to="/orders" className="hover:bg-blue-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-3">
                                        <FaBox className="text-base" />
                                        <span>My Orders</span>
                                    </Link>
                                    <Link to="/track-order" className="hover:bg-blue-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-3">
                                        <FaTruck className="text-base" />
                                        <span>Track Order</span>
                                    </Link>
                                    <hr className="my-2" />
                                </>
                            )}

                            {/* Cart */}
                            <Link to="/checkout" className="hover:bg-blue-50 hover:text-blue-600 py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-3">
                                <RiShoppingBagLine className="text-lg" />
                                <span>Shopping Cart</span>
                            </Link>

                            {/* Logout (Mobile) */}
                            {user && (
                                <>
                                    <hr className="my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left hover:bg-red-50 hover:text-red-600 py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-3"
                                    >
                                        <FaSignOutAlt className="text-base" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </header>
    );
}

export default Header;