import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { API_URL } from "@/config/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatDialog from "@/components/ChatDialog";

interface Conversation {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    email: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<{
    recipientId: string;
    recipientName: string;
    recipientInitials: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Messages</h1>
          <p className="text-muted-foreground">
            Your conversations with buyers and sellers
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start a conversation by messaging a seller on a product listing
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Card
                  key={conversation._id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() =>
                    setSelectedChat({
                      recipientId: conversation.otherUser._id,
                      recipientName: conversation.otherUser.name,
                      recipientInitials: getInitials(
                        conversation.otherUser.name
                      ),
                    })
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(conversation.otherUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">
                            {conversation.otherUser.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {selectedChat && (
        <ChatDialog
          open={!!selectedChat}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedChat(null);
              // Reload conversations when chat closes
              loadConversations();
            }
          }}
          recipientId={selectedChat.recipientId}
          recipientName={selectedChat.recipientName}
          recipientInitials={selectedChat.recipientInitials}
        />
      )}
    </div>
  );
};

export default Messages;
