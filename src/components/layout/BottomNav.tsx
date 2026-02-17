import { Home, Search, Upload, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const items = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Discover" },
    { to: "/upload", icon: Upload, label: "Upload" },
    { to: user ? "/profile" : "/auth", icon: User, label: user ? "Profile" : "Sign In" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
