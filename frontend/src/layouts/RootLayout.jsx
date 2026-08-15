import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HomePage from "../pages/HomePage";

//Outlet is the children element written in app router
//It changes depending on the path
function RootLayout() {
    //You can also make this a ProtectedRoute:
    //You can check authorisation using the useUser hook,
    //  return an unauthorised page or redirect here.
    // So the layout will slighlty change after authorisation is done
    // Till then this is fine

    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (location.pathname === "/") {
        //If its home page , no sidebar
        return (
            <div className="appShell">
                <Navbar />
                <div className="appBody">
                    <main className="appMain">
                        <HomePage />
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="appShell">
            <Navbar onMenuClick={() => setSidebarOpen((open) => !open)} />
            <div className="appBody">
                <Sidebar
                    open={sidebarOpen}
                    onNavigate={() => setSidebarOpen(false)}
                />
                {sidebarOpen && (
                    <div
                        className="sidebarBackdrop"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <main className="appMain">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default RootLayout;
