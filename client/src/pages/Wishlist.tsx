import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { API_URL, API_BASE_URL } from "@/config/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";

interface Listing {
  _id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  description: string;
  images: string[];
  status: string;
  sellerId: {
    _id: string;
    name: string;
    hostel: string;
  };
}

const Wishlist = () => {
  const [wishlist, setWishlist] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await fetch(`${API_URL}/listings/wishlist`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setWishlist(data.data);
      } else {
        toast.error(data.message || "Failed to load wishlist");
      }
    } catch (err) {
      toast.error("Failed to load wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (listingId: string) => {
    setRemovingId(listingId);
    try {
      const response = await fetch(
        `${API_URL}/listings/${listingId}/wishlist`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setWishlist(wishlist.filter((item) => item._id !== listingId));
        toast.success("Removed from wishlist");
      } else {
        toast.error(data.message || "Failed to remove from wishlist");
      }
    } catch (err) {
      toast.error("Failed to remove from wishlist. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const viewProduct = (id: string) => {
    navigate(`/product/${id}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
            </p>
          </div>

          {wishlist.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <Heart className="h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start adding items you're interested in!
                  </p>
                  <Button onClick={() => navigate("/dashboard")}>
                    Browse Products
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((listing) => (
                <Card
                  key={listing._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div onClick={() => viewProduct(listing._id)}>
                    <div className="aspect-video relative bg-gray-200 dark:bg-gray-800">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={`${API_BASE_URL}${listing.images[0]}`}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                      {listing.status !== "available" && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Badge
                            variant="destructive"
                            className="text-lg px-4 py-2"
                          >
                            {listing.status === "sold" ? "Sold" : "Pending"}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {listing.title}
                        </h3>
                      </div>
                      <p className="text-2xl font-bold text-primary mb-3">
                        ₹{listing.price}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{listing.condition}</Badge>
                        <Badge variant="outline">{listing.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {listing.description}
                      </p>
                      <div className="text-sm text-muted-foreground mb-3">
                        <p className="font-medium">{listing.sellerId.name}</p>
                        <p>{listing.sellerId.hostel}</p>
                      </div>
                    </CardContent>
                  </div>
                  <div className="px-4 pb-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(listing._id);
                      }}
                      disabled={removingId === listing._id}
                    >
                      {removingId === listing._id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="mr-2 h-4 w-4" fill="currentColor" />
                      )}
                      Remove from Wishlist
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
