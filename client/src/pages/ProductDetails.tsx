import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useParams } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();

  // Mock product data
  const product = {
    id,
    title: "Calculus Textbook - 12th Edition",
    price: 45,
    condition: "Good",
    category: "Books",
    description: "Well-maintained calculus textbook, perfect for students. All pages intact, minimal highlighting. Includes practice problems and solutions manual.",
    seller: {
      name: "John Doe",
      initials: "JD",
      memberSince: "2023",
    },
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800",
    ],
    postedDate: "2 days ago",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Image Section */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-muted-foreground mb-4">{product.postedDate}</p>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{product.condition}</Badge>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <p className="text-4xl font-bold text-primary">${product.price}</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {product.seller.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{product.seller.name}</p>
                    <p className="text-sm text-muted-foreground">Member since {product.seller.memberSince}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-accent hover:bg-accent-light">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Seller
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
