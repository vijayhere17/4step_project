import { Routes } from "react-router-dom";
import MemberRoutes from "../modules/member/MemberRoutes";
import EcommerceRoutes from "../modules/ecommerce/EcommerceRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {EcommerceRoutes()}
      {MemberRoutes()}
    </Routes>
  );
}