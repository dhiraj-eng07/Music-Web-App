class SearchManager {
    constructor() {
        this.searchResults = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Search input event
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('search-input')) {
                this.handleSearch(e.target.value);
            }
        });
    }

    async handleSearch(query) {
        if (query.length < 2) {
            this.clearResults();
            return;
        }

        try {
            // In a real app, you would make an API call here
            // For now, we'll filter existing tracks
            const response = await fetch(`${API_BASE}/tracks`);
            const allTracks = await response.json();
            
            this.searchResults = allTracks.filter(track =>
                track.name.toLowerCase().includes(query.toLowerCase()) ||
                track.artist.name.toLowerCase().includes(query.toLowerCase()) ||
                track.genre.toLowerCase().includes(query.toLowerCase())
            );

            this.displayResults(this.searchResults);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displayResults(results) {
        const contentArea = document.getElementById('content-area');
        
        if (results.length === 0) {
            contentArea.innerHTML = `
                <h1 class="page-title">Search</h1>
                <div class="search-container">
                    <input type="text" class="search-input" placeholder="What do you want to listen to?" value="${document.querySelector('.search-input')?.value || ''}">
                </div>
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-search" style="font-size: 48px; color: var(--light-secondary); margin-bottom: 16px;"></i>
                    <p>No results found</p>
                </div>
            `;
            return;
        }

        contentArea.innerHTML = `
            <h1 class="page-title">Search results</h1>
            <div class="search-container">
                <input type="text" class="search-input" placeholder="What do you want to listen to?" value="${document.querySelector('.search-input')?.value || ''}">
            </div>

            <h2 class="section-title">Tracks</h2>
            <div class="track-list">
                ${results.map(track => `
                    <div class="track-item" data-track-id="${track._id}">
                        <div class="track-number"><i class="fas fa-music"></i></div>
                        <div class="track-info">
                            <div class="track-title">${track.name}</div>
                            <div class="track-artist">${track.artist.name}</div>
                        </div>
                        <div class="track-duration">3:45</div>
                    </div>
                `).join('')}
            </div>

            <h2 class="section-title">Artists</h2>
            <div class="cards-grid">
                ${[...new Set(results.map(track => track.artist))].slice(0, 6).map(artist => `
                    <div class="card" data-artist-id="${artist._id}">
                        <div class="card-img">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="card-title">${artist.name}</div>
                        <div class="card-subtitle">Artist</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Re-attach event listeners
        musicApp.attachTrackEvents();
    }

    clearResults() {
        // Return to default search view
        if (musicApp.currentPage === 'search') {
            musicApp.renderPage('search');
        }
    }
}

const searchManager = new SearchManager();