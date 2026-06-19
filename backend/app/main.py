from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import uuid
import shutil
from datetime import datetime
import uvicorn
import subprocess

app = FastAPI(title="法哈德 AI Video Clipper")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

@app.get("/")
async def root():
    return {"status": "online", "message": "法哈德 AI Video Clipper"}

@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    try:
        video_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{video_id}_{timestamp}_{file.filename}"
        filepath = os.path.join("uploads", filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "success": True,
            "video_id": video_id,
            "filename": filename,
            "message": "Upload successful"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process/{video_id}")
async def process_video(video_id: str):
    try:
        # Find uploaded file
        uploads = os.listdir("uploads")
        video_file = None
        for f in uploads:
            if video_id in f:
                video_file = f
                break
        
        if not video_file:
            raise HTTPException(status_code=404, detail="Video not found")
        
        video_path = os.path.join("uploads", video_file)
        
        # Get video duration
        cmd = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{video_path}"'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        duration = float(result.stdout.strip())
        
        clips = []
        for i in range(3):
            start = (i + 0.5) * (duration / 3)
            end = min(start + 30, duration)
            
            output_filename = f"{video_id}_clip_{i+1}.mp4"
            output_path = os.path.join("outputs", output_filename)
            
            ffmpeg_cmd = f"""
            ffmpeg -i "{video_path}" -ss {start} -to {end} \
            -vf "crop=ih*9/16:ih,scale=1080:1920,setpts=PTS*0.97,eq=saturation=1.3,unsharp=5:5:1.0:5:5:0.0" \
            -c:v libx264 -preset medium -crf 23 \
            -c:a aac -b:a 192k \
            -movflags +faststart \
            "{output_path}"
            """
            subprocess.run(ffmpeg_cmd, shell=True, check=True)
            
            clips.append({
                "clip_id": f"clip_{i+1}",
                "filename": output_filename,
                "duration": round(end - start, 2),
                "viral_score": 80 + (i * 7),
                "download_url": f"/api/download/{video_id}/{output_filename}"
            })
        
        return {
            "success": True,
            "video_id": video_id,
            "total_clips": len(clips),
            "clips": clips
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{video_id}/{filename}")
async def download_video(video_id: str, filename: str):
    try:
        filepath = os.path.join("outputs", filename)
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(
            path=filepath,
            filename=filename,
            media_type="video/mp4"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/clips/{video_id}")
async def get_clips(video_id: str):
    try:
        clips = []
        files = os.listdir("outputs")
        for f in files:
            if video_id in f and f.endswith(".mp4"):
                clips.append({
                    "filename": f,
                    "download_url": f"/api/download/{video_id}/{f}"
                })
        return {
            "success": True,
            "video_id": video_id,
            "clips": clips
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
