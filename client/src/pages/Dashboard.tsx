import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Search, Plus, Heart, Package, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import { API_URL, getAuthHeaders } from "@/config/api";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [hostel, setHostel] = useState("all");
  const [myHostelOnly, setMyHostelOnly] = useState(false);
  const [products, setProducts] = useState([]);
  const [userHostel, setUserHostel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCurrentUser();
  }, [category, hostel, myHostelOnly, searchQuery]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("currentUserId", data.data._id);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const currentUserId = localStorage.getItem("currentUserId");
      const params = new URLSearchParams();

      if (category !== "all") params.append("category", category);
      if (hostel !== "all") params.append("hostel", hostel);
      if (myHostelOnly) params.append("myHostelOnly", "true");
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(
        `${API_URL}/listings?${params.toString()}`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Filter out user's own listings
        const filteredProducts = data.data.filter(
          (product: any) => product.sellerId._id !== currentUserId
        );
        setProducts(filteredProducts);
        if (data.userHostel) setUserHostel(data.userHostel);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHostelShortName = (hostelName) => {
    if (!hostelName) return "";
    const match = hostelName.match(/Hostel-([A-Z]+)/);
    if (match) return match[1];
    if (hostelName.includes("Agira")) return "A";
    if (hostelName.includes("Amritam")) return "B";
    if (hostelName.includes("Prithvi")) return "C";
    if (hostelName.includes("Day Scholar")) return "DS";
    if (hostelName.includes("Off Campus")) return "OC";
    return hostelName.substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Student Dashboard
          </h1>
          <p className="text-muted-foreground">
            Browse and discover items from your campus community
          </p>
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
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
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
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Books">Books</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Stationery">Stationery</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hostel Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <Home className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="hostel-filter" className="text-sm font-medium">
                Filter by Hostel:
              </Label>
              <Select
                value={hostel}
                onValueChange={setHostel}
                disabled={myHostelOnly}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Hostels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hostels</SelectItem>
                  <SelectItem value="Agira Hall (Hostel-A)">
                    Hostel A
                  </SelectItem>
                  <SelectItem value="Amritam Hall (Hostel-B)">
                    Hostel B
                  </SelectItem>
                  <SelectItem value="Prithvi Hall (Hostel-C)">
                    Hostel C
                  </SelectItem>
                  <SelectItem value="Neeram Hall (Hostel-D)">
                    Hostel D
                  </SelectItem>
                  <SelectItem value="Vasudha Hall - Block E (Hostel-E)">
                    Hostel E
                  </SelectItem>
                  <SelectItem value="Vasudha Hall - Block G (Hostel-G)">
                    Hostel G
                  </SelectItem>
                  <SelectItem value="Vyan Hall (Hostel-H)">Hostel H</SelectItem>
                  <SelectItem value="Ira Hall (Hostel-I)">Hostel I</SelectItem>
                  <SelectItem value="Tejas Hall (Hostel-J)">
                    Hostel J
                  </SelectItem>
                  <SelectItem value="Ambaram Hall (Hostel-K)">
                    Hostel K
                  </SelectItem>
                  <SelectItem value="Viyat Hall (Hostel-L)">
                    Hostel L
                  </SelectItem>
                  <SelectItem value="Anantam Hall (Hostel-M)">
                    Hostel M
                  </SelectItem>
                  <SelectItem value="Ananta Hall (Hostel-N)">
                    Hostel N
                  </SelectItem>
                  <SelectItem value="Vyom Hall (Hostel-O)">Hostel O</SelectItem>
                  <SelectItem value="Day Scholar">Day Scholar</SelectItem>
                  <SelectItem value="Off Campus">Off Campus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="my-hostel"
                checked={myHostelOnly}
                onCheckedChange={(checked) => {
                  setMyHostelOnly(checked);
                  if (checked) setHostel("all");
                }}
              />
              <Label htmlFor="my-hostel" className="text-sm cursor-pointer">
                My Hostel Only{" "}
                {userHostel && `(${getHostelShortName(userHostel)})`}
              </Label>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const isFromMyHostel =
                userHostel && product.sellerHostel === userHostel;

              return (
                <Card
                  key={product._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link to={`/product/${product._id}`}>
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={
                          product.images?.[0] ||
                          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
                        }
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                      {isFromMyHostel && (
                        <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
                          <Home className="h-3 w-3 mr-1" />
                          Your Hostel
                        </Badge>
                      )}
                      {product.sellerHostel && !isFromMyHostel && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2"
                        >
                          {getHostelShortName(product.sellerHostel)}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-2xl font-bold text-primary mb-2">
                        ₹{product.price}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="secondary">{product.condition}</Badge>
                        <span className="text-muted-foreground">
                          {product.sellerId?.name || "Unknown"}
                        </span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
