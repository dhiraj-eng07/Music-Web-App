class UploadManager {
    constructor() {
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeEventListeners();
            });
        } else {
            this.initializeEventListeners();
        }
    }

    initializeEventListeners() {
        const uploadBtn = document.getElementById('upload-btn');
        
        // Only add event listener if user is artist and button exists
        if (uploadBtn && window.auth && auth.isArtist()) {
            uploadBtn.addEventListener('click', () => this.showUploadForm());
        } else if (uploadBtn) {
            // Hide upload button for non-artists
            uploadBtn.style.display = 'none';
        }
    }

    showUploadForm() {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('Content area not found');
            return;
        }
        
        contentArea.innerHTML = this.getUploadFormHTML();
        this.initializeUploadForm();
    }

    getUploadFormHTML() {
        return `
            <h1 class="page-title">Upload New Track</h1>
            <div class="upload-form">
                <div class="upload-area" id="upload-area">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag and drop your MP3 file here, or click to browse</p>
                </div>
                
                <div class="form-group">
                    <label for="track-name">Track Name</label>
                    <input type="text" id="track-name" required>
                </div>
                
                <div class="form-group">
                    <label for="artist-name">Artist Name</label>
                    <input type="text" id="artist-name" value="${auth.user?.name || ''}" readonly>
                </div>
                
                <div class="form-group">
                    <label for="release-date">Release Date</label>
                    <input type="date" id="release-date" required>
                </div>
                
                <div class="form-group">
                    <label for="genre">Genre</label>
                    <select id="genre" required>
                        <option value="">Select genre</option>
                        <option value="pop">Pop</option>
                        <option value="rock">Rock</option>
                        <option value="hiphop">Hip Hop</option>
                        <option value="electronic">Electronic</option>
                        <option value="jazz">Jazz</option>
                        <option value="classical">Classical</option>
                    </select>
                </div>
                
                <button class="btn" id="submit-upload">Upload Track</button>
                <div id="upload-message" class="message hidden"></div>
            </div>
        `;
    }

    initializeUploadForm() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'audio/*';
        fileInput.style.display = 'none';

        document.body.appendChild(fileInput);
        
        if (uploadArea) {
            uploadArea.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        const submitBtn = document.getElementById('submit-upload');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitUpload());
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        const uploadArea = document.getElementById('upload-area');
        
        if (file && uploadArea) {
            uploadArea.innerHTML = `
                <i class="fas fa-check-circle" style="color: var(--primary)"></i>
                <p>${file.name}</p>
                <small>Click to change file</small>
            `;
            
            // Re-add click event
            uploadArea.addEventListener('click', () => {
                e.target.click();
            });
        }
    }

    async submitUpload() {
        const fileInput = document.querySelector('input[type="file"]');
        const trackName = document.getElementById('track-name')?.value;
        const releaseDate = document.getElementById('release-date')?.value;
        const genre = document.getElementById('genre')?.value;

        if (!fileInput?.files[0] || !trackName || !releaseDate || !genre) {
            this.showMessage('Please fill all fields', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('track', fileInput.files[0]);
        formData.append('name', trackName);
        formData.append('releaseDate', releaseDate);
        formData.append('genre', genre);

        try {
            const response = await fetch(`${API_BASE}/tracks/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Track uploaded successfully!', 'success');
                // Clear form
                const trackNameInput = document.getElementById('track-name');
                const releaseDateInput = document.getElementById('release-date');
                const genreSelect = document.getElementById('genre');
                
                if (trackNameInput) trackNameInput.value = '';
                if (releaseDateInput) releaseDateInput.value = '';
                if (genreSelect) genreSelect.value = '';
                if (fileInput) fileInput.value = '';
                
                // Reset upload area
                const uploadArea = document.getElementById('upload-area');
                if (uploadArea) {
                    uploadArea.innerHTML = `
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drag and drop your MP3 file here, or click to browse</p>
                    `;
                }
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('upload-message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `message ${type}`;
            messageEl.classList.remove('hidden');
            
            setTimeout(() => {
                messageEl.classList.add('hidden');
            }, 5000);
        }
    }
}

// Initialize only when needed
let uploadManager;

function initializeUploadManager() {
    if (window.auth && auth.isArtist()) {
        uploadManager = new UploadManager();
    }
}