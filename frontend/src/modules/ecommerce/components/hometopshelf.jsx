import React, { useState, useEffect, useRef } from "react";
import { GoVerified } from "react-icons/go";
import { FaShippingFast, FaHeart, FaStar } from "react-icons/fa";
import { TbTruckReturn } from "react-icons/tb";
import { GrUserExpert } from "react-icons/gr";
import axios from "axios";
import { useNavigate } from "react-router-dom";



function HomeTopShelf() {


    const fourStepRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const scroll = (ref, direction) => {
        const container = ref.current;
        if (!container) return;

        const scrollAmount = 300;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const handleScroll = () => {
        const container = fourStepRef.current;
        if (!container) return;

        const isAtStart = container.scrollLeft <= 0;
        const isAtEnd =
            container.scrollLeft + container.clientWidth >=
            container.scrollWidth - 5;

        setShowLeft(!isAtStart);
        setShowRight(!isAtEnd);
    };

    useEffect(() => {
        handleScroll();
    }, []);

    const handlesubmit = () => {
  navigate("/allproduct");
};

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
        <div className="min-h-screen bg-white px-3 sm:px-4 md:px-6 py-4">
            <div className="max-w-7xl mx-auto">

                {/*         TOP SHELF           */}
                <div className="px-0 sm:px-3 lg:px-6 relative">
                    <div className="relative overflow-hidden">
                        <img
                            src="./images/ecom/topshelf.jpg"
                            alt="Top Shelf"
                            className="w-full h-auto object-contain"
                        />
                    </div>
                </div>

                {/*          ONLY ON 4STEP       */}
                <div className="px-0 sm:px-3 lg:px-6">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 mt-6 sm:mt-8">
                        Trending Now
                        <button
                            onClick={handlesubmit}
                            className="text-xs sm:text-sm font-semibold float-end hover:text-blue-600"
                        >
                            View All &gt;&gt;&gt;
                        </button>
                    </h2>

                    <div className="relative">
                        {showLeft && (
                            <button
                                onClick={() => scroll(fourStepRef, "left")}
                                className=" sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 
                             bg-white shadow-md rounded-full w-10 sm:w-13 h-10 sm:h-13 
                            flex items-center justify-center text-2xl sm:text-3xl"
                            >
                                ‹
                            </button>
                        )}
                        <div
                            ref={fourStepRef}
                            onScroll={handleScroll}
                            className="overflow-x-hidden overflow-y-hidden scroll-smooth"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                                {viralProducts.slice(5, 10).map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col group cursor-pointer"
                                    >
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

                        {showRight && (
                            <button
                                onClick={() => scroll(fourStepRef, "right")}
                                className=" sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 
              bg-white shadow-md rounded-full w-10 sm:w-13 h-10 sm:h-13 
              flex items-center justify-center text-2xl sm:text-3xl"
                            >
                                ›
                            </button>
                        )}
                    </div>
                </div>

                {/*         CHAT SECTION         */}
                <div className="px-0 sm:px-3 lg:px-6 relative mt-8 sm:mt-12 lg:mt-20">
                    <div className="relative rounded-lg overflow-hidden">
                        <img
                            src="./images/ecom/chatnow.jpg"
                            alt="Chat"
                            className="w-full h-32 sm:h-48 lg:h-64 object-contain"
                        />
                    </div>
                </div>

                {/*         AUTHENTICATION SECTION         */}
                <div className="px-3 sm:px-6 lg:px-8 mt-8 sm:mt-12 lg:mt-20 bg-gray-100 rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-3 sm:px-6 py-6 sm:py-10">

                        {/* 100% Authentic */}
                        <div className="flex flex-col">
                            <GoVerified className="text-gray-700 text-lg sm:text-2xl mb-3 sm:mb-4" />
                            <p className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                                100% Authentic
                            </p>
                            <p className="font-semibold text-xs sm:text-sm text-gray-500">
                                All our products are directly sourced from brands
                            </p>
                        </div>

                        {/* Free Shipping */}
                        <div className="flex flex-col">
                            <FaShippingFast className="text-gray-700 text-lg sm:text-2xl mb-3 sm:mb-4" />
                            <p className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                                Free Shipping
                            </p>
                            <p className="font-semibold text-xs sm:text-sm text-gray-500">
                                On all orders above $299
                            </p>
                        </div>

                        {/* Certified Advisors */}
                        <div className="flex flex-col">
                            <GrUserExpert className="text-gray-700 text-lg sm:text-2xl mb-3 sm:mb-4" />
                            <p className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                                Certified Beauty Advisors
                            </p>
                            <p className="font-semibold text-xs sm:text-sm text-gray-500">
                                Get expert consultations
                            </p>
                        </div>

                        {/* Easy Returns */}
                        <div className="flex flex-col">
                            <TbTruckReturn className="text-gray-700 text-lg sm:text-2xl mb-3 sm:mb-4" />
                            <p className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                                Easy Returns
                            </p>
                            <p className="font-semibold text-xs sm:text-sm text-gray-500">
                                Hassle-free pick-ups and refunds
                            </p>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}

export default HomeTopShelf;
