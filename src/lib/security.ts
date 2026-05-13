// import CryptoJS from 'crypto-js';

// // In a production environment, this key should ideally be 
// // pulled from an environment variable (process.env.REACT_APP_ENCRYPTION_KEY)
// const SECRET_KEY = 'smrt-wallet-secure-storage-key';

// export const SecureStorage = {
//   // Encrypt and save
//   setItem: (key: string, value: any) => {
//     try {
//       const data = JSON.stringify(value);
//       const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
//       localStorage.setItem(key, encrypted);
//     } catch (error) {
//       console.error("Encryption error:", error);
//     }
//   },

//   // Decrypt and retrieve
//   getItem: (key: string) => {
//     try {
//       const encrypted = localStorage.getItem(key);
//       if (!encrypted) return null;

//       const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
//       const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      
//       return JSON.parse(decryptedData);
//     } catch (error) {
//       console.error("Decryption error:", error);
//       return null;
//     }
//   },

//   removeItem: (key: string) => localStorage.removeItem(key),
//   clear: () => localStorage.clear()
// };



import CryptoJS from 'crypto-js';

const SECRET_KEY = 'SMRT_SECURE_ENCRYPTION_KEY_2026'; // Keep this consistent

export const SecureStorage = {
  setItem: (key: string, value: any) => {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString();
    localStorage.setItem(key, encrypted);
  },
  getItem: (key: string) => {
    const data = localStorage.getItem(key);
    if (!data) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      console.error("Decryption error", e);
      return null;
    }
  },
  removeItem: (key: string) => localStorage.removeItem(key)
};