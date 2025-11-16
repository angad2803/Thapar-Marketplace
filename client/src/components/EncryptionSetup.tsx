import { useEffect, useState } from "react";
import {
  generateKeyPair,
  encryptPrivateKey,
  storeKeys,
  hasKeys,
} from "@/lib/encryption";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, ShieldCheck } from "lucide-react";

interface EncryptionSetupProps {
  onComplete: () => void;
}

const EncryptionSetup = ({ onComplete }: EncryptionSetupProps) => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user needs to set up encryption
    if (!hasKeys()) {
      setOpen(true);
    } else {
      onComplete();
    }
  }, [onComplete]);

  const handleSetup = async () => {
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Generate key pair
      const { publicKey, privateKey } = generateKeyPair();

      // Encrypt private key with password
      const encryptedPrivateKey = encryptPrivateKey(privateKey, password);

      // Store keys locally
      storeKeys(publicKey, encryptedPrivateKey);

      // Send public key to server
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3000/api/auth/public-key",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ publicKey }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to save public key");
      }

      setOpen(false);
      onComplete();
    } catch (err) {
      console.error("Encryption setup error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to set up encryption"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <DialogTitle>Secure Your Messages</DialogTitle>
          </div>
          <DialogDescription>
            Set up end-to-end encryption to protect your conversations. Create a
            secure password that will be used to encrypt your private key.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Your password encrypts your messages locally. If you lose it, you
              won't be able to read your message history.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="password">Encryption Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            onClick={handleSetup}
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? "Setting up..." : "Enable Encryption"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            This password is only stored locally on your device and never sent
            to our servers.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EncryptionSetup;
