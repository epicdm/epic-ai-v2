import { useEffect, useMemo } from "react";
import { Outlet, useLocation } from "react-router";
import { routes } from "wasp/client/router";
import { Toaster } from "../client/components/ui/toaster";
import "./Main.css";
import NavBar from "./components/NavBar/NavBar";
import { marketingNavigationItems } from "./components/NavBar/constants";
import CookieConsentBanner from "./components/cookie-consent/Banner";
import AppSidebar from "./dashboard/AppSidebar";

export default function App() {
  const location = useLocation();

  const isDashboard = useMemo(() => location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/create"), [location]);
  const isAdmin = useMemo(() => location.pathname.startsWith("/admin"), [location]);
  const isAuth = useMemo(() => ["/login", "/signup", "/request-password-reset", "/password-reset", "/email-verification"].some(p => location.pathname.startsWith(p)), [location]);
  const isMarketing = useMemo(() => location.pathname === "/" || location.pathname.startsWith("/pricing"), [location]);

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace("#", ""));
      if (el) el.scrollIntoView();
    }
  }, [location]);

  if (isDashboard) {
    return (
      <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
        <AppSidebar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
        <Toaster position="bottom-right" />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <>
        <Outlet />
        <Toaster position="bottom-right" />
      </>
    );
  }

  return (
    <>
      <div className="bg-background text-foreground min-h-screen">
        {!isAuth && <NavBar navigationItems={marketingNavigationItems} />}
        <div className="mx-auto max-w-(--breakpoint-2xl)">
          <Outlet />
        </div>
      </div>
      <Toaster position="bottom-right" />
      <CookieConsentBanner />
    </>
  );
}
