import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { API_URL, API_BASE_URL } from "@/config/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Heart, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ChatDialog from "@/components/ChatDialog";
import { useParams } from "react-router-dom";

interface Listing {
  _id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  description: string;
  sellerId: {
    _id: string;
    name: string;
    hostel: string;
    upiId?: string;
    phoneNumber?: string;
  };
  images: string[];
  status: string;
  createdAt: string;
}

const ProductDetails = () => {
  const { id } = useParams();
  const [chatOpen, setChatOpen] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const loadListing = async () => {
      try {
        const response = await fetch(`${API_URL}/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setListing(data.data);
        } else {
          setError(data.message || "Failed to load product");
        }
      } catch (err) {
        setError("Failed to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id]);

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/listings/wishlist`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          const isInWishlist = data.data.some(
            (item: Listing) => item._id === id
          );
          setIsWishlisted(isInWishlist);
        }
      } catch (err) {
        console.error("Failed to check wishlist status:", err);
      }
    };

    if (id) {
      checkWishlistStatus();
    }
  }, [id]);

  const handleWishlist = async () => {
    if (wishlistLoading) return;

    setWishlistLoading(true);
    try {
      const method = isWishlisted ? "DELETE" : "POST";
      const response = await fetch(`${API_URL}/listings/${id}/wishlist`, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsWishlisted(!isWishlisted);
        toast.success(
          isWishlisted ? "Removed from wishlist" : "Added to wishlist"
        );
      } else {
        toast.error(data.message || "Failed to update wishlist");
      }
    } catch (err) {
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return created.toLocaleDateString();
  };

  const isOwnListing = listing?.sellerId._id === currentUserId;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {loading ? (
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      ) : error || !listing ? (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Product not found"}</AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Image Section */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={listing.images[0] || "/placeholder.jpg"}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <p className="text-muted-foreground mb-4">
                  {formatDate(listing.createdAt)}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{listing.condition}</Badge>
                  <Badge variant="outline">{listing.category}</Badge>
                  {listing.status !== "available" && (
                    <Badge variant="destructive">
                      {listing.status === "sold" ? "Sold" : "Pending"}
                    </Badge>
                  )}
                </div>
                <p className="text-4xl font-bold text-primary">
                  ₹{listing.price}
                </p>
              </div>

              <div>
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(listing.sellerId.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{listing.sellerId.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {listing.sellerId.hostel}
                      </p>
                      {listing.sellerId.phoneNumber && (
                        <p className="text-sm text-muted-foreground">
                          📞 {listing.sellerId.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {listing.sellerId.upiId && !isOwnListing && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        💳 UPI Payment
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-mono">
                        {listing.sellerId.upiId}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        Contact seller to arrange payment and delivery
                      </p>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {isOwnListing ? (
                    <Alert>
                      <AlertDescription>This is your listing</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        onClick={() => setChatOpen(true)}
                        disabled={listing.status !== "available"}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {listing.status === "available"
                          ? "Contact Seller"
                          : "Not Available"}
                      </Button>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="flex-1"
                          onClick={handleWishlist}
                          disabled={
                            wishlistLoading || listing.status !== "available"
                          }
                          title={
                            isWishlisted
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          <Heart
                            className="h-4 w-4"
                            fill={isWishlisted ? "currentColor" : "none"}
                          />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {listing && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          recipientId={listing.sellerId._id}
          recipientName={listing.sellerId.name}
          recipientInitials={getInitials(listing.sellerId.name)}
          productTitle={listing.title}
        />
      )}
    </div>
  );
};

export default ProductDetails;
