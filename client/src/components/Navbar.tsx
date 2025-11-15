import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  User,
  MessageSquare,
  ShieldCheck,
  SearchX,
} from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:3000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success && data.data.role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              HostelKart
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {isAdmin && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Link to="/admin">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm">
              <Link to="/lost-and-found">
                <SearchX className="h-4 w-4 mr-2" />
                Lost & Found
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
