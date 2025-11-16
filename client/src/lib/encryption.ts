import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import CryptoJS from "crypto-js";

const ENCRYPTION_VERSION = "v1";

/**
 * Generate a new key pair for the user
 */
export const generateKeyPair = () => {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    privateKey: naclUtil.encodeBase64(keyPair.secretKey),
  };
};

/**
 * Encrypt the private key with user's password (for storage)
 */
export const encryptPrivateKey = (
  privateKey: string,
  password: string
): string => {
  return CryptoJS.AES.encrypt(privateKey, password).toString();
};

/**
 * Decrypt the private key with user's password
 */
export const decryptPrivateKey = (
  encryptedPrivateKey: string,
  password: string
): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, password);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Encrypt a message for a recipient
 */
export const encryptMessage = (
  message: string,
  recipientPublicKey: string,
  senderPrivateKey: string
): string => {
  try {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = naclUtil.decodeUTF8(message);
    const recipientPubKey = naclUtil.decodeBase64(recipientPublicKey);
    const senderPrivKey = naclUtil.decodeBase64(senderPrivateKey);

    const encrypted = nacl.box(
      messageUint8,
      nonce,
      recipientPubKey,
      senderPrivKey
    );

    // Combine nonce and encrypted message
    const fullMessage = new Uint8Array(nonce.length + encrypted.length);
    fullMessage.set(nonce);
    fullMessage.set(encrypted, nonce.length);

    // Return as base64 with version prefix
    return `${ENCRYPTION_VERSION}:${naclUtil.encodeBase64(fullMessage)}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt message");
  }
};

/**
 * Decrypt a message from a sender
 */
export const decryptMessage = (
  encryptedMessage: string,
  senderPublicKey: string,
  recipientPrivateKey: string
): string => {
  try {
    // Check version and extract encrypted data
    const [version, encryptedData] = encryptedMessage.split(":");
    if (version !== ENCRYPTION_VERSION) {
      throw new Error("Unsupported encryption version");
    }

    const fullMessage = naclUtil.decodeBase64(encryptedData);
    const nonce = fullMessage.slice(0, nacl.box.nonceLength);
    const encrypted = fullMessage.slice(nacl.box.nonceLength);

    const senderPubKey = naclUtil.decodeBase64(senderPublicKey);
    const recipientPrivKey = naclUtil.decodeBase64(recipientPrivateKey);

    const decrypted = nacl.box.open(
      encrypted,
      nonce,
      senderPubKey,
      recipientPrivKey
    );

    if (!decrypted) {
      throw new Error("Failed to decrypt message");
    }

    return naclUtil.encodeUTF8(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    return "[Unable to decrypt message]";
  }
};

/**
 * Store keys in localStorage (encrypted private key)
 */
export const storeKeys = (publicKey: string, encryptedPrivateKey: string) => {
  localStorage.setItem("publicKey", publicKey);
  localStorage.setItem("encryptedPrivateKey", encryptedPrivateKey);
};

/**
 * Get keys from localStorage
 */
export const getStoredKeys = () => {
  return {
    publicKey: localStorage.getItem("publicKey"),
    encryptedPrivateKey: localStorage.getItem("encryptedPrivateKey"),
  };
};

/**
 * Check if user has keys set up
 */
export const hasKeys = (): boolean => {
  const { publicKey, encryptedPrivateKey } = getStoredKeys();
  return !!(publicKey && encryptedPrivateKey);
};

/**
 * Get decrypted private key (requires password)
 */
export const getPrivateKey = (password: string): string | null => {
  const { encryptedPrivateKey } = getStoredKeys();
  if (!encryptedPrivateKey) return null;

  try {
    return decryptPrivateKey(encryptedPrivateKey, password);
  } catch (error) {
    console.error("Failed to decrypt private key:", error);
    return null;
  }
};
