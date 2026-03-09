
import { Outlet } from "react-router-dom";

export default function MemberLayout() {
  return (
    <div className="member-wrapper">
    
      <div className="member-main">
      
        <Outlet />
      </div>
    </div>
  );
}