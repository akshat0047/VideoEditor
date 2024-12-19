import linkRepo from '../repositories/link.repository';
import videoRepo from '../repositories/video.repository';
import { Request, Response } from 'express'
import crypto from 'crypto';
import moment from 'moment';
import Link from '../models/link';
import { MEDIA_FOLDER, SECRET_KEY } from '../../index';



export default class LinkController {

    static async getLinkByVideo(req: Request, res: Response, next: Function) {
        let link = await linkRepo.getLinkByVideoId(req.params.id);
        return res.status(200).json({ link });
    };

    static async createLink(req: Request, res: Response, next: Function) {
        const { videoId, expiryTime} = req.body;
        const video = await videoRepo.getVideoById(videoId);

        if (!video) {
            return res.status(404).json({ message: 'Video file not found' });
        }

        const protocol = req.protocol;
        const host = req.get('host');

        const expiry = moment().add(expiryTime, 'minutes').unix();

        const fileName = video.fileName;
        const data = `${fileName}.${expiry}`;
        const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');

        // Generate the signed URL
        const temporaryLink = `${protocol}://${host}/media/${fileName}?expiry=${expiry}&signature=${signature}`;


        const link = new Link(videoId, temporaryLink, expiry)
        await linkRepo.createLink(link); 
        
        return res.status(201).json({ message: 'Link created successfully', link: temporaryLink });
    };
    
    static async syncExpiredLinks(req: Request, res: Response, next: Function) {
        await linkRepo.deleteExpiredLinks();
        return res.status(200).json({ message: 'Expired links synced successfully'});
    };
}