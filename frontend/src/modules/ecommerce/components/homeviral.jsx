import React, { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HomeViral() {
    const [viralProducts, setViralProducts] = useState([]);

    const navigate = useNavigate();

    const handleWhishlist = () => {
        alert("Item added to wishlist");
    };

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/viral-products")
            .then(res => setViralProducts(res.data))
            .catch(err => console.error(err));
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
        <div className="min-h-screen bg-white px-4 py-4">
            <div className="w-full mx-auto">

                {/* Viral Section */}
                <div className="section-wrapper px-2 sm:px-6 lg:px-10">
                    <h2 className="text-2xl font-semibold mb-6">
                     Top Selling Products
                    </h2>

                    {/* ✅ 5 Column Responsive Grid */}
                    <div className=" px-2 sm:px-6 lg:px-10
                        grid 
                        grid-cols-2 
                        sm:grid-cols-3 
                        md:grid-cols-4 
                        lg:grid-cols-5 
                        gap-4 sm:gap-5 md:gap-6
                    ">
                        {viralProducts.map((item, index) => (
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
    );
}

export default HomeViral;