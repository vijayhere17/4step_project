import React from "react";
import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#0e1b2a] text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-14">
    
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <img
              src="/images/ecom/4steplogo.png"
              alt="4step"
              className="h-15 mb-4"
            />
            <p className="text-sm text-gray-400 mb-6">
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

          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-4  md:justify-items-center">              
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <nav className="flex flex-col space-y-3 text-sm">
                  <Link to='/home' className="hover:text-white cursor-pointer">Home</Link>
                  <Link to='/allproduct' className="hover:text-white cursor-pointer">Products</Link>
                  <Link to='/helpform' className="hover:text-white cursor-pointer">Contact</Link>
                </nav>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Products</h4>
                <nav className="flex flex-col space-y-3 text-sm">
                  <a className="hover:text-white cursor-pointer">Health Care</a>
                  <a className="hover:text-white cursor-pointer">Personal Care</a>
                  <a className="hover:text-white cursor-pointer">Beauty Care</a>
                  <a className="hover:text-white cursor-pointer">Home Care</a>
                </nav>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <nav className="flex flex-col space-y-3 text-sm">
                  <a className="hover:text-white cursor-pointer">Sign In</a>
                  <a className="hover:text-white cursor-pointer">Sign Up</a>
                  <a className="hover:text-white cursor-pointer">Help Centre</a>
                </nav>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Customer Policies</h4>
                <nav className="flex flex-col space-y-3 text-sm">
                  <a className="hover:text-white cursor-pointer">Terms & Conditions</a>
                  <a className="hover:text-white cursor-pointer">Fee & Payments</a>
                  <a className="hover:text-white cursor-pointer">Cancellation & Refund</a>
                  <a className="hover:text-white cursor-pointer">Shipping & Delivery</a>


                </nav>
              </div>

            </div>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-10 mb-6"></div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-300">
          <p>© 2026 4step. All rights reserved.</p>

          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-white cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
