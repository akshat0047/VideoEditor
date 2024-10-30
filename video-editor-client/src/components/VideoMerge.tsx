// src/components/VideoMerge.tsx
import React, { useEffect, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import axios from 'axios';
import ReactPlayer from 'react-player';
import { MergeButton } from './styled/DashboardContainer';

interface VideoMergeProps {
    selectedVideoIds: string[];
    onCancel: () => void;
}




