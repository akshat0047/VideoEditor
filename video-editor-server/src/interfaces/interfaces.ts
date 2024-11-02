export interface IVideo {
    id: string;
    fileName: string;
    filePath: string;
    thumbnail: string;
}

export interface ILink {
    id: string;
    videoId: string;
    temporaryLink: string;
    expiryTime: string;
}