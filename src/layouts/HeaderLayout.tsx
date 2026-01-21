import { Button, Spin } from "antd"
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Suspense } from "react";
import ErrorBoundary from "antd/es/alert/ErrorBoundary";
import { useAuthContext } from "../contexts/AuthProvider/hooks/useAuthContext";
import { publickRoutes } from "../config/routes.config";
import { LogoutOutlined } from "@ant-design/icons";

export const HeaderLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const auth = useAuthContext();

    const handleLogout = () => {
        auth?.signout(() => window.location.reload());
        navigate(publickRoutes.home);
    }

    return (
        <>
            {
                auth?.user !== null && (
                    <Button style={{
                        position: 'fixed',
                        top: 10,
                        right: 10,
                        background: '#fff',
                        padding: '16px 24px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }} icon={<LogoutOutlined />} onClick={handleLogout}>
                        Выйти
                    </Button>
                )
            }
            <ErrorBoundary key={location.pathname}>
                <Suspense fallback={<Spin size="large" fullscreen />}>
                    <Outlet />
                </Suspense>
            </ErrorBoundary>
        </>
    )
}