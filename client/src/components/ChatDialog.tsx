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
import { Send, Lock } from "lucide-react";
import {
  encryptMessage,
  decryptMessage,
  getStoredKeys,
  getPrivateKey,
} from "@/lib/encryption";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    name: string;
    publicKey?: string;
  };
  createdAt: string;
  isEncrypted?: boolean;
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
  const [recipientPublicKey, setRecipientPublicKey] = useState<string | null>(
    null
  );
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [encryptionError, setEncryptionError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch recipient's public key
  const fetchRecipientPublicKey = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/auth/public-key/${recipientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success && data.data.publicKey) {
        setRecipientPublicKey(data.data.publicKey);
      } else {
        setEncryptionError("Recipient hasn't set up encryption yet");
      }
    } catch (error) {
      console.error("Error fetching recipient public key:", error);
      setEncryptionError("Could not load encryption keys");
    }
  };

  const decryptMessageContent = (
    message: Message,
    privateKey: string
  ): string => {
    if (!message.isEncrypted) {
      return message.content;
    }

    try {
      const senderPublicKey = message.senderId.publicKey;
      if (!senderPublicKey) {
        return "[Encrypted message - sender key unavailable]";
      }
      return decryptMessage(message.content, senderPublicKey, privateKey);
    } catch (error) {
      console.error("Decryption error:", error);
      return "[Unable to decrypt message]";
    }
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/chat/${recipientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Decrypt messages if encryption password is available
        const { encryptedPrivateKey } = getStoredKeys();
        if (encryptedPrivateKey && encryptionPassword) {
          const privateKey = getPrivateKey(encryptionPassword);
          if (privateKey) {
            const decryptedMessages = data.data.map((msg: Message) => ({
              ...msg,
              content: decryptMessageContent(msg, privateKey),
            }));
            setMessages(decryptedMessages);
            return;
          }
        }
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

    // Fetch recipient's public key
    fetchRecipientPublicKey();

    // Check if user needs to enter encryption password
    const { publicKey, encryptedPrivateKey } = getStoredKeys();
    if (publicKey && encryptedPrivateKey && !encryptionPassword) {
      setShowPasswordPrompt(true);
      // Don't return early - still set up socket connection below
    }

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

        // Decrypt if encrypted
        if (message.isEncrypted && encryptionPassword) {
          const privateKey = getPrivateKey(encryptionPassword);
          if (privateKey) {
            message.content = decryptMessageContent(message, privateKey);
          }
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

        // Decrypt if encrypted
        if (message.isEncrypted && encryptionPassword) {
          const privateKey = getPrivateKey(encryptionPassword);
          if (privateKey) {
            message.content = decryptMessageContent(message, privateKey);
          }
        }

        return [...filtered, message];
      });
    });

    setSocket(newSocket);

    // Load existing messages (will show encrypted content if password not entered yet)
    loadMessages();

    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recipientId, encryptionPassword]);

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
    let encryptedContent = messageContent;
    let isEncrypted = false;

    // Encrypt message if both users have public keys
    if (recipientPublicKey && encryptionPassword) {
      try {
        const privateKey = getPrivateKey(encryptionPassword);
        if (privateKey) {
          encryptedContent = encryptMessage(
            messageContent,
            recipientPublicKey,
            privateKey
          );
          isEncrypted = true;
        }
      } catch (error) {
        console.error("Encryption error:", error);
        setEncryptionError("Failed to encrypt message");
        return;
      }
    }

    // Create temporary message to show immediately (with original content)
    const tempMessage: Message = {
      _id: `temp_${Date.now()}`,
      content: messageContent, // Show unencrypted locally
      senderId: {
        _id: currentUserId,
        name: "You",
      },
      createdAt: new Date().toISOString(),
      isEncrypted,
    };

    // Add message to UI immediately
    setMessages((prev) => [...prev, tempMessage]);

    socket.emit("message:send", {
      receiverId: recipientId,
      content: encryptedContent, // Send encrypted to server
      isEncrypted,
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
        {showPasswordPrompt ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="space-y-4 w-full max-w-sm">
              <div className="text-center mb-6">
                <Lock className="h-12 w-12 mx-auto text-primary mb-3" />
                <h3 className="text-lg font-semibold">
                  Enter Encryption Password
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your messages are end-to-end encrypted
                </p>
              </div>
              <Input
                type="password"
                placeholder="Encryption password"
                value={encryptionPassword}
                onChange={(e) => setEncryptionPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && encryptionPassword) {
                    setShowPasswordPrompt(false);
                  }
                }}
              />
              <Button
                className="w-full"
                onClick={() => setShowPasswordPrompt(false)}
                disabled={!encryptionPassword}
              >
                Unlock Messages
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {recipientInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle>{recipientName}</DialogTitle>
                    {recipientPublicKey && (
                      <span title="End-to-end encrypted">
                        <Lock className="h-3 w-3 text-green-600" />
                      </span>
                    )}
                  </div>
                  {productTitle && (
                    <p className="text-sm text-muted-foreground">
                      {productTitle}
                    </p>
                  )}
                </div>
              </div>
              {encryptionError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{encryptionError}</AlertDescription>
                </Alert>
              )}
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
                          <p className="text-sm break-words">
                            {message.content}
                          </p>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
