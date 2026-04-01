import React from "react";
import { FiShare2, FiTruck, FiThumbsUp } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const SHADE_COLORS = [
  "bg-red-400",
  "bg-orange-400",
  "bg-pink-400",
  "bg-red-600",
  "bg-orange-600",
  "bg-red-300",
];

function ProductPage() {
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(product?.qty || 1);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/product/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleAddToCart = () => {
    const cartData = {
      ...product,
      qty: qty,
    };

    localStorage.setItem("cartProduct", JSON.stringify(cartData));
    navigate("/checkout");
  };

  const handleWishlist = () => {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const exists = wishlist.find((item) => item.id === product.id);

    if (exists) {
      alert("Already in wishlist ");
      return;
    }

    wishlist.push(product);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    alert("Added to wishlist ");
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-4 sm:py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Product Detail Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            {/* Left section - Image */}
            <div className="relative bg-gray-50 p-4 sm:p-6 lg:p-8">
              <div className="relative aspect-square max-w-md mx-auto">
                <img
                  src={product.image}
                  alt="product"
                  className="w-full h-full object-contain rounded-lg"
                />
                <p className="absolute bottom-0 left-0 right-0 text-xs text-gray-600 text-center font-medium bg-white/90 backdrop-blur-sm px-3 py-2 rounded-b-lg">
                  1000+ units sold in the last month
                </p>
              </div>
            </div>

            {/* Right Section - Product Info */}
            <div className="p-4 sm:p-6 lg:p-8 lg:pl-0 flex flex-col">
              {/* Breadcrumb & Share */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-2 tracking-wide">
                    Home / Makeup / Face / Blush
                  </p>

                  <p className="text-xs text-gray-500 mb-1 underline underline-offset-2 hover:text-gray-700 cursor-pointer">
                    {product?.brand}
                  </p>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <FiShare2 className="text-gray-500 text-lg hover:text-gray-700" />
                </button>
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 leading-tight mb-4">
                {product?.name}
              </h1>

              {/* Price Section */}
              <div className="flex items-baseline flex-wrap gap-2 sm:gap-3 mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ₹{product?.price}
                </span>
                {/* <span className="line-through text-gray-400 text-base sm:text-lg">
                  ₹549
                </span>
                <span className="text-green-600 text-sm sm:text-base font-medium bg-green-50 px-2 py-0.5 rounded">
                  10% Off 
                </span>*/}
              </div>

              <p className="text-xs text-gray-400 -mt-4 mb-4">
                Inclusive of all taxes
              </p>
              <p className="text-sm text-gray-600">
                {product?.description}
              </p>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Quantity Section */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Quantity
                </p>
                <div className="flex items-center gap-1 border border-gray-200 rounded-lg w-fit">
                  <button
                    onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-l-lg text-lg font-medium text-gray-600 transition-colors"
                  >
                    −
                  </button>

                  <span className="w-12 text-center font-semibold text-gray-900">
                    {qty}
                  </span>

                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-r-lg text-lg font-medium text-gray-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Button Section */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-black rounded-lg text-white py-3.5 px-6 text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all shadow-sm"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleWishlist}
                  className="flex-1 border-2 border-gray-200 py-3.5 px-6 rounded-lg text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  Save to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;