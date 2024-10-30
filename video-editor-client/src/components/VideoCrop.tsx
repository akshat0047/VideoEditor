// src/components/VideoCrop.tsx
import React, { useEffect, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import axios from 'axios';
import ReactPlayer from 'react-player';

interface VideoCropProps {
    selectedVideoId: string;
    onCancel: () => void;
}

const VideoCrop: React.FC<VideoCropProps> = ({ selectedVideoId, onCancel }) => {
    const [ffmpeg] = useState(() => new FFmpeg());
    const [videoSrc, setVideoSrc] = useState<string>('');
    const [start, setStart] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const loadVideo = async () => {
            const response = await axios.get(`/uploads/${selectedVideoId}`, { responseType: 'blob' });
            const url = URL.createObjectURL(response.data);
            setVideoSrc(url);
        };
        loadVideo();
    }, [selectedVideoId]);

    const handleCrop = async () => {
        setIsProcessing(true);
        await ffmpeg.load();
        ffmpeg.writeFile('input.mp4', await fetchFile(videoSrc));
        await ffmpeg.exec(['-i', 'input.mp4', '-ss', String(start), '-t', String(duration), 'output.mp4']);
        const data = await ffmpeg.readFile('output.mp4');

        const blob = new Blob([data], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        // Upload the cropped video
        const formData = new FormData();
        formData.append('file', blob, `crop_${selectedVideoId}.mp4`);
        await axios.post('/api/videos/upload', formData);

        alert('Video cropped and uploaded successfully');
        onCancel(); // Close the crop UI after processing
        setIsProcessing(false);
    };

    return (
        <div>
            <h2>Crop Video</h2>
            <ReactPlayer url={videoSrc} controls />
            <div>
                <input
                    type="number"
                    placeholder="Start Time (seconds)"
                    value={start}
                    onChange={e => setStart(parseFloat(e.target.value))}
                    min="0"
                />
                <input
                    type="number"
                    placeholder="Duration (seconds)"
                    value={duration}
                    onChange={e => setDuration(parseFloat(e.target.value))}
                    min="1"
                />
                <button onClick={handleCrop} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Crop Video'}
                </button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default VideoCrop;
