
export default class {
    id!: string;
    videoId!: string;
    temporaryLink!: string;
    expiryTime!: string;
    
    constructor(videoId: string, temporaryLink: string, expiryTime: string) {
        this.videoId = videoId;
        this.temporaryLink = temporaryLink;
        this.expiryTime = expiryTime;
    }
}