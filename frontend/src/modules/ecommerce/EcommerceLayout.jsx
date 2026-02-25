import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/header";
import UpFooter from "./components/upfooter";
import Footer from "./components/footer";

export default function EcommerceLayout() {
  const location = useLocation();

  const hideLayout =
    location.pathname === "/" ||
    location.pathname === "/signup";

  return (
    <>
      {!hideLayout && <Header />}

      <Outlet />

      {!hideLayout && (
        <>
          <UpFooter />
          <Footer />
        </>
      )}
    </>
  );
}