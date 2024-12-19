import dao from "./dao";
import Link from "../models/link";
import { uuidv4 } from 'uuidv7';

export default class {
    static async createLink(link: Link): Promise<boolean> {
        const stmt = "INSERT INTO links (id, videoId, temporaryLink, expiryTime) VALUES (?, ?, ?, ?)" 
        try {
            await dao.run(stmt, [uuidv4(), link.videoId, link.temporaryLink, link.expiryTime]);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    static async getLinkByVideoId(videoId: string): Promise<Link> {
        console.log("videoId", videoId);
        const link = await dao.get("SELECT * FROM links WHERE videoId = ?", [videoId])
        return <Link>link;
    }

    static async deleteExpiredLinks() {
       const stmt = `DELETE FROM links WHERE expiryTime < ?`;
       try {
            await dao.run(stmt, [new Date().toISOString()]);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}