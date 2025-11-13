import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingBag, Users, Shield, MessageSquare } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">UniMarket</span>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="ghost">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 text-foreground">
          Your Campus Marketplace
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Buy, sell, and exchange goods with fellow students and staff. A trusted marketplace built exclusively for your university community.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary-light">
            <Link to="/register">Start Trading</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Why UniMarket?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-card-foreground">Safe & Secure</h3>
              <p className="text-sm text-muted-foreground">University email verification ensures a trusted community</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-card-foreground">Campus Community</h3>
              <p className="text-sm text-muted-foreground">Connect with students and staff from your university</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-card-foreground">Direct Messaging</h3>
              <p className="text-sm text-muted-foreground">Chat directly with buyers and sellers instantly</p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm text-center">
              <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-card-foreground">Easy Listing</h3>
              <p className="text-sm text-muted-foreground">Post items in seconds with our simple interface</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 UniMarket. Built for university communities.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
