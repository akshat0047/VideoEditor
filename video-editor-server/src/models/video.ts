
export default class {
    id!: string;
    fileName!: string;
    thumbnail!: string;

    constructor(name: string, thumbnailPath: string) {
        this.fileName = name;
        this.thumbnail = thumbnailPath;
    }
}