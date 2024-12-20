import dao from './dao';
import Video from '../models/video';
import { uuidv4 } from 'uuidv7';
import { IVideo } from '../interfaces/interfaces';

export default class {

    static async getAllVideos(): Promise<IVideo[]> {
        const videos = await dao.all("SELECT * FROM videos", [])
        return <IVideo[]>videos
    }

    static async getVideoById(id: string): Promise<Video> {
        const video = await dao.get("SELECT * FROM videos WHERE id = ?", [id])
        return <Video>video;
    }

    static async saveVideo(video: Video): Promise<boolean> {
        const stmt = `INSERT INTO videos (id, fileName, thumbnail) VALUES (?,?,?);`
        try {
            await dao.run(stmt, [uuidv4(), video.fileName, video.thumbnail]);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    static async deleteVideo(videoId: string) {
        const stmt = `DELETE FROM videos WHERE id = ?;`
        try {
            await dao.run(stmt, [videoId]);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}
