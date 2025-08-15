import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SimpleSidebar } from "@/components/SimpleSidebar";
import MainFeed from "@/components/feed/MainFeed";
import { SimpleRightSidebar } from "@/components/SimpleRightSidebar";
import { ToastContainer } from "@/components/ToastContainer";
import { QuickActions } from "@/components/QuickActions";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { MobileNav } from "@/components/MobileNav";
import { Loader2 } from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while still loading authentication status
    if (loading) return;

    // If user is not authenticated, redirect to welcome page
    if (!user) {
      navigate("/welcome");
      return;
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white via-cream-white to-light-blue-gray/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-warm-brown animate-spin" />
          <p className="text-lg text-dark-blue">
            Loading your family dashboard...
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the dashboard (will redirect)
  if (!user) {
    return null;
  }

  // Render the authenticated dashboard
  return (
    <div className="flex bg-background" style={{ height: "1210px" }}>
      <SimpleSidebar />
      <MobileNav />
      <MainFeed />
      <SimpleRightSidebar />

      {/* Global Components */}
      <ToastContainer />
      <QuickActions />
      <KeyboardShortcuts />
    </div>
  );
}
