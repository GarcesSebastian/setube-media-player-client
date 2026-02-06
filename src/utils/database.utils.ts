const DB_NAME = "SetubeMediaDB";
const DB_VERSION = 1;

export interface SearchHistory {
    id?: number;
    query: string;
    timestamp: number;
    results: any[];
}

export interface MediaMetadata {
    id?: number;
    videoId: string;
    url: string;
    title: string;
    duration: number;
    thumbnail: string;
    author: { name: string };
    timestamp: number;
}

export interface ConversionHistory {
    id?: number;
    videoId: string;
    title: string;
    format: string;
    quality: string;
    timestamp: number;
}

class DatabaseUtils {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains("searches")) {
                    const searchStore = db.createObjectStore("searches", {
                        keyPath: "id",
                        autoIncrement: true,
                    });
                    searchStore.createIndex("query", "query", { unique: false });
                    searchStore.createIndex("timestamp", "timestamp", { unique: false });
                }

                if (!db.objectStoreNames.contains("metadata")) {
                    const metadataStore = db.createObjectStore("metadata", {
                        keyPath: "id",
                        autoIncrement: true,
                    });
                    metadataStore.createIndex("videoId", "videoId", { unique: false });
                    metadataStore.createIndex("timestamp", "timestamp", { unique: false });
                }

                if (!db.objectStoreNames.contains("conversions")) {
                    const conversionStore = db.createObjectStore("conversions", {
                        keyPath: "id",
                        autoIncrement: true,
                    });
                    conversionStore.createIndex("videoId", "videoId", { unique: false });
                    conversionStore.createIndex("timestamp", "timestamp", { unique: false });
                }
            };
        });
    }

    private async ensureDB(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.init();
        }
        return this.db!;
    }

    async addSearch(query: string, results: any[]): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["searches"], "readwrite");
            const store = transaction.objectStore("searches");

            const searchData: SearchHistory = {
                query,
                results,
                timestamp: Date.now(),
            };

            const request = store.add(searchData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getSearches(limit: number = 50): Promise<SearchHistory[]> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["searches"], "readonly");
            const store = transaction.objectStore("searches");
            const index = store.index("timestamp");

            const request = index.openCursor(null, "prev");
            const results: SearchHistory[] = [];
            let count = 0;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor && count < limit) {
                    results.push(cursor.value);
                    count++;
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteSearch(id: number): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["searches"], "readwrite");
            const store = transaction.objectStore("searches");
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearSearches(): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["searches"], "readwrite");
            const store = transaction.objectStore("searches");
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async addMetadata(metadata: Omit<MediaMetadata, "id" | "timestamp">): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["metadata"], "readwrite");
            const store = transaction.objectStore("metadata");

            const data: MediaMetadata = {
                ...metadata,
                timestamp: Date.now(),
            };

            const request = store.add(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getMetadata(limit: number = 50): Promise<MediaMetadata[]> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["metadata"], "readonly");
            const store = transaction.objectStore("metadata");
            const index = store.index("timestamp");

            const request = index.openCursor(null, "prev");
            const results: MediaMetadata[] = [];
            let count = 0;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor && count < limit) {
                    results.push(cursor.value);
                    count++;
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteMetadata(id: number): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["metadata"], "readwrite");
            const store = transaction.objectStore("metadata");
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearMetadata(): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["metadata"], "readwrite");
            const store = transaction.objectStore("metadata");
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async addConversion(conversion: Omit<ConversionHistory, "id" | "timestamp">): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["conversions"], "readwrite");
            const store = transaction.objectStore("conversions");

            const data: ConversionHistory = {
                ...conversion,
                timestamp: Date.now(),
            };

            const request = store.add(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getConversions(limit: number = 50): Promise<ConversionHistory[]> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["conversions"], "readonly");
            const store = transaction.objectStore("conversions");
            const index = store.index("timestamp");

            const request = index.openCursor(null, "prev");
            const results: ConversionHistory[] = [];
            let count = 0;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor && count < limit) {
                    results.push(cursor.value);
                    count++;
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteConversion(id: number): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["conversions"], "readwrite");
            const store = transaction.objectStore("conversions");
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearConversions(): Promise<void> {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(["conversions"], "readwrite");
            const store = transaction.objectStore("conversions");
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearAll(): Promise<void> {
        await Promise.all([
            this.clearSearches(),
            this.clearMetadata(),
            this.clearConversions(),
        ]);
    }
}

export const db = new DatabaseUtils();
