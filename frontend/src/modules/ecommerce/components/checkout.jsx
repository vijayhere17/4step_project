import React, { useState, useEffect } from "react";
import { BiSolidCoupon } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

function Checkout() {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const storedProduct = localStorage.getItem("cartProduct");

    if (storedProduct) {
      const parsed = JSON.parse(storedProduct);
      setProduct(parsed);
      setQty(parsed.qty || 1);
    }
  }, []);

  const handleDelete = () => {
    localStorage.removeItem("cartProduct");
    navigate("/home");
  };

  // Get user
  const user = JSON.parse(localStorage.getItem("user"));
  const memberId = user?.id;

  // Price calculation
  const mrp = Number(product?.price || 0);
  const discount = 0;

  const totalMrp = mrp * qty;
  const totalDiscount = discount * qty;
  const total = totalMrp - totalDiscount;

  const handleCheckout = () => {
    if (!memberId) {
      alert("Please login first");
      return;
    }

    const orderData = {
      member_id: memberId,
      product_name: product?.name,
      quantity: qty,
      total_amount: Number(product?.price) * qty,
      image: product?.image
    };

    axios.post("http://127.0.0.1:8000/api/place-order", orderData)
      .then(() => {
        alert("Order Placed Successfully");
        localStorage.removeItem("cartProduct");
        navigate("/checkoutfinal");
      })
      .catch(err => console.error(err));
  };

  if (!product) {
    return (
      <div className="px-4 sm:px-6 md:px-10 py-10 mt-10 text-center text-gray-600">
        <p className="text-base sm:text-lg font-semibold">
          Your cart is currently empty
        </p>
        <p className="text-sm mt-2">
          Browse products and add items to your cart to proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start mt-6 sm:mt-10">

        {/* LEFT SIDE */}
        <div className="w-full lg:flex-1 bg-gray-100 rounded shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">
            My Bag <span className="text-gray-500 text-sm">({qty} item{qty > 1 ? "s" : ""})</span>
          </h2>

          <div className="mt-3">
            <div className="flex gap-3 sm:gap-5">
              <img
                src={product.image}
                alt="product"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded object-cover"
              />

              {/* CONTENT + DELETE ICON */}
              <div className="flex-1 flex justify-between items-start">

                {/* LEFT CONTENT */}
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">{product.brand}</p>
                  <h3 className="font-medium text-sm sm:text-base">{product.name}</h3>

                  <div className="flex items-center gap-3 mt-4">
                    <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)} className="w-8 h-8 border rounded">−</button>
                    <span className="font-semibold text-sm">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="w-8 h-8 border rounded">+</button>
                  </div>
                </div>

                {/* RIGHT DELETE ICON */}
                <FaTrash
                  onClick={handleDelete}
                  className="text-red-500 text-base cursor-pointer hover:scale-110 transition mt-1"
                />

              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-80 bg-gray-100 rounded shadow-sm p-4 sm:p-6">
          <h4 className="font-semibold mb-3 text-gray-700">Price Details</h4>

          <div className="text-sm font-semibold text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>Total MRP</span>
              <span>₹{totalMrp}</span>
            </div>

            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-₹{totalDiscount}</span>
            </div>
          </div>

          <hr className="my-4" />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button
            className="w-full bg-black text-white py-3 rounded mt-5"
            onClick={handleCheckout}
          >
            Checkout
          </button>
        </div>

      </div>
    </div>
  );
}

export default Checkout;