import React from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { UploadButton, UploadForm, VideoUploadContainer } from './styled/DashboardContainer';

const VideoUpload: React.FC = () => {
    const onDrop = async (acceptedFiles: File[]) => {
        const formData = new FormData();
        formData.append('video', acceptedFiles[0]);

        try {
            const response = await axios.post('/api/v1/videos/upload', formData, {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error uploading video:', error);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <VideoUploadContainer>
            <UploadForm>
                <UploadButton {...getRootProps()}>
                    <input {...getInputProps()} />
                    <FontAwesomeIcon icon={faUpload} style={{ marginBottom: '10px' }} />
                    <span>Upload Video</span>
                </UploadButton>
            </UploadForm>
        </VideoUploadContainer>
    );
};

export default VideoUpload;