import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Mail,
  MapPin,
  Phone,
  Star,
  ShoppingBag,
  Package,
  Users,
  UserPlus,
  UserMinus,
  CheckCircle2,
  Award,
  Zap,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL, getAuthHeaders } from "@/config/api";

interface User {
  _id: string;
  name: string;
  email: string;
  hostel: string;
  phoneNumber?: string;
  role: string;
  averageRating: number;
  totalReviews: number;
  followers: string[];
  following: string[];
  badges: {
    verified: boolean;
    trustedSeller: boolean;
    quickResponder: boolean;
    topRated: boolean;
  };
  stats: {
    totalSales: number;
    totalPurchases: number;
    responseRate: number;
    avgResponseTime: number;
  };
  createdAt: string;
}

interface Review {
  _id: string;
  reviewer: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  transactionType: string;
  createdAt: string;
}

interface Listing {
  _id: string;
  title: string;
  price: number;
  images: string[];
  status: string;
  soldAt?: string;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
}

const StatCard = ({ label, value, icon, iconColor }: StatCardProps) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={iconColor}>{icon}</div>
      </div>
    </CardContent>
  </Card>
);

const UserBadge = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <Badge variant="secondary" className="gap-1">
    {icon}
    {label}
  </Badge>
);

const ContactInfo = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="flex items-center gap-2 text-muted-foreground">
    {icon}
    <span>{text}</span>
  </div>
);

const calculateMonthlySales = (listings: Listing[]): number => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return listings.filter((listing) => {
    if (listing.status !== "sold" || !listing.soldAt) return false;
    const soldDate = new Date(listing.soldAt);
    return (
      soldDate.getMonth() === currentMonth &&
      soldDate.getFullYear() === currentYear
    );
  }).length;
};

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [monthlySales, setMonthlySales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        const [profileRes, reviewsRes, listingsRes, currentUserRes] =
          await Promise.all([
            fetch(`${API_URL}/users/${userId}/profile`, {
              headers: getAuthHeaders(),
            }),
            fetch(`${API_URL}/users/${userId}/reviews`, {
              headers: getAuthHeaders(),
            }),
            fetch(`${API_URL}/users/${userId}/listings`, {
              headers: getAuthHeaders(),
            }),
            fetch(`${API_URL}/auth/me`, { headers: getAuthHeaders() }),
          ]);

        const [profileData, reviewsData, listingsData, currentUserData] =
          await Promise.all([
            profileRes.json(),
            reviewsRes.json(),
            listingsRes.json(),
            currentUserRes.json(),
          ]);

        if (profileData.success) {
          setUser(profileData.data.user);
          setIsFollowing(profileData.data.isFollowing);
        } else {
          toast.error(profileData.message || "Failed to load profile");
        }

        if (reviewsData.success) setReviews(reviewsData.data);
        if (currentUserData.success) setCurrentUserId(currentUserData.data._id);

        if (listingsData.success) {
          setListings(listingsData.data);
          setMonthlySales(calculateMonthlySales(listingsData.data));
        }
      } catch (err) {
        toast.error("Failed to load profile data. Please try again.");
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleFollow = useCallback(async () => {
    if (!userId) return;

    setFollowLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (data.success) {
        setIsFollowing(!isFollowing);
        toast.success(
          isFollowing ? "Unfollowed successfully" : "Following user"
        );
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to update follow status");
      }
    } catch (err) {
      toast.error("Failed to update follow status. Please try again.");
    } finally {
      setFollowLoading(false);
    }
  }, [userId, isFollowing]);

  const getInitials = useCallback(
    (name: string) =>
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    []
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const renderStars = useCallback(
    (rating: number) => (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    ),
    []
  );

  const isOwnProfile = useMemo(
    () => currentUserId === userId,
    [currentUserId, userId]
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">User not found</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{user.name}</h1>
                      {user.badges.verified && (
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {user.badges.trustedSeller && (
                        <UserBadge
                          icon={<Award className="h-3 w-3" />}
                          label="Trusted Seller"
                        />
                      )}
                      {user.badges.topRated && (
                        <UserBadge
                          icon={<Star className="h-3 w-3" />}
                          label="Top Rated"
                        />
                      )}
                      {user.badges.quickResponder && (
                        <UserBadge
                          icon={<Zap className="h-3 w-3" />}
                          label="Quick Responder"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(user.averageRating)}
                      <span className="text-sm text-muted-foreground">
                        {user.averageRating.toFixed(1)} ({user.totalReviews}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollow}
                      disabled={followLoading}
                      variant={isFollowing ? "outline" : "default"}
                      className="gap-2"
                    >
                      {followLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {user.email && (
                    <ContactInfo
                      icon={<Mail className="h-4 w-4" />}
                      text={user.email}
                    />
                  )}
                  {user.hostel && (
                    <ContactInfo
                      icon={<MapPin className="h-4 w-4" />}
                      text={user.hostel}
                    />
                  )}
                  {user.phoneNumber && (
                    <ContactInfo
                      icon={<Phone className="h-4 w-4" />}
                      text={user.phoneNumber}
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            label="Total Sales"
            value={user.stats.totalSales}
            icon={<TrendingUp className="h-8 w-8" />}
            iconColor="text-green-500"
          />
          <StatCard
            label="This Month"
            value={monthlySales}
            icon={<Calendar className="h-8 w-8" />}
            iconColor="text-blue-500"
          />
          <StatCard
            label="Total Listings"
            value={listings.length}
            icon={<Package className="h-8 w-8" />}
            iconColor="text-purple-500"
          />
          <StatCard
            label="Followers"
            value={user.followers.length}
            icon={<Users className="h-8 w-8" />}
            iconColor="text-blue-500"
          />
          <StatCard
            label="Following"
            value={user.following.length}
            icon={<UserPlus className="h-8 w-8" />}
            iconColor="text-green-500"
          />
        </div>

        {/* Tabs for Listings and Reviews */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No listings yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <Card
                    key={listing._id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/product/${listing._id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-muted">
                        {listing.images && listing.images.length > 0 ? (
                          <img
                            src={`${API_BASE_URL}${listing.images[0]}`}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <Badge
                          className="absolute top-2 right-2"
                          variant={
                            listing.status === "available"
                              ? "default"
                              : listing.status === "sold"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {listing.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-1">
                        {listing.title}
                      </h3>
                      <p className="text-lg font-bold text-primary">
                        ₹{listing.price}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review._id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{review.reviewer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {review.comment}
                    </p>
                    <Badge variant="outline">{review.transactionType}</Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default UserProfile;
