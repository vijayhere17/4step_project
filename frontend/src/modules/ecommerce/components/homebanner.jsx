import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function HomeBanner() {
  const [current, setCurrent] = useState(0);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const images = [
    "./images/ecom/Banner.jpg",
    "./images/ecom/Banner2.png",
    "./images/ecom/Banner.jpg",
    "./images/ecom/Banner2.png",
    "./images/ecom/Banner.jpg",
  ];

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/categories")
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-white px-3 sm:px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto">

        {/* Top Banner */}
        <div className="bg-blue-100 rounded-t-lg text-center text-xs sm:text-sm py-2 sm:py-3 px-2">
          Enjoy up to ₹2000 off. Use code:{" "}
          <span className="font-semibold">BIGSALE26</span>
        </div>

        {/* Image Slider */}
        <div className="relative rounded-b-lg overflow-hidden">
          <img
            src={images[current]}
            alt="Sale"
            className="w-full h-40 sm:h-80 lg:h-120 object-contain sm:object-cover transition-all duration-700"
          />
        </div>
        {/* Categories Section */}
        <div className="mt-6 sm:mt-10">
          <h2 className="text-2xl font-semibold  mb-6">
            Prodcut Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-4">
            {categories.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/category/${item.id}`)}
                className="cursor-pointer"
              >
                <div className="w-full">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-42 sm:h-36 lg:h-50 object-cover rounded-md transition-transform hover:scale-105"
                  />
                </div>

                <p className="mt-2 sm:mt-3 block text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-700 text-center hover:text-blue-600">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default HomeBanner;