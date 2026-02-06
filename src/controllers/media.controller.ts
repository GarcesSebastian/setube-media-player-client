import { FetchUtils } from "../utils/fetch.utils";

export interface MediaResult {
    video_id: string;
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: number;
    type: string;
    author: {
        name: string;
        url: string;
    };
}

export interface MediaInfo {
    id: string;
    url: string;
    title: string;
    duration: number;
    thumbnail: string;
    author: {
        name: string;
    };
    formats: {
        format_id: string;
        ext: string;
        resolution: string;
        filesize: number;
    }[];
}

export const searchMedia = async (query: string): Promise<MediaResult[]> => {
    return FetchUtils.apiCall<MediaResult[]>(`/media/search?query=${encodeURIComponent(query)}`);
};

export const getMediaInfo = async (url: string): Promise<MediaInfo> => {
    return FetchUtils.apiCall<MediaInfo>(`/media/info?url=${encodeURIComponent(url)}`);
};

export const getMediaFormats = async (url: string): Promise<{ formats: any[] }> => {
    return FetchUtils.apiCall<{ formats: any[] }>(`/media/formats?url=${encodeURIComponent(url)}`);
};
