import Sidebar from "../components/gn-officer/Sidebar";
import { Outlet } from "react-router-dom";
import "./OfficerLayout.css"

const OfficerLayout = () => {
    return (
        <div className="officer-layout">
            <Sidebar />

            <main className="officer-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default OfficerLayout;