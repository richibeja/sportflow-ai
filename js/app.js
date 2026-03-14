document.addEventListener('DOMContentLoaded', () => {
    console.log('SportFlow AI: Balanced Pro v2.5');
    
    // --- MONETIZATION CONFIG ---
    const CONFIG = {
        smartLink: 'https://www.effectivegatecpm.com/jm7f9ypm?key=b8f95870742d9bd9e730551fa23f4398',
        socialBar: true
    };

    const matches = [];
    let activeMatch = null;

    // --- ELEMENTS ---
    const bgOverlay = document.querySelector('.background-overlay');
    const heroContent = document.getElementById('hero-match-content');
    const matchSelector = document.getElementById('upcoming-matches');
    const newsContainer = document.getElementById('news-container');
    const scheduleBody = document.getElementById('schedule-body');
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- INIT ---
    setupBackground();
    syncMatches();
    renderNews();
    setupNavFilters();
    setInterval(syncMatches, 60000);

    // --- MONETIZATION ENGINE ---
    window.triggerSmartLink = () => {
        console.log('Monetización ejecutada en acción de alto valor.');
        window.open(CONFIG.smartLink, '_blank');
    };

    function setupNavFilters() {
        document.getElementById('nav-home').onclick = (e) => {
            e.preventDefault();
            filterMatches('all');
            setActiveNav(e.target);
            // Sin publicidad aquí para que la navegación sea fluida
        };
        document.getElementById('nav-intl').onclick = (e) => {
            e.preventDefault();
            filterMatches('intl');
            setActiveNav(e.target);
        };
        document.getElementById('nav-live').onclick = (e) => {
            e.preventDefault();
            filterMatches('live');
            setActiveNav(e.target);
        };
    }

    function setActiveNav(el) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        el.classList.add('active');
    }

    function filterMatches(type) {
        window.currentFilter = type;
        renderMatchSelector();
        renderSchedule();
    }

    function setupBackground() {
        if(!bgOverlay) return;
        bgOverlay.style.backgroundImage = `url(sportflow_hero_bg.png)`;
        bgOverlay.style.backgroundSize = 'cover';
        bgOverlay.style.backgroundPosition = 'center';
        bgOverlay.style.opacity = '0.3';
    }

    async function syncMatches() {
        const leagues = [
            { id: 'mex.1', name: 'Liga MX' },
            { id: 'eng.1', name: 'Premier League' },
            { id: 'uefa.champions', name: 'Champions League' },
            { id: 'esp.1', name: 'La Liga' }
        ];

        try {
            let allMatches = [];
            for (const league of leagues) {
                try {
                    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard`);
                    const data = await response.json();
                    if (data && data.events) {
                        const leagueMatches = data.events.map(event => {
                            const competitorHome = event.competitions[0].competitors.find(c => c.homeAway === 'home');
                            const competitorAway = event.competitions[0].competitors.find(c => c.homeAway === 'away');
                            return {
                                id: event.id,
                                league: league.name,
                                homeTeam: competitorHome.team.displayName,
                                awayTeam: competitorAway.team.displayName,
                                homeLogo: competitorHome.team.logo,
                                awayLogo: competitorAway.team.logo,
                                homeScore: competitorHome.score,
                                awayScore: competitorAway.score,
                                time: event.status.type.shortDetail,
                                status: event.status.type.state === 'in' ? 'EN VIVO' : 
                                        event.status.type.state === 'pre' ? 'PRÓXIMAMENTE' : 'FINALIZADO'
                            };
                        });
                        allMatches = [...allMatches, ...leagueMatches];
                    }
                } catch (err) {}
            }
            if (allMatches.length > 0) {
                allMatches.sort((a, b) => {
                    const priority = { 'EN VIVO': 0, 'PRÓXIMAMENTE': 1, 'FINALIZADO': 2 };
                    return priority[a.status] - priority[b.status];
                });
                matches.length = 0;
                matches.push(...allMatches.slice(0, 10));
                if (!activeMatch || !matches.find(m => m.id === activeMatch.id)) activeMatch = matches[0];
            }
        } catch (error) {}
        renderMatchSelector();
        renderHero(activeMatch);
        renderSchedule();
    }

    function renderMatchSelector() {
        if(!matchSelector) return;
        matchSelector.innerHTML = '';
        let filtered = matches;
        const filter = window.currentFilter || 'all';
        if (filter === 'intl') filtered = matches.filter(m => m.league !== 'Liga MX');
        else if (filter === 'live') filtered = matches.filter(m => m.status === 'EN VIVO');

        filtered.forEach(match => {
            const card = document.createElement('div');
            card.className = `match-card-mini ${match.id === activeMatch.id ? 'active' : ''}`;
            card.innerHTML = `
                <div class="mini-header">
                    <span>${match.league}</span>
                    <span style="color: ${match.status === 'EN VIVO' ? 'var(--accent)' : 'inherit'}">${match.status}</span>
                </div>
                <div class="mini-teams">
                    <div class="mini-team"><span>${match.homeTeam}</span><img src="${match.homeLogo}"></div>
                    <div class="mini-team"><span>${match.awayTeam}</span><img src="${match.awayLogo}"></div>
                </div>
            `;
            card.onclick = () => {
                activeMatch = match;
                document.querySelectorAll('.match-card-mini').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                resetVideoPlayer();
                renderHero(activeMatch);
                // Sin publicidad aquí para que puedan explorar partidos libremente
            };
            matchSelector.appendChild(card);
        });
    }

    function renderHero(match) {
        if(!heroContent) return;
        heroContent.innerHTML = `
            <div class="match-header">
                <span class="tournament">${match.league}</span>
                <span class="match-status" style="color: ${match.status === 'EN VIVO' ? 'var(--accent)' : 'var(--text-muted)'}">${match.status}</span>
            </div>
            <div class="teams-container">
                <div class="team home"><div class="team-logo"><img src="${match.homeLogo}"></div><h3>${match.homeTeam}</h3></div>
                <div class="score-board">
                    <div class="score"><span id="home-score">${match.homeScore}</span><span class="separator">-</span><span id="away-score">${match.awayScore}</span></div>
                    <div class="match-time">${match.time}</div>
                </div>
                <div class="team away"><div class="team-logo"><img src="${match.awayLogo}"></div><h3>${match.awayTeam}</h3></div>
            </div>
            <div class="match-actions">
                <button class="btn-primary" id="btn-watch-hd"><i class="fas fa-play"></i> VER EN VIVO</button>
                <button class="btn-secondary" id="btn-stats-hero"><i class="fas fa-chart-bar"></i> ESTADÍSTICAS</button>
            </div>
        `;
        document.getElementById('btn-watch-hd').onclick = () => {
            const videoTab = document.querySelector('[data-tab="video"]');
            if(videoTab) videoTab.click();
            document.querySelector('.match-details').scrollIntoView({ behavior: 'smooth' });
        };
        document.getElementById('btn-stats-hero').onclick = () => {
            const statsTab = document.querySelector('[data-tab="stats"]');
            if(statsTab) statsTab.click();
            document.querySelector('.match-details').scrollIntoView({ behavior: 'smooth' });
        };
    }

    function renderNews() {
        if(!newsContainer) return;
        // Noticias sin publicidad invasiva al click, solo banners visuales
        newsContainer.innerHTML = [
            { title: 'Clásico Regio: Todo listo', tag: 'LIGA MX', desc: 'Monterrey y Tigres paralizan la ciudad.', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80' },
            { title: 'Madrid vs City: Final anticipada', tag: 'CHAMPIONS', desc: 'El Bernabéu espera una noche mágica.', img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80' }
        ].map(item => `
            <div class="news-card">
                <div class="news-img" style="background-image: url('${item.img}')"></div>
                <div class="news-content">
                    <span class="news-tag">${item.tag}</span>
                    <h3>${item.title}</h3>
                    <p>${item.desc}</p>
                </div>
            </div>
        `).join('');
    }

    function renderSchedule() {
        if(!scheduleBody) return;
        let filtered = matches;
        const filter = window.currentFilter || 'all';
        if (filter === 'intl') filtered = matches.filter(m => m.league !== 'Liga MX');
        else if (filter === 'live') filtered = matches.filter(m => m.status === 'EN VIVO');

        scheduleBody.innerHTML = filtered.map(item => `
            <tr>
                <td>${item.homeTeam} vs ${item.awayTeam}</td>
                <td><span class="canal-tag">${item.league.substring(0,10)}...</span></td>
                <td>${item.time}</td>
                <td><span class="status-online"><i class="fas fa-circle"></i> ${item.status}</span></td>
            </tr>
        `).join('');
    }

    // Tab Logic
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(c => c.id === `tab-${tab.dataset.tab}` ? c.classList.remove('hidden') : c.classList.add('hidden'));
            // Solo publicidad si entra a la pestaña de VIDEO
            if(tab.dataset.tab === 'video') triggerSmartLink();
        };
    });

    // Video Logic
    const unlockBtn = document.getElementById('unlock-stream-btn');
    const videoOverlay = document.getElementById('video-overlay');
    const livePlayer = document.getElementById('live-player');
    const streamIframe = document.getElementById('stream-iframe');
    const serverBtns = document.querySelectorAll('.server-btn');

    if(unlockBtn) {
        unlockBtn.onclick = async () => {
            unlockBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFICANDO...';
            triggerSmartLink(); // CLIC VALIOSO
            setTimeout(() => {
                videoOverlay.classList.add('hidden');
                livePlayer.classList.remove('hidden');
                loadServer(1);
                unlockBtn.innerHTML = '<i class="fas fa-unlock-alt"></i> DESBLOQUEAR SEÑAL';
            }, 1500);
        };
    }

    serverBtns.forEach(btn => {
        btn.onclick = () => {
            if (btn.dataset.server === 'sos') {
                const searchUrl = `https://www.google.com/search?q=ver+en+vivo+${encodeURIComponent(activeMatch.homeTeam + ' vs ' + activeMatch.awayTeam)}+streaming+gratis`;
                window.open(searchUrl, '_blank');
                triggerSmartLink(); // CLIC VALIOSO
                return;
            }
            serverBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (!livePlayer.classList.contains('hidden')) {
                loadServer(parseInt(btn.dataset.server));
                triggerSmartLink(); // CLIC VALIOSO (intentan arreglar señal)
            }
        };
    });

    async function loadServer(serverNum) {
        if (!activeMatch) return;
        streamIframe.src = ''; 
        const baseLink = await findLiveStream(`${activeMatch.homeTeam} vs ${activeMatch.awayTeam}`);
        const finalUrl = baseLink.includes('?') ? `${baseLink}&s=${serverNum}` : `${baseLink}?s=${serverNum}`;
        streamIframe.src = finalUrl;
    }

    function resetVideoPlayer() {
        if(videoOverlay) videoOverlay.classList.remove('hidden');
        if(livePlayer) livePlayer.classList.add('hidden');
        if(streamIframe) streamIframe.src = '';
    }

    // Floating CTA
    setTimeout(() => {
        const floatingCta = document.getElementById('floating-cta');
        if(floatingCta) {
            floatingCta.classList.add('show');
            const floatBtn = document.getElementById('btn-floating-smart');
            if(floatBtn) floatBtn.onclick = () => triggerSmartLink(); // CLIC VALIOSO
        }
    }, 8000);
});
