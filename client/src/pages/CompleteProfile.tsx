import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_URL, getAuthHeaders } from "@/config/api";

const CompleteProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hostel: "",
    roomNumber: "",
    phoneNumber: "",
    upiId: "",
  });

  const hostels = [
    "Agira Hall (Hostel-A)",
    "Amritam Hall (Hostel-B)",
    "Prithvi Hall (Hostel-C)",
    "Neeram Hall (Hostel-D)",
    "Vyan Hall (Hostel-H)",
    "Tejas Hall (Hostel-J)",
    "Ambaram Hall (Hostel-K)",
    "Viyat Hall (Hostel-L)",
    "Anantam Hall (Hostel-M)",
    "Vyom Hall (Hostel-O)",
    "Vasudha Hall - Block E (Hostel-E)",
    "Vasudha Hall - Block G (Hostel-G)",
    "Ira Hall (Hostel-I)",
    "Ananta Hall (Hostel-N)",
    "Dhriti Hall (Hostel-PG)",
    "Vahni Hall (Hostel-Q)",
    "Hostel-FRF/G",
    "Day Scholar",
    "Off Campus",
  ];

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Only send non-empty fields
      const payload: {
        hostel: string;
        roomNumber?: string;
        phoneNumber?: string;
        upiId?: string;
      } = {
        hostel: formData.hostel,
      };

      if (formData.roomNumber?.trim()) {
        payload.roomNumber = formData.roomNumber.trim();
      }

      if (formData.phoneNumber?.trim()) {
        payload.phoneNumber = formData.phoneNumber.trim();
      }

      if (formData.upiId?.trim()) {
        payload.upiId = formData.upiId.trim();
      }

      console.log("Sending payload:", payload); // Debug log

      const response = await fetch(
        `${API_URL}/auth/complete-profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log("Response:", data); // Debug log

      if (data.success) {
        toast({
          title: "Success!",
          description: "Profile completed successfully",
        });
        navigate("/dashboard");
      } else {
        // Show detailed error if available
        const errorMessage = data.errors
          ? data.errors
              .map(
                (e: { field: string; message: string }) =>
                  `${e.field}: ${e.message}`
              )
              .join(", ")
          : data.message || "Failed to complete profile";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Submit error:", error); // Debug log
      toast({
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <ShoppingBag className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-foreground">
              UniMarket
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to Thapar Marketplace!</CardTitle>
            <CardDescription>
              Please complete your profile to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hostel">
                  Hostel <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.hostel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, hostel: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostels.map((hostel) => (
                      <SelectItem key={hostel} value={hostel}>
                        {hostel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number (Optional)</Label>
                <Input
                  id="roomNumber"
                  type="text"
                  placeholder="e.g., 101"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g., 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID (Optional)</Label>
                <Input
                  id="upiId"
                  type="text"
                  placeholder="e.g., yourname@paytm"
                  value={formData.upiId}
                  onChange={(e) =>
                    setFormData({ ...formData, upiId: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Add your UPI ID to receive payments when you sell items
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData.hostel}
              >
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;
