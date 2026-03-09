import React, { useState, useEffect, useRef } from "react";

function HomeBanner() {
  const [current, setCurrent] = useState(0);

  
  const images = [
    "/images/ecom/Banner.jpg",
    "/images/ecom/Banner2.png",
    "/images/ecom/Banner.jpg",
    "/images/ecom/Banner2.png",
    "/images/ecom/Banner.jpg",
  ];

 
  const scrollItems = [
  {
    title: "Beauty Care",
    image: "/images/ecom/product1.png",
  },
  {
    title: "Skincare",
    image: "/images/ecom/product2.jpg",
  },
  {
    title: "Hair",
    image: "/images/ecom/product3.png",
  },
  {
    title: "Fragrance",
    image: "/images/ecom/product4.jpg",
  },
  {
    title: "Bath & Body",
    image: "/images/ecom/product5.png",
  },
  {
    title: "Men",
    image: "/images/ecom/product6.jpg",
  },
  {
    title: "Child Care",
    image: "/images/ecom/product5.png",
  },
  {
    title: "Home Care",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  },
];


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  const MainRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (ref, direction) => {
    const container = ref.current;
    const scrollAmount = 300;

    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const container = MainRef.current;
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

  return (
    <div className="min-h-screen bg-white px-4 py-4">
      <div className="w-full mx-auto">

        <nav className="flex gap-9 text-gray-700 mb-4 text-sm font-medium justify-start ml-2">
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

        <div className="relative rounded-b-lg overflow-hidden">
          <img
            src={images[current]}
            alt="Sale"
            className="w-full h-120 object-fill transition-all duration-700"
          />
        </div>

        <div className="px-6 mt-10 relative">

          {showLeft && (
            <button
              onClick={() => scroll(MainRef, "left")}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 
                         bg-white shadow-md rounded-full w-10 h-10 
                         flex items-center justify-center text-3xl"
            >
              ‹
            </button>
          )}

          <div
            ref={MainRef}
            onScroll={handleScroll}
            className="flex gap-2 overflow-x-hidden scroll-smooth"
          >
            {scrollItems.map((item, index) => (
              <div key={index} className="min-w-40">
                <div className="ml-2 justify-center">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-40 h-40 object-cover mx-auto transition-transform hover:scale-105"
                  />
                </div>
                <a
                  href="#"
                  className="mt-3 ml-2 text-sm font-medium text-gray-800"
                >
                  {item.title}
                </a>
              </div>
            ))}
          </div>

          {showRight && (
            <button
              onClick={() => scroll(MainRef, "right")}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 
                         bg-white shadow-md rounded-full w-13 h-13 
                         flex items-center justify-center text-3xl"
            >
              ›
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default HomeBanner;
