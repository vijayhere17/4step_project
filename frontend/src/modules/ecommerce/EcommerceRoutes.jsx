import { Route } from "react-router-dom";
import EcommerceLayout from "./EcommerceLayout";

import LoginPage from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/home";
import AllProduct from "./pages/allproduct";
import Product from "./pages/product";
import Helpform from "./components/helpform";
import Checkout from "./components/checkout";
import CheckoutFinal from "./components/checkoutfinal";

export default function EcommerceRoutes() {
  return (
    <Route path="/" element={<EcommerceLayout />}>
      <Route index element={<LoginPage />} />
      <Route path="signup" element={<Signup />} />
      <Route path="home" element={<Home />} />
      <Route path="allproduct" element={<AllProduct />} />
      <Route path="product" element={<Product />} />
      <Route path="helpform" element={<Helpform />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="checkoutfinal" element={<CheckoutFinal />} />
    </Route>
  );
}