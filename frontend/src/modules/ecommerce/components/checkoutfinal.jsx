import React, { useEffect, useState } from "react";
import { BiSolidCoupon } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";
import axios from "axios";

function CheckoutFinal() {

    const [orders, setOrders] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!user?.id) return;

        axios.get(`http://127.0.0.1:8000/api/orders/${user.id}`)
            .then(res => setOrders(res.data))
            .catch(err => console.error(err));
    }, [user?.id]);

    // Calculate total of all products
    const mrp = orders.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
    const discount = 0;
    const total = mrp - discount;

    return (
        <div className="bg-white p-3 sm:p-6">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start mt-4 sm:mt-10">

                {/* LEFT SIDE */}
                <div className="w-full lg:flex-1 bg-gray-100 rounded shadow-sm p-4 sm:p-6">
                    <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-700">
                        Address
                    </h2>

                    <div className="mt-3">
                       <h5 className="text-gray-700 font-semibold text-sm sm:text-base">
  {orders[0]?.member_name}
</h5>

<p className="text-xs sm:text-sm text-gray-700 font-semibold mt-2">
  {orders[0]?.address}
</p>

<p className="text-xs sm:text-sm text-gray-500 font-semibold mt-2">
  Mobile: {orders[0]?.mobile}
</p>
                    </div>

                    <hr className="my-4 text-gray-500" />

                    <div className="mt-3">
                        <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-700">
                            Estimated Delivery
                        </h2>

                        <p className="text-xs sm:text-sm text-gray-500 font-semibold">
                            Shipment 1 of 1
                        </p>

                        <div className="items-center gap-3 mt-4 bg-white p-3 sm:p-4 rounded">
                            <p className="text-base sm:text-lg text-gray-700 font-semibold">
                                <TbTruckDelivery className="inline text-lg sm:text-xl" /> Delivery by Sat, 07 Feb
                            </p>

                            {/* SHOW ALL ORDERED PRODUCTS */}
                            {orders.length === 0 ? (
                                <p className="mt-4 text-sm text-gray-500">No orders found</p>
                            ) : (
                                orders.map((order, index) => (
                                    <div key={index} className="flex items-center gap-3 mt-4">
                                        <img
                                      src={order.image} 
                                            alt="product"
                                            className="w-20 h-20 sm:w-30 sm:h-30 rounded object-cover shrink-0"
                                        />

                                        <div className="flex-1">
                                            <h3 className="font-medium text-sm sm:text-base">
                                                {order.product_name}
                                            </h3>

                                            <p className="text-xs text-gray-500">
                                                Qty: {order.quantity}
                                            </p>
                                        </div>

                                    </div>
                                ))
                            )}

                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="w-full lg:w-80 bg-gray-100 rounded shadow-sm p-4 sm:p-6">
                    <div>

                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-700 text-sm sm:text-base">
                                <BiSolidCoupon className="inline text-lg sm:text-xl" /> Coupons & Bank Offers
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-700 font-semibold mt-2">
                                Login to Apply Coupons & Bank Offers
                            </p>
                        </div>

                        <hr className="my-4" />

                        <div className="mt-4">
                            <h4 className="font-semibold mb-3 text-gray-700 text-sm sm:text-base">
                                Price Details
                            </h4>

                            <div className="text-xs sm:text-sm font-semibold text-gray-700 space-y-2">
                                <div className="flex justify-between">
                                    <span>Total MRP</span>
                                    <span>₹{mrp}</span>
                                </div>

                                <p className="flex justify-between text-xs text-gray-500">
                                    Inclusive of all taxes
                                </p>

                                <div className="flex justify-between text-green-600 font-semibold">
                                    <span>Discount</span>
                                    <span>-₹{discount}</span>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="flex justify-between font-semibold text-gray-700 text-sm sm:text-base">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>

                            <button className="w-full bg-black text-white py-3 rounded mt-5 hover:bg-gray-800 text-sm sm:text-base">
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