import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import useUser from "../hooks/useUser";

const ProtectedRoute = () => {
    const { data: user, isLoading, error } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="routeState">
                <h5>Loading...</h5>
            </div>
        );
    }

    const isUnauthorized =
        axios.isAxiosError(error) && error.response?.status === 401;

    if (!user || isUnauthorized) {
        return (
            <div className="routeState">
                <h3>Login to View</h3>
                <p>Your session is required before viewing this page.</p>
                <button
                    className="btn btn-primary"
                    onClick={() =>
                        navigate("/login", {
                            state: { from: location },
                            replace: true,
                        })
                    }
                >
                    Login
                </button>
            </div>
        );
    }

    if (error) {
        return (
            <div className="routeState">
                <p>An error occurred while checking your session.</p>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
