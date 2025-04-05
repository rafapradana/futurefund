import { InvestmentInput } from "./calculator";

// Konfigurasi database
const DB_NAME = "futureFundDB";
const DB_VERSION = 1;
const STORE_NAME = "investmentInput";
const INPUT_KEY = "currentInput";

// Fungsi untuk menginisialisasi database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject("Tidak dapat membuka database");
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Buat object store jika belum ada
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

// Fungsi untuk menyimpan data input
export const saveInputData = async (input: InvestmentInput): Promise<void> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put(input, INPUT_KEY);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error("Error saving data:", event);
        reject("Gagal menyimpan data");
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error in saveInputData:", error);
    throw error;
  }
};

// Fungsi untuk mengambil data input terakhir
export const getInputData = async (): Promise<InvestmentInput | null> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.get(INPUT_KEY);
      
      request.onsuccess = () => {
        const data = request.result as InvestmentInput;
        resolve(data || null);
      };
      
      request.onerror = (event) => {
        console.error("Error retrieving data:", event);
        reject("Gagal mengambil data");
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error in getInputData:", error);
    return null;
  }
};

// Fungsi untuk menghapus data input
export const clearInputData = async (): Promise<void> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.delete(INPUT_KEY);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error("Error clearing data:", event);
        reject("Gagal menghapus data");
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error in clearInputData:", error);
    throw error;
  }
}; 