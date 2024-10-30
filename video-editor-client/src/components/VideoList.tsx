// src/components/VideoList.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { MergeButton, VideoItem, VideoListContainer, VideoThumbnail, VideoTitle, VideoListGallery } from './styled/DashboardContainer';

interface VideoListProps {
    onSelectForCrop: (id: string) => void;
    onSelectForMerge: (ids: string[]) => void;
}

const VideoList: React.FC<VideoListProps> = ({ onSelectForCrop, onSelectForMerge }) => {
    const [videos, setVideos] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const token = process.env.REACT_APP_API_TOKEN;

    React.useEffect(() => {
        const fetchVideos = async () => {
            const response = await axios.get('/api/v1/videos', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setVideos(response.data.videos);
        };
        fetchVideos();
    }, []);

    const toggleSelectVideo = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
        );
    };

    return (
            <VideoListContainer>
                <VideoListGallery>
                    {videos.map(video => (
                        <VideoItem key={video.id} selected={selectedIds.includes(video.id)}>
                            <VideoThumbnail
                                src={video.thumbnail}
                                alt={video.title}
                                className="thumbnail-img"
                                onClick={() => toggleSelectVideo(video.id)}
                            />
                            <VideoTitle>{video.title}</VideoTitle>
                        </VideoItem>
                    ))}
                </VideoListGallery>
            </VideoListContainer>
    );
};

export default VideoList;
