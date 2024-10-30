import styled from 'styled-components';

// Dashboard layout styles
export const DashboardContainer = styled.div`
  display: flex;
  position: absolute;
  margin: auto;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  border-radius: 5px;
  justify-content: center;
  align-items: center;
  background-color: #f5f6fa;
  box-shadow: 0 0 1px 2px rgba(0,0,0,0.1);
  width: 80%;
  height: 90vh;
  box-sizing: border-box;
`;

export const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  width: 35%;
  gap: 20px;
  height: 100%;
  box-sizing: border-box;
  background: #7f8fa6;
  border-radius: 5px 0 0 5px;
`;

export const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  width: 65%;
  height: 100%;
  box-sizing: border-box;
  box-shadow: inset -1px 0 2px 1px rgba(0,0,0,0.1);
`;

export const VideoListContainer = styled.div`
  flex-direction: column;
  display: flex;
  align-items: center;
  width: 90%;
`;

export const VideoListGallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  border-radius: 8px;
  width: 100%;
  height: 65vh;
  justify-content: space-between;
  overflow: scroll;
  padding: 0 15px;
  gap: 15px;
`;

export const VideoItem = styled.div<{ selected: boolean }>`
  display: flex;
  width: 45%;
  box-sizing: border-box;
  height: 150px;
  justify-content: center;
  align-items: center;
  border: ${({ selected }) => (selected ? '2px solid #d1eaff' : 'transparent')};
  cursor: pointer;
  overflow: hidden;
  border-radius: 4px;

  &:hover {
    border: 2px solid #f1f1f1;
  }
`;

export const VideoThumbnail = styled.img`
  width: 100%;
  height: 100%;
`;

export const VideoTitle = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: #333;
`;

export const VideoUploadContainer = styled.div`
  border-radius: 8px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 15%;
  width: 70%;
`;

export const UploadForm = styled.form`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: center;
`;

export const UploadButton = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 8px;
  align-items: center;
  color: black;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #dcdde1;
  align-items: center;
  cursor: pointer;
`;

export const MergeButton = styled.button`
  background-color: #0097e6;
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #00a8ff;
  }
`;
