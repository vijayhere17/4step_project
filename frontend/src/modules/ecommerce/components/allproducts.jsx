import React, { useState, useEffect } from 'react';
import { FaStar, FaHeart } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AllProducts() {

    
    const [current, setCurrent] = useState(0);
    const images = [
        "./images/ecom/Banner2.png",
        "./images/ecom/Banner.jpg",
        "./images/ecom/Banner2.png",
        "./images/ecom/Banner.jpg",
        "./images/ecom/Banner2.png",
        "./images/ecom/Banner.jpg",
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 5000); // 3 seconds

        return () => clearInterval(timer);
    }, [images.length]);

    const [Products, setProducts] = useState([]);

    const navigate = useNavigate();

    const handleWhishlist = () => {
        alert("Item added to wishlist");
    };

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/products")
            .then(res => setProducts(res.data));
    }, []);

    const handleAddToBag = (item) => {
        const cartData = {
            ...item,
            qty: 1 // default qty
        };

        localStorage.setItem("cartProduct", JSON.stringify(cartData));

        navigate("/checkout"); // ✅
    };

    return (
        <div className="min-h-screen bg-white px-3 sm:px-4 md:px-6 py-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-blue-100 rounded-t-lg text-center text-xs sm:text-sm py-3 px-3">
                    Enjoy up to ₹2000 off. Use code:{" "}
                    <span className="font-semibold">BIGSALE26</span>
                </div>

                <div>
                    <div className="relative rounded-b-lg overflow-hidden">
                        <img
                            src={images[current]}
                            alt="Sale"
                            className="w-full h-48 sm:h-80 lg:h-120 object-contain sm:object-cover transition-all duration-700"
                        />
                    </div>
                </div>
                <div className="section-wrapper mt-8 sm:mt-10 ">
                                    <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
                                     Products
                                    </h2>
                
                                    {/* ✅ 5 Column Responsive Grid */}
                                    <div className=" px-0 sm:px-4 md:px-6
                                        grid 
                                        grid-cols-2 
                                        sm:grid-cols-3 
                                        md:grid-cols-4 
                                        lg:grid-cols-5 
                                        gap-4 sm:gap-5 md:gap-6
                                    ">
                                        {Products.map((item, index) => (
                                            <div key={index} className="flex flex-col group cursor-pointer">
                
                                                {/* Image */}
                                                <div className="relative rounded overflow-hidden bg-white">
                                                   <img
                  src={item.image}
                  alt="Product"
                  onClick={() => navigate(`/product/${item.id}`)} // ✅ added
                  className="w-full h-32 sm:h-36 md:h-40 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                                                    <FaHeart
                                                        className="absolute top-2 right-2 text-gray-300 text-xs sm:text-sm cursor-pointer"
                                                        onClick={handleWhishlist}
                                                    />
                                                </div>
                
                                                {/* Content */}
                                                <div className="mt-2 sm:mt-3">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-400">
                                                        {item.brand}
                                                    </p>
                
                                                    <p className="text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2 font-semibold leading-tight line-clamp-2">
                                                        {item.name}
                                                    </p>
                
                                                    <div className="text-xs sm:text-sm font-semibold text-gray-800">
                                                        ₹{item.price}
                                                    </div>
                                                </div>
                
                                                {/* Button */}
                                                <button
                                                    className="
                                                    mt-2 sm:mt-3 
                                                    bg-black text-white 
                                                    text-xs sm:text-sm 
                                                    py-1.5 sm:py-2 
                                                    rounded
                
                                                    opacity-100 sm:opacity-0
                                                    translate-y-0 sm:translate-y-2
                
                                                    sm:group-hover:opacity-100 
                                                    sm:group-hover:translate-y-0
                
                                                    transition-all duration-300"
                                                    onClick={() => handleAddToBag(item)}
                                                >
                                                    Add to Bag
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                
                                </div>
                

            </div>
        </div>

    )
}


export default AllProducts;