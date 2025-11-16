import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { API_URL, API_BASE_URL } from "@/config/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Loader2, Eye } from "lucide-react";
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
  createdAt: string;
}

const MyListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    try {
      const response = await fetch(`${API_URL}/listings/my-listings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setListings(data.data);
      } else {
        toast.error(data.message || "Failed to load your listings");
      }
    } catch (err) {
      toast.error("Failed to load your listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedListing) return;

    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/listings/${selectedListing}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setListings(listings.filter((item) => item._id !== selectedListing));
        toast.success("Listing deleted successfully");
        setDeleteDialogOpen(false);
      } else {
        toast.error(data.message || "Failed to delete listing");
      }
    } catch (err) {
      toast.error("Failed to delete listing. Please try again.");
    } finally {
      setDeleting(false);
      setSelectedListing(null);
    }
  };

  const confirmDelete = (listingId: string) => {
    setSelectedListing(listingId);
    setDeleteDialogOpen(true);
  };

  const viewProduct = (id: string) => {
    navigate(`/product/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Listings</h1>
              <p className="text-muted-foreground">
                {listings.length}{" "}
                {listings.length === 1 ? "listing" : "listings"}
              </p>
            </div>
            <Button onClick={() => navigate("/post-item")}>
              Post New Item
            </Button>
          </div>

          {listings.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Pencil className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    No listings yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start selling by posting your first item!
                  </p>
                  <Button onClick={() => navigate("/post-item")}>
                    Post Your First Item
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card
                  key={listing._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
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
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={
                          listing.status === "available"
                            ? "default"
                            : listing.status === "sold"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {listing.status.charAt(0).toUpperCase() +
                          listing.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Posted on {formatDate(listing.createdAt)}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-3">
                      ₹{listing.price}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{listing.condition}</Badge>
                      <Badge variant="outline">{listing.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => viewProduct(listing._id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => confirmDelete(listing._id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              listing and remove it from the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyListings;
