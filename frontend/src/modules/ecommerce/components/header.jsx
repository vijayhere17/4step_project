import React from 'react'
import { CgProfile } from "react-icons/cg";
import { RiShoppingBagLine } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";
import { Link } from 'react-router-dom';


function Header() {

    
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-300 bg-white">
            <div className="w-full mx-auto px-6">

                <div className="hidden md:flex justify-end gap-2 text-sm text-gray-700 py-2 font-medium">
                    <a href="#" className="hover:text-blue-600">Track Order</a>
                    <span>|</span>
                    <a href="#" className="hover:text-blue-600">Help Centre</a>
                </div>

                <div className="flex items-center justify-between h-16">

                    <img
                        src="/images/ecom/4steplogo.png"
                        alt="4step"
                        className="h-15 w-auto"
                    />

                    <div className="text-sm font-medium text-gray-700 mr-2">
                        <p>Welcome</p> 
                        <Link to="/" className=" hover:text-blue-600">Sign In </Link>
                        <span>/</span>
                        <Link to="/signup"  className=" hover:text-blue-600 ml-1">Register</Link>
                    </div>


                    <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-700">
                        <Link   to="/home" className="hover:text-blue-600">Home</Link> 
                        <a href="#" className="hover:text-blue-600">About</a>
                        <a href="#" className="hover:text-blue-600">Opportunity</a>
                        <Link to="/allproduct" className="hover:text-blue-600">All Products</Link>
                        <Link  to="/product" href="#" className="hover:text-blue-600">Products</Link>
                        <Link  to="/helpform" className="hover:text-blue-600">Contact</Link> 
                    </nav>

                    <div className="hidden md:flex items-center border border-gray-300  bg-gray-100  rounded-lg px-3 py-1 gap-2">
                        <button
                            className="text-sm font-semibold hover:text-blue-600"
                        >
                            <FaSearch />
                        </button>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="outline-none text-sm px-2 py-1 bg-transparent"
                        />
                    </div>


                    <div className="hidden md:flex">
                        <Link  to="/checkout" 
                            className="bg-gray-100 p-2 rounded-lg text-xl text-gray-700 hover:text-blue-600">
                           
                            <RiShoppingBagLine />
                        </Link>
                        <a
                            href="#"
                            className="bg-gray-100 p-2 ml-2 rounded-lg text-xl text-gray-700 hover:text-blue-600"
                        >
                            <CgProfile />
                        </a>
                    </div>
                </div>
                
            </div>
        </header>
    );
}

export default Header;
