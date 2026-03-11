import { ClerkProvider } from '@clerk/clerk-react'
import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Toaster } from "../client/components/ui/toaster";
import "./Main.css";
import NavBar from "./components/NavBar/NavBar";
import { marketingNavigationItems } from "./components/NavBar/constants";
import CookieConsentBanner from "./components/cookie-consent/Banner";
import AppSidebar from "./dashboard/AppSidebar";

const CLERK_PUBLISHABLE_KEY = 'pk_live_Y2xlcmsuZXBpYy5kbSQ'

// Inner layout — rendered inside ClerkProvider
function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboard = useMemo(() =>
    location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/create"),
    [location]);
  const isAdmin = useMemo(() => location.pathname.startsWith("/admin"), [location]);
  const isAuth = useMemo(() =>
    ["/login", "/signup", "/request-password-reset", "/password-reset", "/email-verification"]
      .some(p => location.pathname.startsWith(p)),
    [location]);

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

// ClerkProvider must wrap the entire app including the router outlet
// We use window.location for navigation to avoid useNavigate-outside-router issues
export default function App() {
  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      routerPush={(to: string) => window.history.pushState({}, '', to)}
      routerReplace={(to: string) => window.history.replaceState({}, '', to)}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <AppLayout />
    </ClerkProvider>
  )
}
