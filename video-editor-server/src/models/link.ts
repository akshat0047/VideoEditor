
export default class {
    id!: string;
    videoId!: string;
    temporaryLink!: string;
    expiryTime!: number;
    
    constructor(videoId: string, temporaryLink: string, expiryTime: number) {
        this.videoId = videoId;
        this.temporaryLink = temporaryLink;
        this.expiryTime = expiryTime;
    }
}