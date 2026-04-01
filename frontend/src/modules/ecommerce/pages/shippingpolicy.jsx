import React from "react";

const sections = [
  { id: "processing", title: "Order Processing" },
  { id: "delivery", title: "Delivery Time" },
  { id: "charges", title: "Shipping Charges" },
  { id: "tracking", title: "Order Tracking" },
  { id: "delays", title: "Delays" },
  { id: "areas", title: "Service Areas" },
  { id: "contact", title: "Contact Us" },
];

function ShippingPolicy() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">

        {/* LEFT SIDEBAR */}
        <div className="md:w-1/4 w-full">
          <div className="sticky top-24 border rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">
              Shipping & Delivery
            </h2>
            <ul className="space-y-2 text-sm">
              {sections.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-gray-600 hover:text-black"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="md:w-3/4 w-full p-6 md:p-10 border rounded-xl">
          <h1 className="text-3xl font-bold mb-3">
            Shipping & Delivery Policy
          </h1>

          {/* 🔥 Intro */}
          <p className="text-gray-600 mb-8">
            This policy outlines how orders are processed, shipped, and delivered to ensure a smooth and transparent shopping experience.
          </p>

          {/* Sections */}

          <section id="processing" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Order Processing</h2>
            <p className="text-gray-600">
              Orders are processed within 1–2 business days after confirmation. Orders placed on weekends or public holidays will be processed on the next working day.
            </p>
          </section>

          <section id="delivery" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Delivery Time</h2>
            <p className="text-gray-600">
              Delivery typically takes 3–7 business days depending on your location. Delivery timelines may vary for remote or non-serviceable areas.
            </p>
          </section>

          <section id="charges" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Shipping Charges</h2>
            <p className="text-gray-600">
              Shipping charges (if applicable) will be clearly displayed at checkout before payment. Free shipping may be available on selected orders or promotional offers.
            </p>
          </section>

          <section id="tracking" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Order Tracking</h2>
            <p className="text-gray-600">
              Once your order is shipped, you will receive tracking details via email or SMS. You can use this information to track your order in real-time.
            </p>
          </section>

          <section id="delays" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Delays</h2>
            <p className="text-gray-600">
              Delivery delays may occur due to weather conditions, logistics issues, or unforeseen circumstances. We are not responsible for delays caused by courier partners.
            </p>
          </section>

          <section id="areas" className="mb-8 scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Service Areas</h2>
            <p className="text-gray-600">
              We deliver to most locations across India. However, certain remote areas may not be serviceable, and orders to such locations may be canceled or delayed.
            </p>
          </section>

          <section id="contact" className="scroll-mt-28">
            <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
            <p className="text-gray-600">
              For any shipping or delivery-related queries, please contact us:
              <br />
              Email: support@yourstore.com
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

export default ShippingPolicy;