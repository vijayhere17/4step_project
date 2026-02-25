import React, { useState } from "react";
import { BiSolidCoupon } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const mrp = 549;
  const discount = 55;

  const totalMrp = mrp * qty;
  const totalDiscount = discount * qty;
  const total = totalMrp - totalDiscount;

  

  return (
    <div className="bg-white p-6">
      <div className="max-w-6xl mx-auto flex gap-6 items-start mt-10">
        
{/* LEFT SIDE - CART */}
        <div className="flex-1 bg-gray-100 rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            My Bag{" "}
            <span className="text-gray-500 text-sm">
              ({qty} item{qty > 1 ? "s" : ""})
            </span>
          </h2>

          <div className="mt-3">
            <div className="flex gap-5">
              <img
                src="/images/ecom/product5.png"
                alt="product"
                className="w-28 h-28 rounded object-cover"
              />

              <div className="flex-1">
                <p className="text-sm text-gray-500">Personal Care</p>
                <h3 className="font-medium">NONI BODY LOTION</h3>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
                    className="w-8 h-8 border rounded hover:bg-gray-200"
                  >
                    −
                  </button>

                  <span className="font-semibold">{qty}</span>

                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-8 h-8 border rounded hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

{/* RIGHT SIDE - PRICE DETAILS */}
        <div className="w-80 bg-gray-100 rounded shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <BiSolidCoupon className="text-xl" />
              Coupons & Bank Offers
            </h3>
            <p className="text-sm text-gray-700 font-semibold">
              Login to Apply Coupons & Bank Offers
            </p>
          </div>

          <hr className="my-4" />

          <div className="mt-4">
            <h4 className="font-semibold mb-3 text-gray-700">
              Price Details
            </h4>

            <div className="text-sm font-semibold text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span>₹{totalMrp}</span>
              </div>

              <p className="text-xs text-gray-500">
                Inclusive of all taxes
              </p>

              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount</span>
                <span>-₹{totalDiscount}</span>
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between font-semibold text-lg text-gray-800">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <p className="text-green-600 mt-2 text-sm font-semibold">
              Woohoo! You save ₹{totalDiscount}.00 on this order.
            </p>

            <button
              className="w-full bg-black text-white py-3 rounded mt-5 hover:bg-gray-800 transition"
              onClick={() => navigate("/checkoutfinal")}
            >
              Checkout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
