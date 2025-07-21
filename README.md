# MyTube 🎥  
*A hands-on exploration of system design for a video streaming service*

## Overview

Welcome to **MyTube** — a project where we explore and build the core components of a video streaming platform like YouTube. This repo is both a system design study and an engineering playground to learn by doing.

We aim to incrementally design and implement features of a modern video platform, covering topics such as storage, metadata, transcoding, video delivery, analytics, scalability, and more.

---

## ✨ What We're Building

At a high level, a system like YouTube includes three main flows:

### 1. **Video Upload (Write Path)**

Users upload videos through a multi-step process:

1. `POST /videos/`  
   Create an empty video record and receive a **pre-signed S3 URL** for upload.

2. **Upload to S3**  
   The client uploads the raw video file directly to S3 using the URL.

3. **S3 Upload Notification**  
   Once the upload completes, S3 emits an event to update the video's status to `uploadStatus = complete`.

4. `PUT /videos/:videoId`  
   The user submits metadata (e.g., title, description), which triggers:
   - Video **chunking**
   - **Transcoding** into various resolutions and formats
   - **Manifest** file generation (e.g., for MPEG-DASH)
   - Final storage of all assets back into S3
   - Metadata is updated with paths to the transcoded assets and manifest

5. **Optional**: Notify the user that the video is ready to be viewed.

---

### 2. **Video Playback (Read Path)**

Users can watch videos via browser or mobile apps:

1. `GET /videos/:videoId`  
   Returns metadata and a **playback URL** to the manifest file (e.g., pre-signed S3 URL or CloudFront CDN link)

2. The video player (e.g., [dash.js](https://github.com/Dash-Industry-Forum/dash.js)):
   - Fetches the manifest
   - Streams video chunks adaptively based on network conditions

---

### 3. **MyTube Analytics (Metrics Path)**

Real-time analytics for video performance and user engagement:

> 📊 **[View Analytics Architecture Diagram](https://excalidraw.com/#json=N78eeMpNGGBGh2JW8zgH3,HunP3aD0FSwEmlVSiWltfA)** - High-level design showing the complete analytics flow

#### **Client-side Metrics Collection**

1. **Video Player Events**  
   During playback, the client emits metrics events:
   ```javascript
   POST /metrics/
   {
     "videoId": "abc123",
     "userId": "user456", 
     "eventType": "play|pause|stop|seek|buffer",
     "timestamp": 1642534800000,
     "metadata": {
       "currentTime": 120,
       "quality": "720p",
       "bufferHealth": 5.2
     }
   }
   ```

2. **Metrics Processing Pipeline**  
   - Real-time processing and aggregation
   - Storage in time-series database (DynamoDB/TimeStream)
   - Batch processing for complex analytics

#### **Publisher Analytics Dashboard**

1. **Statistics Queries**  
   Publishers can query video performance:
   ```javascript
   GET /metrics/?videoId=abc123&timeRange=7d
   GET /metrics/?userId=publisher123&metric=views
   GET /metrics/?videoId=abc123&breakdown=geography
   ```

2. **Available Metrics**:
   - **Engagement**: Views, watch time, completion rate
   - **Performance**: Startup time, buffering events, quality switches
   - **Audience**: Geographic distribution, device types, referral sources
   - **Real-time**: Current concurrent viewers, live engagement

---

## 🛠️ Project Goals

- Break down complex systems into modular, buildable components
- Learn system design principles by prototyping real-world features
- Experiment with AWS services like S3, CloudFront, Kinesis Firehose / Data Streams / Analytics, etc.
- Explore trade-offs around performance, scalability, and cost

---

## 🧩 Planned Areas of Exploration

- ✅ Video metadata and upload flow  
- 🔄 Video processing (transcoding, chunking, manifest)  
- 📦 Storage and access patterns (S3, CloudFront)  
- 📊 Watch analytics and usage tracking  
- 🧠 Recommendation algorithms (may be not?)  
- 🔐 Auth and access control  
- 🏗️ Infrastructure as code (IaC)

## 🚀 Getting Started

### Prerequisites
- Basic understanding of distributed systems
- Familiarity with cloud platforms (AWS preferred)
- Programming knowledge (Python, TypeScript)
- Docker and containerization concepts

### Repository Structure
```
├── docs/                    # System design documentation
│   ├── architecture/        # High-level architecture diagrams
│   ├── components/          # Detailed component designs
│   └── scaling/            # Scalability patterns and solutions
├── implementations/         # Hands-on code implementations
│   ├── upload-service/     # Video upload and processing
│   ├── streaming-service/  # Video delivery and streaming
│   ├── metadata-service/   # Video and user metadata management
│   ├── analytics-service/  # Real-time metrics and analytics
│   └── web-client/         # Frontend application
├── infrastructure/          # Infrastructure as Code
│   ├── aws/                # AWS CloudFormation templates
│   ├── terraform/          # Terraform configurations
│   └── kubernetes/         # K8s deployment manifests
├── scripts/                # Deployment and utility scripts
└── tests/                  # Integration and performance tests
```

## 🎬 Quick Start: Build Your First Local Video Player

Before diving into the full AWS architecture, let's build a simple local video streaming player to understand the core concepts.

### Step 1: Set Up Project Structure

Create the project folder structure:

```bash
mkdir -p mytube-local/{videos/raw,videos/processed,web}
cd mytube-local
```

Your structure should look like:
```
mytube-local/
├── videos/
│   ├── raw/          # Original video files
│   └── processed/    # Transcoded chunks and manifests
└── web/              # HTML player and assets
```

### Step 2: Add a Sample Video

Copy any video file (MP4, MOV, etc.) to the `videos/raw/` folder:

```bash
# Example: Copy a video file
cp /path/to/your/sample-video.mp4 videos/raw/
```

### Step 3: Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)

### Step 4: Transcode Video to DASH Format

Use FFmpeg to create adaptive streaming chunks and manifest:

```bash
# Replace 'sample-video.mp4' with your actual filename
ffmpeg -i videos/raw/sample-video.mp4 \
  -map 0:v:0 -map 0:a:0 \
  -b:v:0 800k -s:v:0 854x480 \
  -b:v:1 1200k -s:v:1 1280x720 \
  -b:v:2 2500k -s:v:2 1920x1080 \
  -b:a:0 128k \
  -f dash \
  -seg_duration 4 \
  -adaptation_sets "id=0,streams=v id=1,streams=a" \
  videos/processed/manifest.mpd
```

This creates:
- Multiple video quality levels (480p, 720p, 1080p)
- Audio stream
- DASH manifest file (`manifest.mpd`)
- Video/audio chunks

### Step 5: Create HTML Video Player

Create `web/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyTube Local Player</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #0f0f0f;
            color: white;
        }
        .player-container {
            background: #000;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 20px;
        }
        video {
            width: 100%;
            height: auto;
        }
        .info {
            background: #1a1a1a;
            padding: 15px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <h1>🎥 MyTube Local Player</h1>
    
    <div class="player-container">
        <video id="videoPlayer" controls>
            <p>Your browser doesn't support DASH playback.</p>
        </video>
    </div>
    
    <div class="info">
        <h3>📊 Player Info</h3>
        <p><strong>Format:</strong> DASH (Dynamic Adaptive Streaming)</p>
        <p><strong>Quality Levels:</strong> 480p, 720p, 1080p (adaptive)</p>
        <p><strong>Manifest:</strong> <code>../videos/processed/manifest.mpd</code></p>
    </div>

    <script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
    <script>
        // Initialize DASH player
        const video = document.getElementById('videoPlayer');
        const player = dashjs.MediaPlayer().create();
        
        // Set up the player
        player.initialize(video, '../videos/processed/manifest.mpd', true);
        
        // Optional: Add event listeners for debugging
        player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
            console.log('✅ DASH stream initialized');
        });
        
        player.on(dashjs.MediaPlayer.events.PLAYBACK_STARTED, () => {
            console.log('▶️ Playback started');
        });
        
        player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e) => {
            console.log(`🎬 Quality changed to: ${e.newQuality}`);
        });
    </script>
</body>
</html>
```

### Step 6: Start Local Web Server

Start a Python web server to serve your files:

```bash
# From the mytube-local directory
python3 -m http.server 8000
```

### Step 7: Watch Your Video!

Open your browser and navigate to:
```
http://localhost:8000/web/
```

🎉 **Congratulations!** You now have a working adaptive video streaming player running locally.

### What You Just Built

- **Video Processing**: Used FFmpeg to transcode video into multiple quality levels
- **Adaptive Streaming**: Created DASH manifest for quality switching
- **Video Player**: Built HTML5 player with dash.js for adaptive playback
- **Local CDN**: Python server simulating content delivery

### Next Steps

- Try different video files and observe quality switching
- Monitor browser developer tools to see chunk requests
- Experiment with different FFmpeg encoding settings
- Add analytics tracking to the player

This local setup demonstrates the core concepts you'll scale up to AWS in the full system design!

---

## 📊 Key Metrics & KPIs

Understanding what to measure in a video streaming platform:

- **Performance Metrics**: Video startup time, buffering ratio, quality switches
- **Business Metrics**: User engagement, watch time, retention rates
- **Infrastructure Metrics**: CDN hit rates, storage costs, bandwidth usage
- **Quality Metrics**: Video quality scores, user satisfaction ratings

## 🤝 Contributing

This is a learning-focused repository. Contributions are welcome in the form of:

- Additional implementation examples
- Architecture improvements
- Documentation enhancements
- Performance optimizations
- New feature implementations

## 📖 Resources & References

### Books
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "System Design Interview" by Alex Xu

### Papers & Articles
- YouTube Architecture papers
- Netflix streaming technology blogs
- AWS and Google Cloud video streaming guides

### Tools & Platforms
- AWS Media Services documentation
- FFmpeg for video processing
- DASH and HLS streaming protocols

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚧 Status

This is a work-in-progress project intended for learning and experimentation. Contributions and feedback are welcome!

---

**Note**: This is an educational project designed for learning system design concepts. The implementations are simplified versions meant for understanding core principles rather than production-ready solutions.