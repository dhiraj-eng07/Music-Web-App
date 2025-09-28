class MusicApp {
    constructor() {
        this.currentPage = 'home';
        this.tracks = [];
        this.playlists = [];
        
        // Wait for auth to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeEventListeners();
            });
        } else {
            this.initializeEventListeners();
        }
    }

    initializeEventListeners() {
        console.log('🔧 Initializing MusicApp event listeners...');
        
        // Navigation - use event delegation
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item, .mobile-nav-item');
            if (navItem && navItem.dataset.page) {
                e.preventDefault();
                this.navigateTo(navItem.dataset.page);
            }
        });

        // User menu
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.querySelector('.dropdown-menu');
                if (dropdown) {
                    dropdown.classList.toggle('hidden');
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                auth.logout();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            const dropdown = document.querySelector('.dropdown-menu');
            if (dropdown) {
                dropdown.classList.add('hidden');
            }
        });

        // Back/forward buttons
        const backBtn = document.getElementById('back-btn');
        const forwardBtn = document.getElementById('forward-btn');
        
        if (backBtn) backBtn.addEventListener('click', () => window.history.back());
        if (forwardBtn) forwardBtn.addEventListener('click', () => window.history.forward());
    }

    async initializeApp() {
        console.log('🎵 Initializing Music App...');
        await this.loadTracks();
        await this.loadPlaylists();
        this.navigateTo('home');
        
        // Initialize upload manager for artists
        if (auth.isArtist() && typeof initializeUploadManager === 'function') {
            initializeUploadManager();
        }
        
        // Hide upload button for non-artists
        const uploadBtn = document.getElementById('upload-btn');
        if (uploadBtn && !auth.isArtist()) {
            uploadBtn.style.display = 'none';
        }
    }

    async loadTracks() {
        try {
            console.log('📀 Loading tracks...');
            const response = await fetch(`${API_BASE}/tracks`);
            this.tracks = await response.json();
            console.log(`✅ Loaded ${this.tracks.length} tracks`);
        } catch (error) {
            console.error('❌ Error loading tracks:', error);
            // Use sample tracks if API fails
            this.tracks = this.getSampleTracks();
        }
    }

    async loadPlaylists() {
        try {
            console.log('📚 Loading playlists...');
            // In a real app, this would fetch user's playlists
            this.playlists = [
                { _id: '1', name: 'Liked Songs', type: 'liked', tracks: this.tracks.slice(0, 3) },
                { _id: '2', name: 'Chill Vibes', type: 'custom', tracks: this.tracks.slice(1, 4) },
                { _id: '3', name: 'Workout Mix', type: 'custom', tracks: this.tracks.slice(2, 5) },
            ];
            this.renderPlaylists();
        } catch (error) {
            console.error('❌ Error loading playlists:', error);
        }
    }

    getSampleTracks() {
        return [
            {
                _id: '1',
                name: 'Blinding Lights',
                artist: { _id: 'artist1', name: 'The Weeknd' },
                fileUrl: '/sample/track1.mp3',
                coverArt: '',
                genre: 'pop',
                likes: [],
                plays: 0,
                duration: 200
            },
            {
                _id: '2',
                name: 'Save Your Tears',
                artist: { _id: 'artist1', name: 'The Weeknd' },
                fileUrl: '/sample/track2.mp3',
                coverArt: '',
                genre: 'pop',
                likes: [],
                plays: 0,
                duration: 215
            },
            {
                _id: '3',
                name: 'Levitating',
                artist: { _id: 'artist2', name: 'Dua Lipa' },
                fileUrl: '/sample/track3.mp3',
                coverArt: '',
                genre: 'pop',
                likes: [],
                plays: 0,
                duration: 203
            }
        ];
    }

    renderPlaylists() {
        const container = document.getElementById('user-playlists');
        if (!container) return;
        
        // Clear existing content but keep the title
        const existingItems = container.querySelectorAll('.nav-item');
        existingItems.forEach(item => item.remove());
        
        this.playlists.forEach(playlist => {
            const playlistEl = document.createElement('div');
            playlistEl.className = 'nav-item';
            playlistEl.dataset.page = `playlist-${playlist._id}`;
            playlistEl.innerHTML = `<span>${playlist.name}</span>`;
            container.appendChild(playlistEl);
        });
    }

    navigateTo(page) {
        console.log(`🧭 Navigating to: ${page}`);
        this.currentPage = page;
        
        // Update active states
        document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll(`[data-page="${page}"]`).forEach(item => {
            item.classList.add('active');
        });

        this.renderPage(page);
    }

    async renderPage(page) {
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('❌ Content area not found');
            return;
        }
        
        console.log(`🎨 Rendering page: ${page}`);
        
        switch (page) {
            case 'home':
                contentArea.innerHTML = this.getHomeHTML();
                break;
            case 'search':
                contentArea.innerHTML = this.getSearchHTML();
                break;
            case 'library':
                contentArea.innerHTML = this.getLibraryHTML();
                break;
            case 'liked-songs':
                contentArea.innerHTML = this.getLikedSongsHTML();
                break;
            default:
                if (page.startsWith('playlist-')) {
                    const playlistId = page.replace('playlist-', '');
                    const playlist = this.playlists.find(p => p._id === playlistId);
                    if (playlist) {
                        contentArea.innerHTML = this.getPlaylistHTML(playlist);
                    }
                }
        }
        
        // Attach track events after rendering
        this.attachTrackEvents();
    }

    getHomeHTML() {
        return `
            <h1 class="page-title">Good evening</h1>
            
            <div class="cards-grid" id="quick-access">
                ${this.playlists.map(playlist => `
                    <div class="card" data-playlist-id="${playlist._id}">
                        <div class="card-img">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="card-title">${playlist.name}</div>
                        <div class="card-subtitle">Playlist • ${playlist.tracks?.length || 0} songs</div>
                    </div>
                `).join('')}
            </div>
            
            <h2 class="section-title">Recently played</h2>
            
            <div class="cards-grid" id="recent-tracks">
                ${this.tracks.slice(0, 6).map(track => `
                    <div class="card" data-track-id="${track._id}">
                        <div class="card-img">
                            ${track.coverArt 
                                ? `<img src="http://localhost:5000/${track.coverArt}" alt="${track.name}">`
                                : '<i class="fas fa-music"></i>'
                            }
                        </div>
                        <div class="card-title">${track.name}</div>
                        <div class="card-subtitle">${track.artist.name}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getSearchHTML() {
        return `
            <h1 class="page-title">Search</h1>
            <div class="search-container">
                <input type="text" class="search-input" placeholder="What do you want to listen to?">
            </div>
            
            <h2 class="section-title">Browse all</h2>
            <div class="cards-grid">
                ${['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical'].map(genre => `
                    <div class="card" style="background: linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)})">
                        <div class="card-title">${genre}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getLibraryHTML() {
        return `
            <h1 class="page-title">Your Library</h1>
            
            <div class="cards-grid">
                ${this.playlists.map(playlist => `
                    <div class="card" data-playlist-id="${playlist._id}">
                        <div class="card-img">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="card-title">${playlist.name}</div>
                        <div class="card-subtitle">Playlist • ${playlist.tracks?.length || 0} songs</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getLikedSongsHTML() {
        const likedTracks = this.tracks.slice(0, 5);
        return `
            <div style="background: linear-gradient(135deg, #450af5, #c4efd9); padding: 40px; margin: -24px -32px 24px; border-radius: 0 0 8px 8px;">
                <div style="display: flex; align-items: center; gap: 24px;">
                    <div style="width: 192px; height: 192px; background: rgba(0,0,0,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-heart" style="font-size: 64px; color: white;"></i>
                    </div>
                    <div>
                        <p style="font-size: 14px; font-weight: 600;">PLAYLIST</p>
                        <h1 style="font-size: 48px; font-weight: 900; margin: 8px 0;">Liked Songs</h1>
                        <p style="font-size: 14px;">${auth.user?.name || 'User'} • ${likedTracks.length} songs</p>
                    </div>
                </div>
            </div>
            
            <div class="track-list">
                ${likedTracks.map((track, index) => `
                    <div class="track-item" data-track-id="${track._id}">
                        <div class="track-number">${index + 1}</div>
                        <div class="track-info">
                            <div class="track-title">${track.name}</div>
                            <div class="track-artist">${track.artist.name}</div>
                        </div>
                        <div class="track-duration">${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getPlaylistHTML(playlist) {
        return `
            <div style="background: linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)}); padding: 40px; margin: -24px -32px 24px; border-radius: 0 0 8px 8px;">
                <div style="display: flex; align-items: center; gap: 24px;">
                    <div style="width: 192px; height: 192px; background: rgba(0,0,0,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-music" style="font-size: 64px; color: white;"></i>
                    </div>
                    <div>
                        <p style="font-size: 14px; font-weight: 600;">PLAYLIST</p>
                        <h1 style="font-size: 48px; font-weight: 900; margin: 8px 0;">${playlist.name}</h1>
                        <p style="font-size: 14px;">${auth.user?.name || 'User'} • ${playlist.tracks?.length || 0} songs</p>
                    </div>
                </div>
            </div>
            
            <div class="track-list">
                ${(playlist.tracks || []).map((track, index) => `
                    <div class="track-item" data-track-id="${track._id}">
                        <div class="track-number">${index + 1}</div>
                        <div class="track-info">
                            <div class="track-title">${track.name}</div>
                            <div class="track-artist">${track.artist.name}</div>
                        </div>
                        <div class="track-duration">${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachTrackEvents() {
        // Attach click events to track cards and items
        document.addEventListener('click', (e) => {
            const trackElement = e.target.closest('[data-track-id]');
            if (trackElement) {
                const trackId = trackElement.dataset.trackId;
                const track = this.tracks.find(t => t._id === trackId);
                
                if (track) {
                    console.log('🎵 Playing track:', track.name);
                    // Play the track and add similar tracks to queue
                    const similarTracks = this.tracks.filter(t => t.genre === track.genre);
                    if (window.musicPlayer) {
                        musicPlayer.setQueue(similarTracks, similarTracks.indexOf(track));
                    }
                }
            }

            const playlistElement = e.target.closest('[data-playlist-id]');
            if (playlistElement) {
                const playlistId = playlistElement.dataset.playlistId;
                this.navigateTo(`playlist-${playlistId}`);
            }
        });
    }
}

const musicApp = new MusicApp();

function initializeApp() {
    console.log('🚀 Initializing main application...');
    musicApp.initializeApp();
}