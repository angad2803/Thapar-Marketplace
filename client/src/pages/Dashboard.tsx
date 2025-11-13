import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Search, Plus, Heart, Package } from "lucide-react";
import Navbar from "@/components/Navbar";

// Mock data
const mockProducts = [
  {
    id: 1,
    title: "Calculus Textbook - 12th Edition",
    price: 45,
    condition: "Good",
    category: "Books",
    seller: "John D.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
  },
  {
    id: 2,
    title: "MacBook Pro 2019",
    price: 850,
    condition: "Excellent",
    category: "Electronics",
    seller: "Sarah M.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
  },
  {
    id: 3,
    title: "Study Desk & Chair Set",
    price: 120,
    condition: "Good",
    category: "Furniture",
    seller: "Mike R.",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400",
  },
  {
    id: 4,
    title: "Scientific Calculator",
    price: 25,
    condition: "Like New",
    category: "Electronics",
    seller: "Emily K.",
    image: "https://images.unsplash.com/photo-1611532736570-a8c2e6b5c4f7?w=400",
  },
];

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Browse and discover items from your campus community</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button asChild className="bg-accent hover:bg-accent-light">
            <Link to="/post-item">
              <Plus className="mr-2 h-4 w-4" />
              Post New Item
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/wishlist">
              <Heart className="mr-2 h-4 w-4" />
              Wishlist
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/my-listings">
              <Package className="mr-2 h-4 w-4" />
              My Listings
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="books">Books</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">{product.title}</h3>
                  <p className="text-2xl font-bold text-primary mb-2">${product.price}</p>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">{product.condition}</Badge>
                    <span className="text-muted-foreground">{product.seller}</span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
