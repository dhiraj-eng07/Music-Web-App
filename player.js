class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.currentTrack = null;
        this.queue = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isShuffled = false;
        this.repeatMode = 'off'; // off, one, all
        this.volume = 0.7;

        this.initializeEventListeners();
        this.loadVolume();
    }

    initializeEventListeners() {
        // Player controls
        document.getElementById('play-pause-btn').addEventListener('click', () => this.togglePlay());
        document.getElementById('prev-btn').addEventListener('click', () => this.previous());
        document.getElementById('next-btn').addEventListener('click', () => this.next());
        document.getElementById('shuffle-btn').addEventListener('click', () => this.toggleShuffle());
        document.getElementById('repeat-btn').addEventListener('click', () => this.toggleRepeat());
        
        // Progress bar
        document.getElementById('progress-bar').addEventListener('click', (e) => this.seek(e));
        
        // Volume control
        document.getElementById('volume-bar').addEventListener('click', (e) => this.setVolume(e));
        document.getElementById('volume-btn').addEventListener('click', () => this.toggleMute());

        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('volumechange', () => this.updateVolumeUI());
    }

    async playTrack(track) {
        this.currentTrack = track;
        this.audio.src = `http://localhost:5000/${track.fileUrl}`;
        
        // Update UI
        document.getElementById('now-playing-name').textContent = track.name;
        document.getElementById('now-playing-artist').textContent = track.artist.name;
        document.getElementById('now-playing-img').innerHTML = track.coverArt 
            ? `<img src="http://localhost:5000/${track.coverArt}" alt="${track.name}">`
            : '<i class="fas fa-music"></i>';

        // Update like button
        this.updateLikeButton(track);

        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayButton();
        } catch (error) {
            console.error('Error playing track:', error);
        }
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
            this.isPlaying = true;
        } else {
            this.audio.pause();
            this.isPlaying = false;
        }
        this.updatePlayButton();
    }

    updatePlayButton() {
        const button = document.getElementById('play-pause-btn');
        const icon = button.querySelector('i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.playTrack(this.queue[this.currentIndex]);
        }
    }

    next() {
        if (this.currentIndex < this.queue.length - 1) {
            this.currentIndex++;
            this.playTrack(this.queue[this.currentIndex]);
        }
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        const button = document.getElementById('shuffle-btn');
        button.style.color = this.isShuffled ? 'var(--primary)' : 'var(--light-secondary)';
        
        if (this.isShuffled) {
            this.shuffleQueue();
        }
    }

    toggleRepeat() {
        const modes = ['off', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        const button = document.getElementById('repeat-btn');
        button.style.color = this.repeatMode !== 'off' ? 'var(--primary)' : 'var(--light-secondary)';
        button.innerHTML = this.repeatMode === 'one' ? '<i class="fas fa-redo-alt"></i>' : '<i class="fas fa-redo"></i>';
    }

    shuffleQueue() {
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
        this.currentIndex = this.queue.indexOf(this.currentTrack);
    }

    seek(e) {
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX;
        const progressBarWidth = progressBar.offsetWidth;
        const percentage = clickPosition / progressBarWidth;
        
        this.audio.currentTime = percentage * this.audio.duration;
        document.getElementById('progress').style.width = `${percentage * 100}%`;
    }

    setVolume(e) {
        const volumeBar = e.currentTarget;
        const clickPosition = e.offsetX;
        const volumeBarWidth = volumeBar.offsetWidth;
        this.volume = clickPosition / volumeBarWidth;
        
        this.audio.volume = this.volume;
        document.getElementById('volume-progress').style.width = `${this.volume * 100}%`;
        localStorage.setItem('volume', this.volume);
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        const button = document.getElementById('volume-btn');
        button.innerHTML = this.audio.muted 
            ? '<i class="fas fa-volume-mute"></i>' 
            : '<i class="fas fa-volume-up"></i>';
    }

    loadVolume() {
        const savedVolume = localStorage.getItem('volume');
        if (savedVolume) {
            this.volume = parseFloat(savedVolume);
            this.audio.volume = this.volume;
            document.getElementById('volume-progress').style.width = `${this.volume * 100}%`;
        }
    }

    updateDuration() {
        const duration = document.getElementById('duration');
        duration.textContent = this.formatTime(this.audio.duration);
    }

    updateProgress() {
        const progress = document.getElementById('progress');
        const currentTime = document.getElementById('current-time');
        
        if (this.audio.duration) {
            const percentage = (this.audio.currentTime / this.audio.duration) * 100;
            progress.style.width = `${percentage}%`;
            currentTime.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateVolumeUI() {
        document.getElementById('volume-progress').style.width = `${this.audio.volume * 100}%`;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    handleTrackEnd() {
        switch (this.repeatMode) {
            case 'one':
                this.audio.currentTime = 0;
                this.audio.play();
                break;
            case 'all':
                this.next();
                break;
            default:
                if (this.currentIndex < this.queue.length - 1) {
                    this.next();
                } else {
                    this.isPlaying = false;
                    this.updatePlayButton();
                }
        }
    }

    async updateLikeButton(track) {
        const likeBtn = document.getElementById('like-btn');
        const isLiked = track.likes.includes(auth.user.id);
        
        likeBtn.innerHTML = isLiked 
            ? '<i class="fas fa-heart" style="color: var(--primary)"></i>' 
            : '<i class="far fa-heart"></i>';
        
        likeBtn.onclick = async () => {
            try {
                const response = await fetch(`${API_BASE}/tracks/${track._id}/like`, {
                    method: 'POST',
                    headers: auth.getAuthHeaders(),
                });
                
                const data = await response.json();
                if (response.ok) {
                    likeBtn.innerHTML = data.liked
                        ? '<i class="fas fa-heart" style="color: var(--primary)"></i>' 
                        : '<i class="far fa-heart"></i>';
                }
            } catch (error) {
                console.error('Error liking track:', error);
            }
        };
    }

    setQueue(tracks, startIndex = 0) {
        this.queue = tracks;
        this.currentIndex = startIndex;
        this.playTrack(tracks[startIndex]);
    }

    addToQueue(track) {
        this.queue.push(track);
    }

    clearQueue() {
        this.queue = [];
        this.currentIndex = 0;
        this.audio.src = '';
        this.isPlaying = false;
        this.updatePlayButton();
    }
}

const musicPlayer = new MusicPlayer();