import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL, API_BASE_URL } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
  recipientInitials: string;
  productTitle?: string;
}

const ChatDialog = ({
  open,
  onOpenChange,
  recipientId,
  recipientName,
  recipientInitials,
  productTitle,
}: ChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/chat/${recipientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Connect to WebSocket
    const newSocket = io(API_BASE_URL, {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    // Listen for new messages from others
    newSocket.on("message:new", (message: Message) => {
      setMessages((prev) => {
        // Check if message already exists
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    // Listen for sent message confirmation from server
    newSocket.on("message:received", (message: Message) => {
      setMessages((prev) => {
        // Replace temporary message with real one from server
        const filtered = prev.filter((m) => !m._id.startsWith("temp_"));
        // Check if message already exists
        if (filtered.some((m) => m._id === message._id)) {
          return filtered;
        }
        return [...filtered, message];
      });
    });

    setSocket(newSocket);

    // Load existing messages
    loadMessages();

    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recipientId]);

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messageContent = newMessage;

    // Create temporary message to show immediately
    const tempMessage: Message = {
      _id: `temp_${Date.now()}`,
      content: messageContent,
      senderId: {
        _id: currentUserId,
        name: "You",
      },
      createdAt: new Date().toISOString(),
    };

    // Add message to UI immediately
    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("message:send", {
      receiverId: recipientId,
      content: messageContent,
    });

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateString));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {recipientInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle>{recipientName}</DialogTitle>
              {productTitle && (
                <p className="text-sm text-muted-foreground">{productTitle}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.senderId._id === currentUserId;
                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
