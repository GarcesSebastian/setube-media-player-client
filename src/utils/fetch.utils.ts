export class FetchUtils {
    private static baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    public static async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders = {
            "Content-Type": "application/json",
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }
}
