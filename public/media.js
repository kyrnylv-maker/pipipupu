// Media handling utilities

class MediaHandler {
    constructor() {
        this.supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.supportedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        this.supportedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
        this.maxImageSize = 10 * 1024 * 1024; // 10 MB
        this.maxVideoSize = 50 * 1024 * 1024; // 50 MB
    }

    // Check if file is image
    isImage(file) {
        return file && this.supportedImageTypes.includes(file.type);
    }

    // Check if file is video
    isVideo(file) {
        return file && this.supportedVideoTypes.includes(file.type);
    }

    // Check if file is audio
    isAudio(file) {
        return file && this.supportedAudioTypes.includes(file.type);
    }

    // Validate file
    validate(file) {
        const errors = [];

        if (this.isImage(file) && file.size > this.maxImageSize) {
            errors.push('Изображение слишком большое (макс. 10 МБ)');
        }

        if (this.isVideo(file) && file.size > this.maxVideoSize) {
            errors.push('Видео слишком большое (макс. 50 МБ)');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // Compress image
    async compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', quality);
                };

                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Create thumbnail
    async createThumbnail(file, size = 100) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;

                    const ctx = canvas.getContext('2d');
                    
                    // Calculate crop
                    const scale = Math.max(size / img.width, size / img.height);
                    const x = (size / 2) - (img.width / 2) * scale;
                    const y = (size / 2) - (img.height / 2) * scale;
                    
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };

                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Get video thumbnail
    async getVideoThumbnail(file, seekTo = 0.0) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const url = URL.createObjectURL(file);

            video.addEventListener('loadedmetadata', () => {
                video.currentTime = video.duration * seekTo;
            });

            video.addEventListener('seeked', () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            });

            video.addEventListener('error', () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load video'));
            });

            video.src = url;
            video.load();
        });
    }

    // Get video duration
    async getVideoDuration(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);

            video.addEventListener('loadedmetadata', () => {
                URL.revokeObjectURL(url);
                resolve(video.duration);
            });

            video.addEventListener('error', () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load video'));
            });

            video.src = url;
        });
    }

    // Format duration
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    // Create preview for file
    async createPreview(file) {
        if (this.isImage(file)) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        if (this.isVideo(file)) {
            return this.getVideoThumbnail(file);
        }

        return null;
    }

    // Upload file with progress
    async uploadFile(file, url, token, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('file', file);

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const progress = (e.loaded / e.total) * 100;
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        reject(new Error('Invalid response'));
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload aborted'));
            });

            xhr.open('POST', url);
            
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.send(formData);
        });
    }

    // Download file
    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Get file icon based on extension
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        const icons = {
            // Documents
            pdf: 'picture_as_pdf',
            doc: 'description',
            docx: 'description',
            txt: 'description',
            
            // Spreadsheets
            xls: 'table_chart',
            xlsx: 'table_chart',
            csv: 'table_chart',
            
            // Presentations
            ppt: 'slideshow',
            pptx: 'slideshow',
            
            // Archives
            zip: 'folder_zip',
            rar: 'folder_zip',
            '7z': 'folder_zip',
            tar: 'folder_zip',
            gz: 'folder_zip',
            
            // Code
            js: 'code',
            ts: 'code',
            jsx: 'code',
            tsx: 'code',
            html: 'code',
            css: 'code',
            json: 'code',
            xml: 'code',
            
            // Images
            jpg: 'image',
            jpeg: 'image',
            png: 'image',
            gif: 'image',
            svg: 'image',
            webp: 'image',
            
            // Videos
            mp4: 'videocam',
            webm: 'videocam',
            avi: 'videocam',
            mov: 'videocam',
            
            // Audio
            mp3: 'audiotrack',
            wav: 'audiotrack',
            ogg: 'audiotrack',
            m4a: 'audiotrack'
        };
        
        return icons[ext] || 'insert_drive_file';
    }
}

// Voice recording
class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.isRecording = false;
    }

    async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];

            this.mediaRecorder.addEventListener('dataavailable', (event) => {
                this.audioChunks.push(event.data);
            });

            this.mediaRecorder.start();
            this.isRecording = true;

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            return false;
        }
    }

    async stop() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || !this.isRecording) {
                reject(new Error('Not recording'));
                return;
            }

            this.mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/ogg' });
                const audioFile = new File([audioBlob], 'voice.ogg', {
                    type: 'audio/ogg',
                    lastModified: Date.now()
                });

                // Stop all tracks
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                }

                this.isRecording = false;
                resolve(audioFile);
            });

            this.mediaRecorder.stop();
        });
    }

    cancel() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
            this.isRecording = false;
            this.audioChunks = [];
        }
    }
}

// Export instances
const mediaHandler = new MediaHandler();
export default mediaHandler;
export { MediaHandler, VoiceRecorder };
