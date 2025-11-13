import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingBag, User, MessageSquare } from "lucide-react";

const Navbar = () => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">UniMarket</span>
          </Link>
          
          <nav className="flex items-center gap-4">
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
