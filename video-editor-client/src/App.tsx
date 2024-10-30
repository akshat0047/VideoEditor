// src/App.tsx
import React, { useState } from 'react';
import VideoList from './components/VideoList';
import VideoUpload from './components/VideoUpload';
import { DashboardContainer, LeftContainer, RightContainer } from './components/styled/DashboardContainer';

const App: React.FC = () => {
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [selectedVideoIdsForMerge, setSelectedVideoIdsForMerge] = useState<string[]>([]);

    const handleSelectForCrop = (id: string) => {
        setSelectedVideoId(id);
    };

    const handleSelectForMerge = (ids: string[]) => {
        setSelectedVideoIdsForMerge(ids);
    };

    const handleCancelCrop = () => {
        setSelectedVideoId(null);
    };

    const handleCancelMerge = () => {
        setSelectedVideoIdsForMerge([]);
    };

    return (
      <DashboardContainer>
        <LeftContainer>
            <VideoList onSelectForCrop={handleSelectForCrop} onSelectForMerge={handleSelectForMerge} />
            <VideoUpload />
        </LeftContainer>
        <RightContainer>  
            
        </RightContainer>
      </DashboardContainer>
    );
};

export default App;
