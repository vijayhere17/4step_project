import React from "react";
import { GoVerified } from "react-icons/go";
import { FaShippingFast, FaHeart, FaStar } from "react-icons/fa";
import { TbTruckReturn } from "react-icons/tb";
import { GrUserExpert } from "react-icons/gr";
import MemberModal from "../components/membermodal";

function HomeTopShelf() {

    
    return (
        <div className="min-h-screen bg-white px-4 py-4">
            <div className="w-full mx-auto">

{/*         TOP SHELF           */}
                <div className="px-0 sm:px-6 relative">
                    <div className="relative rounded-lg overflow-hidden">
                        <img
                            src="./images/ecom/topshelf.jpg"
                            alt="Top Shelf"
                            className="w-full h-40 sm:h-50 object-contain sm:object-cover"
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


{/*         CHAT SECTION         */}
                <div className="px-0 sm:px-6 relative mt-10 sm:mt-20">
                    <div className="relative  overflow-hidden">
                        <img
                            src="./images/ecom/chatnow.jpg"
                            alt="Chat"
                            className="w-full h-40 sm:h-50 object-contain sm:object-cover"
                        />
                    </div>

                </div>

{/*         AUTHENTICATION SECTION         */}
                <div className="px-0 sm:px-6 mt-10 sm:mt-20 bg-gray-100 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-3 sm:px-6 py-6 sm:py-10">
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

            </div>
        </div>
    );
}

export default HomeTopShelf;
