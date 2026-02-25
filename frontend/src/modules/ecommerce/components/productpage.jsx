import React from "react";
import { FiShare2,FiTruck,FiThumbsUp } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";



const STAR_RATINGS = [5, 4, 3, 2, 1];

const SHADE_COLORS = [
  "bg-red-400",
  "bg-orange-400",
  "bg-pink-400",
  "bg-red-600",
  "bg-orange-600",
  "bg-red-300",
];

const ACCORDIONS = [
  "Special Features",
  "Super ingredients",
  "Product Description",
  "Product Details",
];

const Stars = ({ filled = 4 }) => (
  <div className="flex text-red-500 gap-1">
    {[...Array(5)].map((_, i) =>
      i < filled ? (
        <FaStar key={i} size={12} />
      ) : (
        <FaRegStar key={i} size={12} />
      )
    )}
  </div>
);

const ReviewCard = ({
  rating = 5,
  title,
  description,
  images,
  name,
  likes = 0,
  date,
}) => (
  <div className="bg-[#f7f7f7] border border-gray-200 p-4 rounded">
    <div className="flex text-red-500 mb-2 gap-1">
      {[...Array(5)].map((_, i) =>
        i < rating ? <FaStar key={i} size={12} /> : <FaRegStar key={i} size={12} />
      )}
    </div>
    <p className="font-medium text-sm mb-2">{title}</p>
    {description && (
      <p className="text-xs text-gray-600 mb-3">
        {description}
        {images && (
          <span className="text-black font-medium cursor-pointer">
            {" "}
            Read more
          </span>
        )}
      </p>
    )}
    {images && (
      <div className="flex gap-2 mb-3">
        {images.map((img) => (
          <img
            key={img}
            src={img}
            className="w-14 h-14 object-cover"
            alt="product"
          />
        ))}
      </div>
    )}
    <div className="flex items-center text-xs text-gray-600 gap-2">
      {name && <span>{name}</span>}
      <MdVerified className="text-green-500" size={12} />
      <span>Verified buyer</span>
    </div>
    <div className="flex justify-between text-xs text-gray-500 mt-2">
      <span>From Tira</span>
      <div className="flex items-center gap-1">
        <FiThumbsUp size={12} />
        <span>{likes}</span>
      </div>
      {date && <span>{date}</span>}
    </div>
  </div>
);

const images = [
  "./images/gallery1.jpg",
  "./images/gallery2.jpg",
  "./images/gallery3.jpg",
  "./images/gallery4.png",
  "./images/gallery5.jpg",
  "./images/gallery6.jpg",
  "./images/gallery7.jpg",


];

function ProductPage() {
  return (
    <div className="bg-white min-h-screen px-4 py-4">
      <div className="w-full mx-auto bg-white ">
        <nav className="flex gap-9 text-gray-700 mb-4 text-sm font-medium justify-start ml-2 ">
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
{/* Product Detail Section         */}
        <div className="grid grid-cols-2 gap-4 px-6">
{/* Left section of product section */}
          <div className="flex justify-center">
            <div className="relative inline-block bg-white ">

              <img
                src="/images/ecom/product5.png"
                alt="product"
                className=" object-contain"
              />

              <p className="absolute top-1 left-1 bg-gray-200 rounded text-sm px-3 py-1">
                BUY 2 GET 1
              </p>

              <p className="absolute  left-0 right-0 text-sm text-gray-600 text-center font-medium bg-gray-100 px-3 py-1">
                1000+ units sold in the last month
              </p>

            </div>
          </div>
{/* RIGHT Section of product section */}
          <div className="justify-center flex flex-col ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 mb-4">
                  Home / Makeup / Face / Blush
                </p>

                <p className="text-xs text-gray-500 mb-4 underline">
                  Sheglam
                </p>

                <h1 className="text-2xl font-semibold text-gray-900">
                  NONI BODY LOTION
                </h1>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-semibold">4.2 / <span className="text-gray-400">5</span></span>
                  <FaStar className="text-[#DCC0B6]" />
                  <span className="text-xs underline font-semibold">
                    2981 Ratings
                  </span>
                  <span className="text-xs underline font-semibold">
                    Rate this product
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-2xl font-semibold text-gray-900">
                    ₹494
                  </span>
                  <span className="line-through text-gray-400 text-lg">
                    ₹549
                  </span>
                  <span className=" text-lg font-medium">
                    ( 10% Off )
                  </span>
                  <span className=" text-sm text-gray-400 ">
                    Inclusive of All taxes
                  </span>
                </div>
              </div>
              <FiShare2 className="text-gray-500 text-lg cursor-pointer hover:text-black transition" />
            </div>
{/* Select Shade Section */}
            <div className="relative justify-between items-start mt-2">
              <p className="text-sm font-medium mb-3">Select Shade</p>
              <select className=" w-full border rounded px-3 py-1 text-sm">
                <option>Love Cake</option>
                <option>Shade 1 </option>
                <option>Shade 2</option>
                <option>Shade 3</option>
              </select>
              <div className="flex gap-3 mt-3">
                {SHADE_COLORS.map((color, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full ${color} cursor-pointer hover:scale-110 transition shadow-2xl` }
                  />
                ))}
              </div>
            </div>
 {/* Button Section */}
            <div className="flex gap-4 mt-3">
              <button className="flex-1 bg-black rounded-lg text-white py-3 text-sm font-medium hover:bg-gray-800 transition">
                Notify Me
              </button>
              <button className="flex-1 border py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                Save to Wishlist
              </button>
            </div>

            {/* DELIVERY Section */}
            <div className="border border-gray-300 rounded-md p-4 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">
                  Delivery Options
                </span>
                <span className=" bg-gray-100 px-2 py-1 text-xs rounded">
                  <CiLocationOn className="inline justify-between" /> 400013
                </span>
              </div>

              <p className="text-red-500 text-xs font-medium bg-gray-100 px-3 py-2 rounded mt-4">
                <FiTruck className="inline text-black mr-2" /> Product is currently out of stock
              </p>
            </div>

            {/* ACCORDION */}
            <div className="space-y-2 mt-4">
              {ACCORDIONS.map((item) => (
                <div
                  key={item}
                  className="border border-gray-200 rounded-md p-4 flex justify-between items-center text-sm cursor-pointer hover:bg-gray-50 transition"
                >
                  <span>{item}</span>
                  <span className="text-lg">+</span>
                </div>
              ))}
              <div className="border border-gray-300 rounded-md p-2 mt-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    Rate This Product
                  </span>
                  <span className="  px-2 py-1 text-xs float-end">
                    <Stars filled={4} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
{/* REVIEWS + Gallery */}
        <div className=" px-6 grid grid-cols-2 gap-4 mt-2">
          <div >
            <h3 className="text-base font-semibold mb-1">Ratings</h3>
            <p className="text-xs text-gray-500 mb-6">
              From 2981 customers
            </p>

            <div className="flex gap-8">
              <div className="text-center">
                <h1 className="text-4xl font-semibold">4.2
                  <p className=" inline text-gray-400 text-lg ">/ 5</p>

                </h1>
                <div className="flex justify-center mt-2">
                  <Stars filled={4} />
                </div>
                <p className="text-red-500 text-xs mt-1">Good</p>
              </div>

              <div className="flex-1 space-y-3">
                {STAR_RATINGS.map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs w-4">{star}</span>
                    <div className="flex-1 h-0.5 bg-gray-300">
                      <div
                        className="h-0.5 bg-black"
                        style={{ width: `${(6 - star) * 15 + 20}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {star * 200}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="justify-start">
            <h3 className="text-sm text-gray-400 font-semibold mb-1">Sold by:
              <span className="text-black"> Reliance Retail Limited</span>
            </h3>
            <h3 className=" relative text-lg font-semibold mb-1">
              Gallery
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2">
              {images.map((images, index) => (
                <div
                  key={index}
                >
                  <div className=" rounded-lg overflow-hidden ">
                    <img
                      src={images}
                      alt='product'
                      className="w-24 h-24 object-cover rounded-lg"
                    />

                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
{/* REVIEWS Section */}
        <div className=" px-6 mt-10">
          <h2 className="text-base font-semibold mb-4">Reviews</h2>
          <div className=" border-gray-200 rounded-md py-3-">
            <div className="flex flex-row gap-4 bg-gray-100 px-3 py-2 rounded mb-1">
              <p className="text-sm">Filter By </p>
              <select className=" border rounded px-3 py-1 text-sm bg-white">
                <option>Ratings</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select>
              <select className=" border rounded px-3 py-1 text-sm bg-white">
                <option>Reviews By </option>
                <option>Stars </option>
                <option>Recent</option>
                <option>By Ttime</option>
              </select>
              <p className="border rounded px-3 py-1 text-sm bg-white">Reviews With Images</p>
              <p className="justify-content-end">Reset Filters</p>
            </div>
            <div className="grid grid-cols-2 gap-6 ">
              <div className="space-y-6">
                <ReviewCard title="Lovely" name="Nancy Sahni" />
                <ReviewCard title="Loved it!!!!" />
                <ReviewCard
                  title="I like this product it's too good 😊"
                  name="kashish singh"
                />
              </div>

              <div className="space-y-6">
                <ReviewCard
                  rating={4}
                  title="Pigmented and creamy - Love Cake"
                  description="I prefer peach tones usually but chose a pink hue to try it out. It's a lovely pastel color and a little dab goes a long way ..."
                  images={images.slice(0, 4)}
                  name="Lamia Saldanha"
                  likes={8}
                  date="6 Oct, 2025"
                />
                <ReviewCard
                  rating={4}
                  title="Beautiful colour"
                  description="It has a beautiful brownish shade. Like it."
                  name="Smriti Bhatiya"
                  date="26 Sep, 2025"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
