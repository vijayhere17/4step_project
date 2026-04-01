import React, { useState } from "react";

function UpFooter() {
  const [email, setEmail] = useState("");

  function handleClick() {
    // ✅ empty check
    if (!email) {
      alert("Please enter your email");
      return;
    }

    // ✅ email validation
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      alert("Please enter a valid email address");
      return;
    }

    // ✅ success
    alert("We have received your email. We will contact you soon.");
    setEmail("");
  }

  return (
    <section className="py-12 bg-white text-white ">
      <div className="mx-auto w-full px-4 text-center">
        <div className="border-t border-gray-400 mt-5 mb-15"></div>

        <h2 className="text-xl text-gray-700 font-semibold mb-2 ">
          Be the first to hear about all things 4step
        </h2>

        <p className="text-sm text-gray-700 font-semibold mt-4 mb-5 max-w-xl mx-auto">
          Stay connected for exclusive offers and latest updates, delivered straight to your inbox
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 items-center">
          <div className="w-full sm:w-auto px-5 sm:px-10 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-primar">
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border-0 outline-none text-gray-500 w-full sm:w-auto"
            />
          </div>

          <button
            type="button"
            className="px-5 py-2.5 rounded-xl text-sm text-gray-500 font-semibold bg-gray-300 hover:bg-gray-200"
            onClick={handleClick}
          >
            Send
          </button>
        </div>

        <p className="text-sm text-primary-50 mt-4 max-w-xl mx-auto">
          No spam, unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
}

export default UpFooter;