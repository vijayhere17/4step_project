import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart } from "react-icons/fa";

function CategoryProducts() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState({});

    useEffect(() => {
        axios
            .get(`http://127.0.0.1:8000/api/products/category/${id}`)
            .then((res) => setProducts(res.data))
            .catch((err) => console.log(err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleWhishlist = (itemId) => {
        setWishlist((prev) => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleAddToBag = (item) => {
        const cartData = {
            ...item,
            qty: 1
        };

        localStorage.setItem("cartProduct", JSON.stringify(cartData));
        navigate("/checkout");
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Category Title */}
                <div className="mb-8  border-gray-200 pb-4 text-center">
                   <h2 className="text-2xl sm:text-3xl font-semibold text-blue-600 tracking-tight">
        {products[0]?.category_name || "Products"}
    </h2>
    <div className="flex items-center justify-center gap-2 mt-3">
        <span className="w-8 h-px bg-blue-600"></span>
        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
        <span className="w-8 h-px bg-blue-600"></span>
    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 rounded-lg h-40 sm:h-48 md:h-56"></div>
                                <div className="mt-3 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No products found</p>
                    </div>
                ) : (

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">

                        {products.map((item) => (
                            <div 
                                key={item.id} 
                                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                {/* Image */}
                                <div className="relative rounded-t-lg overflow-hidden bg-gray-50">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        onClick={() => navigate(`/product/${item.id}`)}
                                        className="w-full h-40 sm:h-48 md:h-56 object-contain p-4 cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                    />

                                    {/* Wishlist Icon */}
                                    <button
                                        onClick={() => handleWhishlist(item.id)}
                                        className={`
                                            absolute top-3 right-3 
                                            w-8 h-8 
                                            flex items-center justify-center
                                            rounded-full
                                            bg-white shadow-md
                                            transition-all duration-200
                                            hover:scale-110
                                            ${wishlist[item.id] ? "text-red-500" : "text-gray-300 hover:text-red-400"}
                                        `}
                                    >
                                        <FaHeart className="text-sm" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-3 sm:p-4">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                                        {item.brand}
                                    </p>

                                    <p 
                                        onClick={() => navigate(`/product/${item.id}`)}
                                        className="text-sm text-gray-800 mt-1 font-medium leading-tight line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                                    >
                                        {item.name}
                                    </p>

                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-base sm:text-lg font-bold text-gray-900">
                                            ₹{item.price?.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Button */}
                                    <button
                                        className="
                                            w-full mt-3
                                            bg-gray-900 text-white 
                                            text-xs sm:text-sm font-medium
                                            py-2 sm:py-2.5
                                            rounded-md
                                            
                                            opacity-100 sm:opacity-0
                                            translate-y-0 sm:translate-y-2
                                            
                                            sm:group-hover:opacity-100 
                                            sm:group-hover:translate-y-0
                                            
                                            hover:bg-gray-800
                                            transition-all duration-300
                                        "
                                        onClick={() => handleAddToBag(item)}
                                    >
                                        Add to Bag
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryProducts;