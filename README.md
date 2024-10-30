# VideoEditor
A set of REST API to carry basic video management operations along with editing the video. Also, frontend-react application to upload and edit the videos.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)

## Technologies Used

- **Frontend**: React, Axios.
- **Backend**: Node.js, Express, Sqllite, ffmpeg.
- **Others**: Jest (for testing).

## Features

- CRUD operations for video management
- Trim and Merge Video files
- Create shareable links for videos

## Getting Started

### Prerequisites

- Node.js (version >= 16.x)
- npm or yarn (for package management)
- sqllite (already present in repository)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/akshat0047/VideoEditor.git
   cd VideoEditor
   ```

2. **Setup backend dependencies**
   ```bash
   cd video-editor-server
   npm i
   ```

   Add values to .env file

   ```bash
   npm run dev
   ```

3. **Install frontend dependencies**
    ```bash
   cd video-editor-client
   npm i
   ```

   Add values to .env file

   ```bash
   npm start
   ```

4. **Running the application**
    - Open `http://localhost:5000` in the browser to upload videos
    - Open `http://localhost:3000/api-docs` in the browser
    - Authorize swagger API with API_AUTH token added in `.env` file
    - Try API's
