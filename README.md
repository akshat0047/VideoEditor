# VideoEditor
A set of REST API to carry basic video management operations along with editing the video. Also, frontend-react application to upload and edit the videos.

# Assumptions
- Storing the files on local storage in `/uploads` for the POC
- Merging the videos with same metadata as converting and making videos compatible to be merged is out of scope of assignment
- Saving the file as temporary to check duration, in real scenario either it will be checked on Frontend or through buffer
- Expiry of links will be maintained by running a cron job on the database, in real-scenario we can add a middleware on shareable link for expiry check

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

- Node.js (version >= 18.x)
- npm (for package management)
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

4. **Running the Application**
    - Open `http://localhost:3000/api-docs` in the browser
    - Authorize swagger API with API_AUTH token added in `.env` file
    - Try API's
    - Under Development but videos can also be uploaded by visiting frontend
