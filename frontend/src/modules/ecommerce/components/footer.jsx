import React from "react";
import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#0e1b2a] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
    
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
           <Link to='/home'>
            <img 
              src="./images/ecom/4steplogo.png"
              alt="4step"
              className="h-12 sm:h-15 mb-4"
            />
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 mb-6">
              Result-oriented products designed to enhance
              every aspect of your daily life.
            </p>

            <div className="flex gap-4">
              <div className="text-xl text-white hover:text-gray-400 cursor-pointer">
                <FaInstagram />
              </div>
              <div className="text-xl text-white hover:text-gray-400 cursor-pointer">
                <FaFacebookF />
              </div>
              <div className="text-xl text-white hover:text-gray-400 cursor-pointer">
                <FaTwitter />
              </div>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2 md:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">              
              <div>
                <h4 className="text-white font-semibold mb-4 text-xs sm:text-sm">Company</h4>
                <nav className="flex flex-col space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <Link to='/home' className="hover:text-white cursor-pointer">Home</Link>
                  <Link to='/allproduct' className="hover:text-white cursor-pointer">Products</Link>
                  <Link to='/helpform' className="hover:text-white cursor-pointer">Contact</Link>
                </nav>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 text-xs sm:text-sm">Products</h4>
                <nav className="flex flex-col space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <a className="hover:text-white cursor-pointer">Health Care</a>
                  <a className="hover:text-white cursor-pointer">Personal Care</a>
                  <a className="hover:text-white cursor-pointer">Beauty Care</a>
                  <a className="hover:text-white cursor-pointer">Home Care</a>
                </nav>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 text-xs sm:text-sm">Support</h4>
                <nav className="flex flex-col space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <Link to='/login' className="hover:text-white cursor-pointer">Sign In</Link>
                  <Link to='/signup' className="hover:text-white cursor-pointer">Sign Up</Link>
                  <Link to='/helpform' className="hover:text-white cursor-pointer">Help Centre</Link>
                </nav>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 text-xs sm:text-sm">Customer Policies</h4>
                <nav className="flex flex-col space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <Link to='/terms' className="hover:text-white cursor-pointer">Terms & Conditions</Link>
                  <Link to='/returnpolicy' className="hover:text-white cursor-pointer">Return Policy</Link>
                  <Link to='/paymentterms' className="hover:text-white cursor-pointer">Payment Policy</Link>
                  <Link to='/shippingpolicy' className="hover:text-white cursor-pointer">Shipping & Delivery</Link>
                </nav>
              </div>

            </div>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-8 sm:mt-10 mb-6"></div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-300">
          <p>© 2026 4step. All rights reserved.</p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link to='/privacypolicy' className="hover:text-white cursor-pointer">
              Privacy Policy
            </Link>
            <Link to='/terms' className="hover:text-white cursor-pointer">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
