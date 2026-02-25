import React, { useState, useEffect, useRef } from "react";
import { GoVerified } from "react-icons/go";
import { FaShippingFast, FaHeart, FaStar } from "react-icons/fa";
import { TbTruckReturn } from "react-icons/tb";
import { GrUserExpert } from "react-icons/gr";
import MemberModal from "../components/membermodal";

function HomeTopShelf() {

    const [showModal, setShowModal] = useState(false);

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

    const handlesubmit = () => alert("Redirecting to 4step product Page");
    // const handleexplore = () => alert("Redirecting to Top Shelf Page");
    // const handlechat = () => alert("Redirecting to Chat Page");

    const products = [
        {
            image: "/images/ecom/4step1.jpg",
            brand: "WishCare",
            title: "Hair Growth Serum Concentrate",
            price: "₹679",
            oldPrice: "₹999",
            discount: "32% Off",
        },
        {
            image: "/images/ecom/4step2.jpg",
            brand: "Minimalist",
            title: "Vitamin C Serum 10%",
            price: "₹599",
            oldPrice: "₹699",
            discount: "14% Off",
        },
        {
            image: "/images/ecom/4step3.png",
            brand: "COSRX",
            title: "Snail 96 Mucin Essence",
            price: "₹1160",
            oldPrice: "₹1499",
            discount: "20% Off",
        },
        {
            image: "/images/ecom/4step4.jpg",
            brand: "Dot & Key",
            title: "Hydrating Moisturizer",
            price: "₹495",
            oldPrice: "₹650",
            discount: "24% Off",
        },
        {
            image: "/images/ecom/4step5.jpg",
            brand: "Inde Wild",
            title: "Champi Hair Oil",
            price: "₹717",
            oldPrice: "₹845",
            discount: "15% Off",
        },
        {
            image: "/images/ecom/4step2.jpg",
            brand: "Mamaearth",
            title: "Onion Hair Oil",
            price: "₹399",
            oldPrice: "₹499",
            discount: "20% Off",
        },
        
    ];

    return (
        <div className="min-h-screen bg-white px-4 py-4">
            <div className="w-full mx-auto">

{/*         TOP SHELF           */}
                <div className="px-6 relative">
                    <div className="relative rounded-lg overflow-hidden">
                        <img
                            src="/images/ecom/topshelf.jpg"
                            alt="Top Shelf"
                            className="w-full h-50 object-cover"
                        />
                    </div>

                    {/* <div className="absolute top-1/2 left-6 -translate-y-1/2 text-gray-700 ml-10">
                        <h2 className="text-4xl mb-2 tracking-widest">
                            TOP <strong>SHELF</strong>
                        </h2>
                        <p className="text-lg">
                            Beauty news, reviews and hot takes
                        </p>
                        <button
                            onClick={handleexplore}
                            className="mt-4 px-8 py-2 bg-white text-gray-700 rounded hover:bg-gray-100 font-semibold"
                        >
                            Explore Now
                        </button>
                    </div> */}
                </div>

{/*          ONLY ON 4STEP       */}
                <div className="section wrapper px-6">
                    <h2 className=" text-2xl font-semibold  mb-6 mt-4">
                        Only on 4Step
                        <button
                            onClick={handlesubmit}
                            className="text-sm font-semibold float-end hover:text-blue-600"
                        >
                            View All &gt;&gt;&gt;
                        </button>
                    </h2>

                    <div className=" relative">
                        {showLeft && (
                            <button
                                onClick={() => scroll(fourStepRef, "left")}
                                className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 
                             bg-white shadow-md rounded-full w-13 h-13 
                            flex items-center justify-center text-3xl"
                            >
                                ‹
                            </button>
                        )}

                        <div
                            ref={fourStepRef}
                            onScroll={handleScroll}
                            className="overflow-x-hidden overflow-y-hidden scroll-smooth"
                        >
                            <div className="grid grid-flow-col auto-cols-[240px] gap-2">
                                {products.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col group cursor-pointer"
                                    >
                                        <div className="relative rounded overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <FaHeart className="absolute top-3 right-1/5 text-gray-300 text-sm cursor-pointer" />
                                        </div>

                                        <div className="mt-3">
                                            <div className="flex items-center gap-2 mb-1 text-sm">
                                                <p className="font-medium text-gray-400">
                                                    {item.brand}
                                                </p>
                                                <FaStar className="text-green-600 text-xs ml-3" />
                                                <span className="font-medium text-gray-700">
                                                    4.4
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    | 2.8K
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-700 mb-2 font-semibold line-clamp-2">
                                                {item.title}
                                            </p>

                                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                                {item.price}
                                                <span className="text-xs text-gray-400 line-through font-normal">
                                                    {item.oldPrice}
                                                </span>
                                                <span className="text-xs text-green-600 font-medium">
                                                    ({item.discount})
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

                        {showRight && (
                            <button
                                onClick={() => scroll(fourStepRef, "right")}
                                className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 
                                  bg-white shadow-md rounded-full w-13 h-13 
                                flex items-center justify-center text-3xl"
                            >
                                ›
                            </button>
                        )}
                    </div>
                </div>
{/*         CHAT SECTION         */}
                <div className="px-6 relative mt-20">
                    <div className="relative rounded-lg overflow-hidden">
                        <img
                            src="/images/ecom/chatnow.jpg"
                            alt="Chat"
                            className="w-full h-50 object-cover"
                        />
                    </div>

                    {/* <div className="absolute top-1/2 left-6 -translate-y-1/2 text-gray-700 ml-10">
                        <p className="text-lg font-semibold">
                            Instant recommendations, powered <br />
                            by AI & our expert beauty advisors
                        </p>
                        <button
                            onClick={handlechat}
                            className="mt-4 px-8 py-2 bg-white text-gray-700 rounded hover:bg-gray-100 font-semibold"
                        >
                            Chat Now
                        </button>
                    </div> */}
                </div>

{/*         AUTHENTICATION SECTION         */}
                <div className="px-6 mt-20 bg-gray-100 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-6 py-10">
                        <div className="flex flex-col">
                            <GoVerified className="text-gray-700 text-2xl mb-4" />
                            <p className="font-semibold text-gray-700 mb-2">
                                100% Authentic
                            </p>
                            <p className="font-semibold text-sm text-gray-500">
                                All our products are directly sourced from brands
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <FaShippingFast className="text-gray-700 text-2xl mb-4" />
                            <p className="font-semibold text-gray-700 mb-2">
                                Free Shipping
                            </p>
                            <p className="font-semibold text-sm text-gray-500">
                                On all orders above $299
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <GrUserExpert className="text-gray-700 text-2xl mb-4" />
                            <p className="font-semibold text-gray-700 mb-2">
                                Certified Beauty Advisors
                            </p>
                            <p className="font-semibold text-sm text-gray-500">
                                Get expert consultations
                            </p>
                        </div>
                        <div className="flex flex-col">
                            <TbTruckReturn className="text-gray-700 text-3xl mb-3" />
                            <p className="font-semibold text-gray-700 mb-2">
                                Easy Returns
                            </p>
                            <p className="font-semibold text-sm text-gray-500">
                                Hassle-free pick-ups and refunds
                            </p>
                        </div>
                    </div>
                </div>
                
{/* Member Modal */}
                <MemberModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                />

            </div>
        </div>
    );
}

export default HomeTopShelf;
