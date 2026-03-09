import React, { useState, useEffect } from 'react';
import { FaStar, FaHeart } from "react-icons/fa";
import MemberModal from "../components/membermodal";

function AllProducts() {

    const [showModal, setShowModal] = useState(false);
    const [current, setCurrent] = useState(0);
    const images = [
        "/images/ecom/Banner2.png",
        "https://images.unsplash.com/photo-1520975916090-3105956dac38",
        "/images/ecom/Banner2.png",
        "https://images.unsplash.com/photo-1520975916090-3105956dac38",
        "/images/ecom/Banner2.png",
        "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 5000); // 3 seconds

        return () => clearInterval(timer);
    }, [images.length]);

    const viralProducts = [
        {
            brand: "WishCare",
            title: "Wishcare Hair Growth Serum Concentrate. In-Vivo",
            price: "₹679",
            oldPrice: "₹999",
            discount: "32% Off",
            image: "/images/ecom/vproduct1.jpg",
        },
        {
            brand: "WishCare",
            title: "Beauty of Joseon Relief Sun Aqua-fresh",
            price: "₹1275",
            oldPrice: "₹1500",
            discount: "15% Off",
            image: "/images/ecom/vproduct2.jpg",
        },
        {
            brand: "Beauty of Joseon",
            title: "Relief Sun Aqua-fresh Rice + B5 Korean",
            price: "₹1275",
            oldPrice: "₹1500",
            discount: "15% Off",
            image: "/images/ecom/vproduct3.jpg",
        },
        {
            brand: "Beauty of Joseon",
            title: "Relief Sun Aqua-fresh Rice + B5 Korean",
            price: "₹1275",
            oldPrice: "₹1500",
            discount: "15% Off",
            image: "/images/ecom/vproduct4.jpg",
        },
        {
            brand: "WishCare",
            title: "Wishcare Hair Growth Serum Concentrate. In-Vivo",
            price: "₹679",
            oldPrice: "₹999",
            discount: "32% Off",
            image: "/images/ecom/vproduct1.jpg",
        },
        {
            brand: "WishCare",
            title: "Beauty of Joseon Relief Sun Aqua-fresh",
            price: "₹1275",
            oldPrice: "₹1500",
            discount: "15% Off",
            image: "/images/ecom/vproduct2.jpg",
        },
        {
            brand: "Beauty of Joseon",
            title: "Relief Sun Aqua-fresh Rice + B5 Korean",
            price: "₹1275",
            oldPrice: "₹1500",
            discount: "15% Off",
            image: "/images/ecom/vproduct3.jpg",
        },
    ];

    return (
        <div className="min-h-screen bg-white px-4 py-4">
            <div className="W-full mx-auto">
                <nav className="flex gap-9 text-gray-700 mb-4 text-sm font-medium justify-start ml-2 ">
                    <a href="#" className="cursor-pointer hover:text-blue-600">What's New</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Health Care</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Skin Care</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Personal Care</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Beauty Care</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Home Care</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Oral Care</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Child Care</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Agri Care</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Life Care</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Minis</a>
                    <a href="#" className="cursor-pointer hover:text-blue-600">Homegrown</a>
                </nav>

                <div className="bg-blue-100 rounded-t-lg text-center text-sm py-2">
                    Enjoy up to ₹2000 off. Use code:{" "}
                    <span className="font-semibold">BIGSALE26</span>
                </div>

                <div>
                    <div className="relative rounded-b-lg overflow-hidden">
                        <img
                            src={images[current]}
                            alt="Sale"
                            className="w-full h-120 object-cover transition-all duration-700"
                        />
                    </div>
                </div>
{/* All Product Section */}
                <div className="px-6 mt-4">
                    <h2 className="text-2xl font-semibold  mb-8">
                        Viral Hits You'll Love
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                        {viralProducts.map((product, index) => (
                            <div
                                key={index}
                                className="flex flex-col group cursor-pointer"
                            >
                                <div className="relative rounded overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <FaHeart className="absolute top-3 right-3 text-gray-300 text-sm cursor-pointer" />
                                </div>

                                <div className="mt-3">
                                    <div className="flex items-center gap-2 mb-1 text-sm">
                                        <p className="font-medium text-gray-400">
                                            {product.brand}
                                        </p>
                                        <FaStar className="text-green-600 text-xs ml-3" />
                                        <span className="font-medium text-gray-700">4.4</span>
                                        <span className="text-gray-500 text-xs">| 2.8K</span>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-2 font-semibold leading-tight line-clamp-2">
                                        {product.title}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                        {product.price}
                                        <span className="text-xs text-gray-400 line-through font-normal">
                                            {product.oldPrice}
                                        </span>
                                        <span className="text-xs text-green-600 font-medium">
                                            ({product.discount})
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="mt-3 bg-black text-white text-sm py-2 rounded
                                            opacity-0 translate-y-2
                                            group-hover:opacity-100 group-hover:translate-y-0
                                            transition-all duration-300"
                                    onClick={() => setShowModal(true)}
                                >
                                    Add to Bag
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
{/* Member Modal */}                
                <MemberModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                />

            </div>
        </div>

    )
}


export default AllProducts;