import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const PostItem = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    isNegotiable: true,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + selectedFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (files.length + selectedFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("Please drop image files only");
      return;
    }

    const validFiles = imageFiles.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("location", formData.location || "");
      formDataToSend.append("isNegotiable", formData.isNegotiable.toString());

      selectedFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/listings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        // Show validation errors if available
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((error: any) => {
            toast.error(`${error.field}: ${error.message}`);
          });
        } else {
          throw new Error(data.message || "Failed to create listing");
        }
        return;
      }

      toast.success("Item posted successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to post item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Post New Item</h1>
          <p className="text-muted-foreground">
            List your item for sale on the campus marketplace
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Basic Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Essential details about your item
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Item Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Calculus Textbook - 10th Edition"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold"
                  >
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item in detail... Include condition, age, features, or any other relevant information"
                    rows={5}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="resize-none"
                    required
                  />
                </div>
              </div>

              {/* Pricing & Category Section */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Pricing & Category
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Set your price and categorize your item
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-semibold">
                      Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="h-11 pl-8"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <input
                        type="checkbox"
                        id="negotiable"
                        checked={formData.isNegotiable}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isNegotiable: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label
                        htmlFor="negotiable"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Price is negotiable
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      required
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Books">📚 Books</SelectItem>
                        <SelectItem value="Electronics">
                          💻 Electronics
                        </SelectItem>
                        <SelectItem value="Furniture">🪑 Furniture</SelectItem>
                        <SelectItem value="Clothing">👕 Clothing</SelectItem>
                        <SelectItem value="Sports">⚽ Sports</SelectItem>
                        <SelectItem value="Stationery">
                          ✏️ Stationery
                        </SelectItem>
                        <SelectItem value="Vehicles">🚗 Vehicles</SelectItem>
                        <SelectItem value="Services">🔧 Services</SelectItem>
                        <SelectItem value="Other">📦 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Item Details Section */}
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Item Details
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Additional information about the item
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="condition"
                      className="text-sm font-semibold"
                    >
                      Condition <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) =>
                        setFormData({ ...formData, condition: value })
                      }
                      required
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">🆕 New</SelectItem>
                        <SelectItem value="Like New">✨ Like New</SelectItem>
                        <SelectItem value="Good">👍 Good</SelectItem>
                        <SelectItem value="Fair">👌 Fair</SelectItem>
                        <SelectItem value="Poor">⚠️ Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-semibold">
                      Pickup Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Hostel J, Room 234"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional - Where buyers can pick up the item
                    </p>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    Images <span className="text-red-500">*</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Add photos to showcase your item
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-muted p-4 mb-4 group-hover:bg-primary/10 transition-colors">
                      <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-base font-medium mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 5MB • Maximum 5 images
                    </p>
                  </div>
                </div>

                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">
                        {selectedFiles.length}{" "}
                        {selectedFiles.length === 1 ? "image" : "images"}{" "}
                        selected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {5 - selectedFiles.length} remaining
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-center text-muted-foreground mt-1">
                            Image {index + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Item"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-base font-semibold"
                  onClick={() => navigate("/dashboard")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostItem;
