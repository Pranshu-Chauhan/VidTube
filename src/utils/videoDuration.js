import ffmpeg from 'fluent-ffmpeg';

export const getVideoDuration = (videoPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                console.error("ffprobe error:", err);
                return reject(err); // <-- Pass actual error
            }
            const duration = metadata.format.duration;
            resolve(duration);
        });
    });
}