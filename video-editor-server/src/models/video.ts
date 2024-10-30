
export default class {
    id!: string;
    fileName!: string;
    filePath!: string;
    thumbnail!: string;

    constructor(name: string, path: string, thumbnailPath: string) {
        this.fileName = name;
        this.filePath = path;
        this.thumbnail = thumbnailPath;
    }
}