const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

// Utility: Convert bytes <-> Base64 safely
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // process in chunks to avoid call stack overflow
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derive a 256-bit key using SHA-256 hash
async function getKey() {
  const enc = new TextEncoder();
  const keyData = enc.encode(SECRET_KEY);

  // Hash ensures consistent key length (256-bit)
  const hash = await crypto.subtle.digest("SHA-256", keyData);
  return await crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

// Encrypt data (handles both primitives & objects)
export async function encryptData(data) {
  try {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const payload = {
      __type: typeof data,
      value: data,
    };

    const encodedData = new TextEncoder().encode(JSON.stringify(payload));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedData);

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return arrayBufferToBase64(combined);
  } catch (err) {
    console.error("Encryption failed:", err);
    return null;
  }
}

// Decrypt data (restores original type)
export async function decryptData(encryptedBase64) {
  try {
    const key = await getKey();
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedBase64));
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData);
    const decoded = new TextDecoder().decode(decrypted);
    const parsed = JSON.parse(decoded);

    switch (parsed.__type) {
      case "number":
        return Number(parsed.value);
      case "boolean":
        return Boolean(parsed.value);
      case "string":
        return String(parsed.value);
      case "object":
        return parsed.value;
      default:
        return parsed.value;
    }
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
}

// Safely store in localStorage
export async function setEncryptedItem(key, value) {
  try {
    const encrypted = await encryptData(value);
    if (encrypted) localStorage.setItem(key, encrypted);
  } catch (err) {
    console.error("Failed to set encrypted item:", err);
  }
}

// Retrieve from localStorage
export async function getDecryptedItem(key) {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  return await decryptData(encrypted);
}

// Remove item
export function removeEncryptedItem(key) {
  localStorage.removeItem(key);
}

// (async () => {
//   const data = { name: "Alice", role: "admin", age: 27 };
//   await setEncryptedItem("userData", data);

//   console.log("Encrypted:", localStorage.getItem("userData"));

//   const decrypted = await getDecryptedItem("userData");
//   console.log("Decrypted:", decrypted);
// })();
