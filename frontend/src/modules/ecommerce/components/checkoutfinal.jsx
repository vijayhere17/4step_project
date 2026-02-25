import React from "react";
import { BiSolidCoupon } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";

function CheckoutFinal() {

    const mrp = 549;
    const discount = 55;
    const total = mrp - discount;

    return (
        <div className=" bg-white p-6">
            <div className="max-w-6xl mx-auto flex gap-6 items-start mt-10">
                <div className="flex-1 bg-gray-100 rounded shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">
                        Address
                    </h2>
                    <div className="mt-3">
                        <h5 className="text-gray-700 font-semibold">Swapnil Solanki</h5>
                        <p className="text-sm text-gray-700 font-semibold mt-2">
                            B/28,Bussa Society,Dahej by pass road,Bharuch,Gujarat,India,392001
                            B/28,Bussa Society,Dahej by pass road,Bharuch,Gujarat,India,392001
                        </p>
                        <p className="text-sm text-gray-500 font-semibold mt-2">
                            Mobile: +91 9876543210
                        </p>
                    </div>
                    <hr className="my-4 text-gray-500"></hr>
                    <div className="mt-3">
                        <h2 className="text-lg font-semibold mb-2 text-gray-700">
                            Estimated Delivery
                        </h2>
                        <p className="text-sm text-gray-500 font-semibold">
                            Shipment 1 of 1
                        </p>
                        <div className=" items-center gap-3 mt-4 bg-white p-4 rounded">
                            <p className="text-lg text-gray-700 font-semibold">
                                <TbTruckDelivery className="inline text-xl" /> Delivery by Sat, 07 Feb</p>
                            <div className="flex items-center gap-3 mt-4">
                                 <img
                                src="/images/ecom/product5.png"
                                alt="product"
                                className="w-30 h-30 rounded object-cover"
                            />
                            <div className="flex-1">
                                <h3 className="font-medium">NONI BODY LOTION</h3>

                            </div>  
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-80 bg-gray-100 rounded shadow-sm p-6">
                    <div>
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-700">
                                <BiSolidCoupon className="inline  text-xl" /> Coupons & Bank Offers</h3>
                            <p className="text-sm text-gray-700 font-semibold">
                                Login to Apply Coupons & Bank Offers
                            </p>
                        </div>

                        <hr className="my-4" />

                        <div className="mt-4">
                            <h4 className="font-semibold mb-3 text-gray-700">Price Details</h4>

                            <div className="text-sm font-semibold text-gray-700">
                                <div className="flex justify-between">
                                    <span>Total MRP</span>
                                    <span>₹{mrp}</span>
                                </div>
                                <p className=" flex justify-between text-xs text-gray-500">Inclusive of all taxes</p>

                                <div className="flex justify-between text-green-600 font-semibold mt-4">
                                    <span>Discount</span>
                                    <span>-₹{discount}</span>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="flex justify-between font-semibold text-gray-700">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>

                            <button className="w-full bg-black text-white py-3 rounded mt-5 hover:bg-gray-800">
                                Select Payment Method
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CheckoutFinal;