import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/config/api";
import { useNavigate } from "react-router-dom";
import { API_URL, API_BASE_URL } from "@/config/api";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Package,
  Star,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  BarChart3,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalReviews: number;
  pendingReports: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  hostel: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  averageRating: number;
  totalReviews: number;
  badges: {
    verified: boolean;
    trustedSeller: boolean;
    topRated: boolean;
  };
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: { name: string; profileImage: string };
  reviewedUser: { name: string; profileImage: string };
  listing: { title: string };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Lost & Found state
  const [lostFoundForm, setLostFoundForm] = useState({
    itemName: "",
    description: "",
    category: "",
    type: "found",
    location: "",
    foundDate: "",
    contactInfo: "Contact Admin Office - Extension 2500",
  });
  const [lostFoundImages, setLostFoundImages] = useState<File[]>([]);
  const [lostFoundPreviews, setLostFoundPreviews] = useState<string[]>([]);
  const [submittingLostFound, setSubmittingLostFound] = useState(false);

  useEffect(() => {
    const init = async () => {
      await checkAdminAccess();
      await fetchDashboardData();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!data.success || data.data.role !== "admin") {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Failed to verify admin access");
      navigate("/dashboard");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [statsRes, usersRes, reviewsRes] = await Promise.all([
<<<<<<< HEAD
        fetch("http://localhost:3000/api/admin/stats", {
          headers: { ...getAuthHeaders() },
        }),
        fetch("http://localhost:3000/api/admin/users?limit=10", {
          headers: { ...getAuthHeaders() },
        }),
        fetch("http://localhost:3000/api/admin/reviews?limit=10", {
          headers: { ...getAuthHeaders() },
=======
        fetch(`${API_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/users?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/reviews?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
>>>>>>> b1ca0a7da555f7558607031b660f6aecc305186e
        }),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const reviewsData = await reviewsRes.json();

      if (statsData.success) setStats(statsData.data.stats);
      if (usersData.success) setUsers(usersData.data);
      if (reviewsData.success) setReviews(reviewsData.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
<<<<<<< HEAD
      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );
=======
      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
>>>>>>> b1ca0a7da555f7558607031b660f6aecc305186e

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const toggleVerifiedBadge = async (
    userId: string,
    currentStatus: boolean
  ) => {
    try {
      const token = localStorage.getItem("token");
<<<<<<< HEAD
      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}/badges`,
        {
          method: "PUT",
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verified: !currentStatus }),
        }
      );
=======
      const response = await fetch(`${API_URL}/admin/users/${userId}/badges`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verified: !currentStatus }),
      });
>>>>>>> b1ca0a7da555f7558607031b660f6aecc305186e

      const data = await response.json();
      if (data.success) {
        toast.success("Badge updated successfully");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to update badge");
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const token = localStorage.getItem("token");
<<<<<<< HEAD
      const response = await fetch(
        `http://localhost:3000/api/admin/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: { ...getAuthHeaders() },
        }
      );
=======
      const response = await fetch(`${API_URL}/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
>>>>>>> b1ca0a7da555f7558607031b660f6aecc305186e

      const data = await response.json();
      if (data.success) {
        toast.success("Review deleted successfully");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, listings, and platform settings
            </p>
          </div>
          <Badge variant="destructive" className="text-sm">
            <ShieldCheck className="h-4 w-4 mr-1" />
            Admin Access
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalListings || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.soldListings || 0} sold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalReviews || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total platform reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pendingReports || 0}
              </div>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reviews">Review Moderation</TabsTrigger>
            <TabsTrigger value="lostfound">Lost & Found</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => setActiveTab("users")}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("reviews")}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Moderate Reviews
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.info("Coming soon!")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Platform Reports
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (
                      !window.confirm(
                        "Are you sure you want to delete ALL listings? This action cannot be undone."
                      )
                    )
                      return;
                    try {
                      const response = await fetch(
                        "http://localhost:3000/api/admin/listings/all",
                        {
                          method: "DELETE",
                          headers: { ...getAuthHeaders() },
                        }
                      );
                      const data = await response.json();
                      if (data.success) {
                        toast.success("All listings deleted successfully");
                        fetchDashboardData();
                      } else {
                        toast.error(
                          data.message || "Failed to delete listings"
                        );
                      }
                    } catch (err) {
                      toast.error("Failed to delete listings");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Listings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage users, roles, and badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.name}</h3>
                          {user.badges.verified && (
                            <Badge variant="secondary">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {user.badges.trustedSeller && (
                            <Badge variant="default">Trusted Seller</Badge>
                          )}
                          {user.badges.topRated && (
                            <Badge variant="default">Top Rated</Badge>
                          )}
                          {user.role === "admin" && (
                            <Badge variant="destructive">Admin</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.hostel || "No hostel"} • Joined{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        {user.totalReviews > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ⭐ {user.averageRating.toFixed(1)} (
                            {user.totalReviews} reviews)
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleVerifiedBadge(user._id, user.badges.verified)
                          }
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={user.isActive ? "destructive" : "default"}
                          onClick={() =>
                            toggleUserStatus(user._id, user.isActive)
                          }
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Ban
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Moderation</CardTitle>
                <CardDescription>
                  Monitor and manage user reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{review.comment}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>By: {review.reviewer.name}</span>
                          <span>•</span>
                          <span>For: {review.reviewedUser.name}</span>
                          <span>•</span>
                          <span>Item: {review.listing.title}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteReview(review._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lost & Found Tab */}
          <TabsContent value="lostfound" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Lost & Found Item</CardTitle>
                <CardDescription>
                  Add items that have been lost or found on campus
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmittingLostFound(true);

                    try {
                      const formData = new FormData();
                      formData.append("itemName", lostFoundForm.itemName);
                      formData.append("description", lostFoundForm.description);
                      formData.append("category", lostFoundForm.category);
                      formData.append("type", lostFoundForm.type);
                      formData.append("location", lostFoundForm.location);
                      formData.append("foundDate", lostFoundForm.foundDate);
                      formData.append("contactInfo", lostFoundForm.contactInfo);

                      lostFoundImages.forEach((file) => {
                        formData.append("images", file);
                      });

                      const response = await fetch(`${API_URL}/lost-found`, {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                        },
                        body: formData,
                      });

                      const data = await response.json();

                      if (data.success) {
                        toast.success("Item posted successfully");
                        setLostFoundForm({
                          itemName: "",
                          description: "",
                          category: "",
                          type: "found",
                          location: "",
                          foundDate: "",
                          contactInfo: "Contact Admin Office - Extension 2500",
                        });
                        setLostFoundImages([]);
                        setLostFoundPreviews([]);
                      } else {
                        toast.error(data.message || "Failed to post item");
                      }
                    } catch (err) {
                      toast.error("Failed to post item. Please try again.");
                    } finally {
                      setSubmittingLostFound(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={lostFoundForm.type}
                      onValueChange={(value) =>
                        setLostFoundForm({ ...lostFoundForm, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="found">Found</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      required
                      value={lostFoundForm.itemName}
                      onChange={(e) =>
                        setLostFoundForm({
                          ...lostFoundForm,
                          itemName: e.target.value,
                        })
                      }
                      placeholder="e.g., Blue Water Bottle"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={lostFoundForm.category}
                      onValueChange={(value) =>
                        setLostFoundForm({ ...lostFoundForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="ID Cards">ID Cards</SelectItem>
                        <SelectItem value="Keys">Keys</SelectItem>
                        <SelectItem value="Sports Equipment">
                          Sports Equipment
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      required
                      rows={3}
                      value={lostFoundForm.description}
                      onChange={(e) =>
                        setLostFoundForm({
                          ...lostFoundForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Detailed description of the item"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      required
                      value={lostFoundForm.location}
                      onChange={(e) =>
                        setLostFoundForm({
                          ...lostFoundForm,
                          location: e.target.value,
                        })
                      }
                      placeholder="e.g., Library, Hostel Block B"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="foundDate">
                      Date {lostFoundForm.type === "lost" ? "Lost" : "Found"}
                    </Label>
                    <Input
                      id="foundDate"
                      type="date"
                      required
                      value={lostFoundForm.foundDate}
                      onChange={(e) =>
                        setLostFoundForm({
                          ...lostFoundForm,
                          foundDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactInfo">Contact Information</Label>
                    <Input
                      id="contactInfo"
                      value={lostFoundForm.contactInfo}
                      onChange={(e) =>
                        setLostFoundForm({
                          ...lostFoundForm,
                          contactInfo: e.target.value,
                        })
                      }
                      placeholder="How to claim the item"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Images (Optional, max 3)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length + lostFoundImages.length > 3) {
                            toast.error("Maximum 3 images allowed");
                            return;
                          }
                          setLostFoundImages([...lostFoundImages, ...files]);
                          files.forEach((file) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setLostFoundPreviews((prev) => [
                                ...prev,
                                reader.result as string,
                              ]);
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                        disabled={lostFoundImages.length >= 3}
                      />
                    </div>
                    {lostFoundPreviews.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {lostFoundPreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-20 w-20 object-cover rounded"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0"
                              onClick={() => {
                                setLostFoundImages(
                                  lostFoundImages.filter((_, i) => i !== index)
                                );
                                setLostFoundPreviews(
                                  lostFoundPreviews.filter(
                                    (_, i) => i !== index
                                  )
                                );
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={submittingLostFound}>
                    {submittingLostFound ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Post Item
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
