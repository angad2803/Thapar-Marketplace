import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { API_URL, API_BASE_URL } from "@/config/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface LostFoundItem {
  _id: string;
  itemName: string;
  description: string;
  category: string;
  type: "lost" | "found";
  location: string;
  foundDate: string;
  images: string[];
  status: "active" | "claimed" | "returned";
  contactInfo: string;
  createdAt: string;
}

const LostAndFound = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<"all" | "lost" | "found">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    let filtered = items;

    if (activeType !== "all") {
      filtered = filtered.filter((item) => item.type === activeType);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  }, [items, activeType, categoryFilter]);

  const loadItems = async () => {
    try {
      const response = await fetch(`${API_URL}/lost-found`);
      const data = await response.json();

      if (data.success) {
        setItems(data.data);
      } else {
        toast.error(data.message || "Failed to load items");
      }
    } catch (err) {
      toast.error("Failed to load items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "claimed":
        return <Badge variant="secondary">Claimed</Badge>;
      case "returned":
        return <Badge variant="outline">Returned</Badge>;
      default:
        return null;
    }
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Lost & Found</h1>
            <p className="text-muted-foreground">
              Items reported lost or found on campus
            </p>
          </div>

          {/* Info Alert */}
          <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Found your item?
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    If you see your lost item below, please visit the Admin
                    Office with valid ID proof to claim it. For found items,
                    contact the number or email provided.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <Tabs
              value={activeType}
              onValueChange={(value) =>
                setActiveType(value as "all" | "lost" | "found")
              }
              className="flex-1"
            >
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="lost">Lost</TabsTrigger>
                <TabsTrigger value="found">Found</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-4">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"} found
          </p>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or check back later
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item._id} className="overflow-hidden">
                  <div className="aspect-video relative bg-gray-200 dark:bg-gray-800">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={`${API_BASE_URL}${item.images[0]}`}
                        alt={item.itemName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image available
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge
                        variant={
                          item.type === "lost" ? "destructive" : "default"
                        }
                      >
                        {item.type.toUpperCase()}
                      </Badge>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg mb-1">
                        {item.itemName}
                      </h3>
                      <Badge variant="outline" className="mb-2">
                        {item.category}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {item.type === "lost" ? "Lost on" : "Found on"}{" "}
                          {formatDate(item.foundDate)}
                        </span>
                      </div>
                    </div>

                    {item.status === "active" && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-semibold mb-2">
                          Contact Info:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.contactInfo}
                        </p>
                      </div>
                    )}

                    {item.status !== "active" && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground italic">
                          This item has been{" "}
                          {item.status === "claimed" ? "claimed" : "returned"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LostAndFound;
