document.addEventListener('DOMContentLoaded', () => {

    
    // --- MASTER CONFIG (Control total de Richard) ---
    const CONFIG = {
        KICK_CHANNEL: 'richardbejarano5', // TU CANAL DE KICK RICHARD
        OBS_LINK: '' // OPCIONAL: LINK DIRECTO SI NO USAS KICK
    };

    const matches = [];
    let activeMatch = null;

    // --- ELEMENTS ---
    const bgOverlay = document.querySelector('.background-overlay');
    const heroContent = document.getElementById('hero-match-content');
    const matchSelector = document.getElementById('upcoming-matches');
    const newsContainer = document.getElementById('news-container');
    // --- INTERNATIONALIZATION (v11.0 UK Expansion) ---
    const I18N = {
        es: {
            watchHD: "VER TRANSMISIÓN PREMIUM",
            watchViral: "DESBLOQUEAR STREAM VIRAL HD",
            dataCenter: "CENTRO DE DATOS",
            loading: "Selecciona un partido para ver detalles...",
            noMatches: "No hay partidos programados para hoy.",
            shareTitle: "¡Mira este evento en vivo!",
            shareText: "Transmisión en HD con análisis de SportFlow AI.",
            footerTeams: "Explorar Equipos",
            footerSpecial: "Secciones Especiales"
        },
        en: {
            watchHD: "WATCH PREMIUM STREAMING",
            watchViral: "UNLOCK VIRAL HD STREAM",
            dataCenter: "PRO DATA CENTER",
            loading: "Select a match to view details...",
            noMatches: "No matches scheduled for today.",
            shareTitle: "Watch this event live!",
            shareText: "HD streaming with SportFlow AI analysis.",
            footerTeams: "Explore Teams",
            footerSpecial: "Special Sections"
        }
    };
    window.currentLang = 'es';
    const scheduleBody = document.getElementById('schedule-body');
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const livePlayer = document.getElementById('live-player');
    const streamIframe = document.getElementById('stream-iframe');
    const signalStatus = document.getElementById('signal-status');
    const videoOverlay = document.getElementById('video-overlay');
    // --- INIT ---
    setupBackground();
    syncMatches();
    setupNavFilters();
    setInterval(syncMatches, 60000);

    // Ensure first step is visible (Simplified v2.4.0)
    setTimeout(() => {
        loadAds();
        setupUnmute();
    }, 500);

    // --- MONETIZATION ENGINE (v13.0 - NO-POPUP Mode) ---
    window.triggerSmartLink = () => {
        // v13.0: SmartLinks disabled to prevent mobile blocking
        console.log("[UX] SmartLink suppressed for mobile stability.");
    };

    function renderAd(containerId, adKey, width, height) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // v2.2.5: Maximum priority and clickability
        container.innerHTML = ''; 
        container.style.pointerEvents = 'auto'; 
        container.style.zIndex = '2000'; 
        container.style.position = 'relative';
        
        const scriptOptions = document.createElement('script');
        scriptOptions.type = 'text/javascript';
        scriptOptions.text = `atOptions = { 'key' : '${adKey}', 'format' : 'iframe', 'height' : ${height}, 'width' : ${width}, 'params' : {} };`;
        
        const scriptInvoke = document.createElement('script');
        scriptInvoke.type = 'text/javascript';
        scriptInvoke.src = `https://wistfulseverely.com/${adKey}/invoke.js`;
        
        container.appendChild(scriptOptions);
        container.appendChild(scriptInvoke);
    }

    function loadAds() {
        // Sticky Footer Logic (v2.2.5 Fix: Prevent blocking)
        const stickyAd = document.getElementById('sticky-footer-ad');
        const closeStickyBtn = document.getElementById('close-sticky-ad');
        if (stickyAd && closeStickyBtn) {
            stickyAd.classList.remove('hidden');
            closeStickyBtn.onclick = (e) => { 
                if(e) e.stopPropagation();
                stickyAd.classList.add('hidden');
                stickyAd.style.pointerEvents = 'none'; // Force click-through
            };
        }

        const isMobile = window.innerWidth <= 768;
        const key320x50 = '0d6323163d0bf049f77d24605b7baf54';
        const key728x90 = 'd73933b8cfbbda3517bd62db85dfa4bf';

        // Richard's Optimized Flow (v2.3.6 Nuclear Cleanup)
        const slots = [
            ['ad-container-header', isMobile ? key320x50 : key728x90, isMobile ? 320 : 728, isMobile ? 50 : 90],
            ['ad-container-top', isMobile ? key320x50 : key728x90, isMobile ? 320 : 728, isMobile ? 50 : 90],
            ['ad-container-hero-top', key320x50, 320, 50],
            ['ad-container-bottom', isMobile ? key320x50 : key728x90, isMobile ? 320 : 728, isMobile ? 50 : 90],
            ['ad-container-guru', key320x50, 320, 50],
            ['ad-container-sticky', key320x50, 320, 50]
        ];

        slots.forEach(slot => {
            if(document.getElementById(slot[0])) {
                renderAd(...slot);
            }
        });
    }

    function setupUnmute() {
        const unmuteTrigger = document.getElementById('video-unmute-trigger');
        const overlayVideo = document.getElementById('overlay-guide-video');
        if(unmuteTrigger && overlayVideo) {
            const handleUnmute = (e) => {
                // Prevent default and propagation to kill "Touch to Search"
                if(e) {
                    if (e.cancelable) e.preventDefault();
                    e.stopPropagation();
                }

                overlayVideo.muted = false;
                overlayVideo.loop = false; // Kill loop for playback
                window.isUnmuted = true; // Global flag to prevent reset
                overlayVideo.currentTime = 0;
                overlayVideo.play().then(() => {
                    console.log("[AUDIO] Playing one-shot");
                }).catch(() => {
                    overlayVideo.muted = false;
                    overlayVideo.play();
                });
                
                const overlay = unmuteTrigger.querySelector('.unmute-overlay');
                if(overlay) overlay.remove(); 
                
                overlayVideo.onended = () => {
                    overlayVideo.pause();
                    overlayVideo.currentTime = 0; 
                    console.log("[AUDIO] Finished - Paused");
                };
                
                unmuteTrigger.removeEventListener('click', handleUnmute);
                unmuteTrigger.removeEventListener('touchstart', handleUnmute);
            };

            // Use both click and touchstart for instant response
            unmuteTrigger.addEventListener('click', handleUnmute);
            unmuteTrigger.addEventListener('touchstart', handleUnmute, { passive: false });
        }
    }

    function setupNavFilters() {
        document.getElementById('nav-home').onclick = (e) => { e.preventDefault(); filterMatches('all'); setActiveNav(e.target); };
        
        // v3.6.0: Global filter button handler
        document.querySelectorAll('.nav-filter').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.nav-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });
    }

    function setActiveNav(el) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        el.classList.add('active');
    }

    function renderGuruAnalysis(match) {
        const locked = document.getElementById('guru-locked-state');
        const unlocked = document.getElementById('guru-unlocked-state');
        const matchName = document.getElementById('guru-match-name');
        const leagueName = document.getElementById('guru-league-name');
        
        if (!locked || !unlocked || !match) return;

        matchName.textContent = `${match.homeTeam} vs ${match.awayTeam}`;
        leagueName.textContent = match.league;

        document.getElementById('guru-unlock-btn').onclick = () => {
            // v12.0: Less intrusive unlock
            const statusBox = document.getElementById('guru-status-box');
            statusBox.classList.remove('hidden');
            
            setTimeout(() => {
                locked.classList.add('hidden');
                unlocked.classList.remove('hidden');
                
                // Content of the oracle
                document.getElementById('guru-team-home').textContent = match.homeTeam;
                document.getElementById('guru-team-away').textContent = match.awayTeam;
                
                const homeProb = 35 + Math.floor(Math.random() * 30);
                const drawProb = 15 + Math.floor(Math.random() * 15);
                const awayProb = 100 - homeProb - drawProb;

                document.getElementById('pred-pct-home').textContent = homeProb + '%';
                document.getElementById('pred-pct-draw').textContent = drawProb + '%';
                document.getElementById('pred-pct-away').textContent = awayProb + '%';
                document.getElementById('pred-bar-home').style.width = homeProb + '%';
                document.getElementById('pred-bar-draw').style.width = drawProb + '%';
                document.getElementById('pred-bar-away').style.width = awayProb + '%';

                document.getElementById('guru-score').textContent = `${Math.floor(Math.random() * 3)} - ${Math.floor(Math.random() * 2)}`;
                
                // Strategic ad loading AFTER user sees value
                setTimeout(loadAds, 1000);
            }, 1500);
        };
    }

    function filterMatches(type) {
        window.currentFilter = type;
        
        // v7.0: Viral Hook Toggle & Visual Feedback
        const hookBar = document.getElementById('viral-hook-bar');
        const viralTag = document.getElementById('viral-tag');
        
        if (type === 'viral') {
            if (hookBar) hookBar.classList.remove('hidden');
            if (viralTag) viralTag.classList.remove('hidden');
            console.log("[VIRAL] Mode active - High conversion filters applied.");
        } else {
            if (hookBar) hookBar.classList.add('hidden');
            if (viralTag) viralTag.classList.add('hidden');
        }

        renderMatchSelector();
        renderSchedule();
    }

    function setupBackground() {
        if(!bgOverlay) return;
        bgOverlay.style.backgroundImage = `url(/sportflow_hero_bg.png)`;
        bgOverlay.style.backgroundSize = 'cover';
        bgOverlay.style.backgroundPosition = 'center';
        bgOverlay.style.opacity = '0.3';
    }

    async function syncMatches() {
        const leagues = [
            { id: 'arg.1', name: 'Liga Profesional (Arg)' },
            { id: 'uefa.champions', name: 'Champions League' },
            { id: 'conmebol.libertadores', name: 'Copa Libertadores' },
            { id: 'conmebol.sudamericana', name: 'Sudamericana' },
            { id: 'mex.1', name: 'Liga MX' },
            { id: 'esp.1', name: 'La Liga' },
            { id: 'eng.1', name: 'Premier League' },
            { id: 'col.1', name: 'Liga Colombia' },
            { id: 'ita.1', name: 'Serie A' },
            { id: 'usa.1', name: 'MLS (USA)' },
            { id: 'bra.1', name: 'Brasileirão' },
            { id: 'ger.1', name: 'Bundesliga' },
            { id: 'fra.1', name: 'Ligue 1' }
        ];

        const getChannel = (leagueName) => {
            const channels = {
                'Liga Profesional (Arg)': ['TNT Sports', 'ESPN Premium', 'TyC Sports'],
                'Champions League': ['ESPN', 'Fox Sports', 'Star+'],
                'Copa Libertadores': ['ESPN', 'Fox Sports', 'Telefe'],
                'Liga MX': ['TUDN', 'Fox Sports', 'TV Azteca'],
                'La Liga': ['DSports', 'ESPN'],
                'Premier League': ['ESPN', 'Star+']
            };
            const list = channels[leagueName] || ['ESPN', 'DSports', 'Fox Sports'];
            return list[Math.floor(Math.random() * list.length)];
        };

        try {
            let allMatches = [];
            for (const league of leagues) {
                try {
                    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard`);
                    if (!response.ok) throw new Error('Network error');
                    const data = await response.json();
                    
                    if (data && data.events && data.events.length > 0) {
                        const leagueMatches = data.events.map(event => {
                            const competitorHome = event.competitions[0].competitors.find(c => c.homeAway === 'home');
                            const competitorAway = event.competitions[0].competitors.find(c => c.homeAway === 'away');
                            
                            // Extraer hora local si es programado
                            let startTime = event.status.type.shortDetail;
                            if (event.status.type.state === 'pre') {
                                const date = new Date(event.date);
                                startTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }
                            
                            return {
                                id: event.id,
                                league: league.name,
                                channel: getChannel(league.name),
                                homeTeam: competitorHome.team.displayName,
                                awayTeam: competitorAway.team.displayName,
                                homeLogo: competitorHome.team.logo || 'https://via.placeholder.com/50',
                                awayLogo: competitorAway.team.logo || 'https://via.placeholder.com/50',
                                homeScore: competitorHome.score,
                                awayScore: competitorAway.score,
                                time: startTime,
                                date: new Date(event.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
                                status: event.status.type.state === 'in' ? 'EN VIVO' : 
                                        event.status.type.state === 'pre' ? 'PRÓXIMAMENTE' : 'FINALIZADO'
                            };
                        });
                        allMatches = [...allMatches, ...leagueMatches];
                    }
                } catch (err) {
                    console.warn(`Error en liga ${league.name}:`, err);
                }
            }

            if (allMatches.length > 0) {
                allMatches.sort((a, b) => {
                    const priority = { 'EN VIVO': 0, 'PRÓXIMAMENTE': 1, 'FINALIZADO': 2 };
                    return priority[a.status] - priority[b.status];
                });

                matches.length = 0;
                matches.push(...allMatches.slice(0, 20)); 

                // --- DATA PERSISTENCE FOR BLOG ---
                localStorage.setItem('sportflow_matches', JSON.stringify(matches));
                
                // v5.0: Entity Collection for SEO Automation
                const allTeams = new Set(JSON.parse(localStorage.getItem('sportflow_teams') || '[]'));
                const allLeagues = new Set(JSON.parse(localStorage.getItem('sportflow_leagues') || '[]'));
                
                allMatches.forEach(m => {
                    allTeams.add(m.homeTeam);
                    allTeams.add(m.awayTeam);
                    allLeagues.add(m.league);
                });
                
                localStorage.setItem('sportflow_teams', JSON.stringify([...allTeams].slice(0, 500))); // Cap for performance
                localStorage.setItem('sportflow_leagues', JSON.stringify([...allLeagues]));

                // v4.0: Multi-Blog Routing System
                const pathParts = window.location.pathname.split('/').filter(p => p);
                const isMatch = pathParts.includes('match') || pathParts.includes('partido');
                const isTeam = pathParts.includes('equipo') || (pathParts.includes('en') && pathParts.includes('team'));
                const isLeague = pathParts.includes('liga') || (pathParts.includes('en') && pathParts.includes('league'));
                const isCategory = pathParts.includes('categoria') || (pathParts.includes('en') && pathParts.includes('category'));
                
                window.currentLang = pathParts.includes('en') ? 'en' : 'es';

                if (isMatch) {
                    const matchIdFromUrl = pathParts[pathParts.indexOf('partido') + 1];
                    const linkedMatch = matches.find(m => String(m.id) === String(matchIdFromUrl));
                    if (linkedMatch) {
                        activeMatch = linkedMatch;
                    } else {
                        const poolMatch = allMatches.find(m => String(m.id) === String(matchIdFromUrl));
                        if (poolMatch) {
                            activeMatch = poolMatch;
                            if (!matches.find(m => m.id === poolMatch.id)) matches.unshift(poolMatch);
                        } else {
                            activeMatch = matches[0];
                        }
                    }
                } else if (isTeam || isLeague) {
                    const slug = pathParts[pathParts.length - 1].replace(/-/g, ' ');
                    const filtered = matches.filter(m => 
                        (isTeam && (m.homeTeam.toLowerCase().includes(slug) || m.awayTeam.toLowerCase().includes(slug))) ||
                        (isLeague && m.league.toLowerCase().includes(slug))
                    );
                    
                    if (filtered.length > 0) {
                        activeMatch = filtered[0];
                        window.currentContext = { type: isTeam ? 'team' : 'league', name: slug };
                    } else {
                        activeMatch = matches[0];
                    }
                } else if (isCategory) {
                    const slug = pathParts[pathParts.length - 1].replace(/-/g, ' ');
                    const VIRAL_KEYWORDS = {
                        'lucha': ['Wrestling', 'WWE', 'Lucha', 'UFC', 'MMA'],
                        'pelea': ['Boxing', 'Boxeo', 'Slap', 'Knockout'],
                        'chicas': ['Femenino', 'Girls', 'Women', 'Lingerie'],
                        'american': ['American', 'NFL', 'Fútbol Americano']
                    };
                    
                    const keywords = VIRAL_KEYWORDS[slug] || [slug];
                    const filtered = matches.filter(m => 
                        keywords.some(k => 
                            m.homeTeam.toLowerCase().includes(k.toLowerCase()) || 
                            m.awayTeam.toLowerCase().includes(k.toLowerCase()) || 
                            m.league.toLowerCase().includes(k.toLowerCase())
                        )
                    );

                    if (filtered.length > 0) {
                        activeMatch = filtered[0];
                        window.currentContext = { type: 'category', name: slug };
                    } else {
                        activeMatch = matches[0];
                    }
                } else if (!activeMatch || !matches.find(m => m.id === activeMatch.id)) {
                    activeMatch = matches[0];
                }

                updateSEOMetadata();
                updateCrawlerMagnet();
            } else {
                if(heroContent) heroContent.innerHTML = '<div class="loading-state">No hay partidos programados para hoy en estas ligas. ¡Vuelve más tarde!</div>';
            }
        } catch (error) {
            console.error('Error crítico de sincronización:', error);
            if(heroContent) heroContent.innerHTML = '<div class="loading-state">Error al conectar con el servidor de deportes.</div>';
        }
        
        if (matches.length > 0) {
            const previousId = activeMatch ? activeMatch.id : null;
            renderMatchSelector();
            renderHero(activeMatch || matches[0]);
            renderSchedule();
            
            // Only reset if it's a completely new match OR first load AND not yet unmuted
            if (!previousId) {
                if (!window.isUnmuted) resetVideoPlayer();
            } else if (activeMatch && activeMatch.id !== previousId) {
                resetVideoPlayer();
            }
        }
    }

    function renderMatchSelector() {
        if(!matchSelector) return;
        matchSelector.innerHTML = '';
        let filtered = matches;
        const filter = window.currentFilter || 'all';
        const query = window.searchQuery || '';

        if (filter === 'intl') filtered = matches.filter(m => m.league !== 'Liga MX');
        else if (filter === 'live') filtered = matches.filter(m => m.status === 'EN VIVO');
        else if (filter === 'viral') {
            // v9.0: Strategic Niche Expansion (Girls Sports, Slap Fighting, Extreme Boxing)
            const VIRAL_KEYWORDS = [
                'Wrestling', 'WWE', 'Boxing', 'Boxeo', 'Slap', 'Femenino', 'UFC', 'MMA', 'Extreme', 
                'Curioso', 'Lucha', 'Lingerie', 'American', 'Fútbol Americano', 'Chicas', 'Girls',
                'Shock', 'Knockout', 'Viral', 'Trending'
            ];
            filtered = matches.filter(m => 
                VIRAL_KEYWORDS.some(k => 
                    m.homeTeam.toLowerCase().includes(k.toLowerCase()) || 
                    m.awayTeam.toLowerCase().includes(k.toLowerCase()) || 
                    m.league.toLowerCase().includes(k.toLowerCase())
                )
            );
        }
        if (query) {
            filtered = filtered.filter(m => 
                m.homeTeam.toLowerCase().includes(query) || 
                m.awayTeam.toLowerCase().includes(query) || 
                m.league.toLowerCase().includes(query)
            );
        }

        filtered.forEach(match => {
            const card = document.createElement('div');
            card.className = `match-card-mini ${match.id === activeMatch.id ? 'active' : ''}`;
            card.innerHTML = `
                <div class="mini-header">
                    <span>${match.league}</span>
                    <div class="match-time-badge">${match.date} - ${match.time}</div>
                </div>
                <div class="mini-teams">
                    <div class="mini-team"><span>${match.homeTeam}</span><img src="${match.homeLogo}"></div>
                    <div class="mini-team"><span>${match.awayTeam}</span><img src="${match.awayLogo}"></div>
                </div>
                <div class="mini-status" style="color: ${match.status === 'EN VIVO' ? 'var(--accent)' : 'var(--text-muted)'}">
                    <i class="fas ${match.status === 'EN VIVO' ? 'fa-circle-play' : 'fa-clock'}"></i> ${match.status}
                </div>
            `;
            card.onclick = () => {
                activeMatch = match;
                document.querySelectorAll('.match-card-mini').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                resetVideoPlayer();
                renderHero(activeMatch || matches[0]);
                renderSchedule(); // Sincronizar tabla de abajo
                renderStandings(); // Generar tabla de posiciones
                updateSEOMetadata(); // Actualizar SEO y URL
            };
            matchSelector.appendChild(card);
        });
    }

    function renderHero(match) {
        if(!heroContent || !match) return;

        heroContent.innerHTML = `
            <div class="match-header">
                <span class="tournament">${match.league}</span>
                <span class="match-status" style="color: ${match.status === 'EN VIVO' ? 'var(--accent)' : 'var(--text-muted)'}">${match.status}</span>
            </div>
            
            ${window.currentContext ? `
            <div id="context-breadcrumb" style="margin-bottom: 20px; text-transform: uppercase; font-weight: 800; font-size: 1.5rem; color: var(--accent); border-left: 4px solid var(--accent); padding-left: 15px;">
                CENTRO DE DATOS: ${window.currentContext.name}
            </div>
            ` : ''}

            <div class="teams-container">
                <div class="team home"><div class="team-logo"><img src="${match.homeLogo}"></div><h3>${match.homeTeam}</h3></div>
                <div class="score-board">
                    <div class="score"><span id="home-score">${match.homeScore}</span><span class="separator">-</span><span id="away-score">${match.awayScore}</span></div>
                    <div class="match-time-badge">${match.date} - ${match.time}</div>
                </div>
                <div class="team away"><div class="team-logo"><img src="${match.awayLogo}"></div><h3>${match.awayTeam}</h3></div>
            </div>
            <div class="match-actions">
                <button class="btn-primary ${window.currentFilter === 'viral' ? 'btn-decoy-glow' : ''}" id="btn-watch-hd">
                    <i class="fas fa-play"></i> 
                    ${window.currentFilter === 'viral' ? I18N[window.currentLang].watchViral : I18N[window.currentLang].watchHD}
                </button>
                <div id="ad-container-hero-top" class="ad-responsive-container" style="margin-top: 15px; min-height: 50px;"></div>
            </div>
        `;
        document.getElementById('btn-watch-hd').onclick = () => {
            // v13.0: Direct access, no SmartLink pop-ups

            // v3.0 logic: Redirect high-risk matches to Handshake -> Blog
            const SAFE_LEAGUES = ['UFC', 'Champions League', 'Premier League', 'Liga MX', 'Boxing', 'MMA', 'La Liga', 'Serie A', 'Bundesliga'];
            const isHighRisk = SAFE_LEAGUES.some(l => activeMatch.league.includes(l));

            if (isHighRisk) {
                // Ir a la pasarela de seguridad
                window.location.href = `/handshake.html?id=${activeMatch.id}`;
            } else {
                // Deportistas normales o virales: Quedarse en la app (Signal 1 / Kick priority)
                const videoTab = document.querySelector('[data-tab="video"]');
                if(videoTab) videoTab.click();
                const player = document.querySelector('.branded-player-zone');
                if(player) player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                loadServer(1);
            }
        };

        // v3.0 Update Telegram Widget with current match context
        updateTelegramWidget(match);
    }

    function setupMatchSearch() {
        const searchInput = document.getElementById('match-search');
        if (searchInput) {
            searchInput.oninput = (e) => {
                window.searchQuery = e.target.value.toLowerCase();
                renderMatchSelector();
            };
        }
    }

    // Call it in init
    setupMatchSearch();




    function renderSchedule() {
        if(!scheduleBody) return;
        let filtered = matches;
        const filter = window.currentFilter || 'all';
        
        if (filter === 'intl') filtered = matches.filter(m => m.league !== 'Liga MX');
        else if (filter === 'live') filtered = matches.filter(m => m.status === 'EN VIVO');
        else if (filter === 'viral') {
            const VIRAL_KEYWORDS = ['Wrestling', 'WWE', 'Boxing', 'UFC', 'Women', 'Lingerie', 'MMA', 'Femenino', 'Slap'];
            filtered = matches.filter(m => 
                VIRAL_KEYWORDS.some(k => 
                    m.homeTeam.toLowerCase().includes(k.toLowerCase()) || 
                    m.awayTeam.toLowerCase().includes(k.toLowerCase()) || 
                    m.league.toLowerCase().includes(k.toLowerCase())
                )
            );
        }

        scheduleBody.innerHTML = '';
        if (filtered.length === 0) {
            scheduleBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">No hay partidos programados para el filtro actual.</td></tr>';
            return;
        }

        filtered.forEach((item, index) => {
            // Priority highlighting for viral content
            const isViral = filter === 'viral';
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.className = `${item.id === (activeMatch ? activeMatch.id : '') ? 'active-row' : ''} ${isViral ? 'viral-row' : ''}`;
            tr.innerHTML = `
                <td>${isViral ? '<i class="fas fa-fire" style="color:var(--accent)"></i> ' : ''}${item.homeTeam} vs ${item.awayTeam}</td>
                <td><span class="canal-tag">${item.channel}</span></td>
                <td>${item.date} - ${item.time}</td>
                <td><span class="status-online"><i class="fas fa-circle"></i> ${item.status}</span></td>
            `;
            tr.onclick = () => {
                activeMatch = item;
                
                // v3.0: Direct blog access from list
                const urlParams = new URLSearchParams(window.location.search);
                const isSocialRef = urlParams.get('ref') === 'social';
                const SAFE_LEAGUES = ['UFC', 'Champions League', 'Premier League', 'Liga MX', 'Boxing', 'MMA', 'La Liga', 'Serie A', 'Bundesliga'];
                const isHighRisk = SAFE_LEAGUES.some(l => activeMatch.league.includes(l));
                
                if (isHighRisk || isSocialRef) {
                    window.location.href = `/handshake.html?id=${activeMatch.id}&ref=social`;
                    return;
                }

                resetVideoPlayer();
                renderMatchSelector();
                renderHero(activeMatch);
                renderSchedule();
                renderStandings();
                updateSEOMetadata(); 
            };
            scheduleBody.appendChild(tr);
        });
    }

    function renderStandings() {
        const section = document.getElementById('league-standings-section');
        const body = document.getElementById('standings-body');
        const nameEl = document.getElementById('standing-league-name');
        
        if (!section || !body || !activeMatch) return;

        // Solo mostrar si hay contexto de liga o estamos en un partido específico
        section.classList.remove('hidden');
        nameEl.textContent = activeMatch.league;

        // Generar datos "creíbles" basados en los equipos del pool
        const leagueTeams = [...new Set(matches
            .filter(m => m.league === activeMatch.league)
            .flatMap(m => [m.homeTeam, m.awayTeam])
        )];
        
        if (leagueTeams.length < 2) {
            // Fallback: Añadir equipos genéricos de la liga si hay pocos
            leagueTeams.push("Rival A", "Rival B", "Rival C");
        }

        // Simular estadísticas
        let standingsData = leagueTeams.map((team, index) => {
            const pj = 25 + Math.floor(Math.random() * 5);
            const g = Math.floor(pj * (0.3 + Math.random() * 0.4));
            const e = Math.floor((pj - g) * Math.random());
            const p = pj - g - e;
            return { team, pj, g, e, p, pts: (g * 3 + e) };
        });

        // Sort by points
        standingsData.sort((a, b) => b.pts - a.pts);

        body.innerHTML = '';
        standingsData.forEach((row, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${i + 1}</td>
                <td style="font-weight: 600;">${row.team}</td>
                <td>${row.pj}</td>
                <td>${row.g}</td>
                <td>${row.e}</td>
                <td>${row.p}</td>
                <td style="color: var(--accent); font-weight: 800;">${row.pts}</td>
            `;
            body.appendChild(tr);
        });
    }

    // Tab Logic
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(c => c.id === `tab-${tab.dataset.tab}` ? c.classList.remove('hidden') : c.classList.add('hidden'));
        };
    });
     // --- VIDEO UNLOCK ENGINE REMOVED (v2.4.0) ---
    // User requested direct access without ads/verification steps.

    // --- STREAM LOADING LOGIC ---
    let lastFinalUrl = '';
    const serverBtns = document.querySelectorAll('.server-btn');

    serverBtns.forEach(btn => {
        btn.onclick = () => {
            if (btn.dataset.server === 'sos') {
                const masters = ['https://www.rojadirectatv.me/', 'https://www.pirlotv.fr/', 'https://librefutboltv.com/'];
                const randomMaster = masters[Math.floor(Math.random() * masters.length)];
                window.open(randomMaster, '_blank');
                return;
            }
            const serverNum = parseInt(btn.dataset.server);
            if (livePlayer && !livePlayer.classList.contains('hidden')) loadServer(serverNum);
        };
    });

    async function loadServer(serverNum) {
        if (!activeMatch) return;

        // Ensure player is visible (v2.4.2 Fix)
        if (livePlayer) {
            livePlayer.style.display = 'flex';
            livePlayer.classList.remove('hidden');
        }
        
        // Premium UI Feedback logic
        if (signalStatus) {
            signalStatus.textContent = "SIGNAL ESTABLISHED - HD QUALITY";
            signalStatus.style.color = "var(--accent)";
            const shield = document.querySelector('.signal-shield');
            if(shield) shield.style.boxShadow = "0 0 15px var(--accent)";
        }

        const safetyGate = document.getElementById('safety-gate');
        const unlockBtn = document.getElementById('btn-gate-unlock');
        const initialView = document.getElementById('gate-initial-view');
        const processView = document.getElementById('gate-unlock-process');
        const readyView = document.getElementById('gate-ready-view');
        const finalRedirectBtn = document.getElementById('btn-gate-redirect');
        
        // v2.6.0: Safe Mode Definition
        const SAFE_LEAGUES = ['UFC', 'Champions League', 'Premier League', 'Liga MX', 'Boxing', 'UFC Femenino', 'MMA'];
        const isHighRisk = SAFE_LEAGUES.some(l => activeMatch && activeMatch.league && activeMatch.league.includes(l));

        if (isHighRisk && safetyGate && unlockBtn) {
            if (streamIframe) streamIframe.classList.add('hidden');
            safetyGate.classList.remove('hidden');
            
            // State reset
            if(initialView) initialView.classList.remove('hidden');
            if(processView) processView.classList.add('hidden');
            if(readyView) readyView.classList.add('hidden');

            unlockBtn.onclick = () => {
                if(initialView) initialView.classList.add('hidden');
                if(processView) processView.classList.remove('hidden');
                
                // --- DECIPHERING ANIMATION ---
                let progress = 0;
                const progressBar = document.getElementById('unlock-progress');
                const matrixStatus = document.getElementById('matrix-status');
                const terminal = document.getElementById('terminal-logs');
                
                const logPool = [
                    "> Sincronizando túnel SportFlow-AI...",
                    "> Bypass geobloqueo activo...",
                    "> Estableciendo Handshake con servidor...",
                    "> Encriptación AES-256 aplicada...",
                    "> Optimizando búfer de video HD...",
                    "> Máscara IP generada [192.168.X.X]",
                    "> Conexión verificada: 100% segura"
                ];

                const interval = setInterval(() => {
                    progress += Math.random() * 15;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        
                        // Transition to READY
                        setTimeout(() => {
                            if(processView) processView.classList.add('hidden');
                            if(readyView) readyView.classList.remove('hidden');
                        }, 500);
                    }
                    
                    if(progressBar) progressBar.style.width = progress + "%";
                    if(matrixStatus) matrixStatus.textContent = `DESBLOQUEANDO: ${Math.floor(progress)}%`;
                    
                    // Add a log entry randomly
                    if(terminal && Math.random() > 0.6) {
                        const log = document.createElement('div');
                        log.className = 'log-entry';
                        log.textContent = logPool[Math.floor(Math.random() * logPool.length)];
                        terminal.appendChild(log);
                        terminal.scrollTop = terminal.scrollHeight;
                        if(terminal.childElementCount > 5) terminal.removeChild(terminal.firstChild);
                    }
                }, 400);

                finalRedirectBtn.onclick = () => {
                    const externalUrl = `https://www.rojadirectatv.me/`; 
                    window.open(externalUrl, '_blank');
                };
            };
            return;
        } else if (safetyGate) {
            safetyGate.classList.add('hidden');
            if (streamIframe) streamIframe.classList.remove('hidden');
        }

        // v2.4.1: Kick.com Integration (Priority 1)
        if (serverNum == 1 && CONFIG.KICK_CHANNEL) {
            if (streamIframe) {
                // v2.4.2: Enhanced Kick Embed with autoplay and parent domain security
                const parent = window.location.hostname;
                streamIframe.src = `https://player.kick.com/${CONFIG.KICK_CHANNEL}?parent=${parent}&autoplay=true&muted=false`;
                
                // v2.4.4: Real Kick Chat Integration
                toggleKickChat(true);
            }
            return;
        } else {
            toggleKickChat(false);
        }

        // Richard's OBS Direct Link (Priority 2)
        if (serverNum == 1 && CONFIG.OBS_LINK) {
            if (streamIframe) streamIframe.src = CONFIG.OBS_LINK;
            return;
        }
        const finalUrl = await findLiveStream(`${activeMatch.homeTeam} vs ${activeMatch.awayTeam}`, serverNum);
        lastFinalUrl = finalUrl;
        if (streamIframe) streamIframe.src = finalUrl;
        
        const fallback = document.getElementById('external-signal-fallback');
        const btnFallback = document.getElementById('btn-open-external');
        if (fallback && btnFallback) {
            fallback.classList.remove('hidden');
            btnFallback.onclick = () => {
                window.open(finalUrl, '_blank');
            };
        }
    }
    // --- SPORT-GURU ENGINE (RESTORED v2.3.1) ---
    const guruUnlockBtn = document.getElementById('guru-unlock-btn');
    if(guruUnlockBtn) {
        guruUnlockBtn.onclick = () => {
            if(!activeMatch) return;
            
            const statusBox = document.getElementById('guru-status-box');
            const statusText = document.getElementById('guru-status-text');
            const btnReveal = document.getElementById('guru-unlock-btn');
            
            if(activeMatch.status === 'FINALIZADO') {
                if(statusBox && statusText && btnReveal) {
                    btnReveal.style.display = 'none';
                    statusBox.classList.remove('hidden');
                    statusText.textContent = "Data Core: No es posible procesar datos históricos.";
                    setTimeout(() => {
                        statusBox.classList.add('hidden');
                        btnReveal.style.display = 'block';
                    }, 3000);
                }
                return;
            }

            // v13.0: Content First
            
            if(statusBox && statusText && btnReveal) {
                btnReveal.style.display = 'none';
                statusBox.classList.remove('hidden');
                
                const steps = [
                    `Sincronizando variables de ${activeMatch.homeTeam}...`,
                    `Analizando big-data en ${activeMatch.league}...`,
                    `Evaluando impacto de bajas...`,
                    "Sintetizando modelo predictivo SportFlow-AI..."
                ];
                
                let step = 0;
                const interval = setInterval(() => {
                    statusText.textContent = steps[step];
                    step++;
                    if(step >= steps.length) {
                        clearInterval(interval);
                        setTimeout(() => {
                            const lockedState = document.getElementById('guru-locked-state');
                            const unlockedState = document.getElementById('guru-unlocked-state');
                            if(lockedState && unlockedState) {
                                lockedState.classList.add('hidden');
                                unlockedState.classList.remove('hidden');
                                generateGuruPrediction(activeMatch);
                                btnReveal.style.display = 'block';
                                statusBox.classList.add('hidden');
                            }
                        }, 800);
                    }
                }, 1000);
            }
        };
    }

    function generateGuruPrediction(match) {
        if(!match) return;
        
        // Update Labels
        const teamHomeEl = document.getElementById('guru-team-home');
        const teamAwayEl = document.getElementById('guru-team-away');
        if(teamHomeEl) teamHomeEl.textContent = match.homeTeam;
        if(teamAwayEl) teamAwayEl.textContent = match.awayTeam;

        // --- LOGICA DE PROBABILIDADES AVANZADA ---
        let homeWeight = 35 + Math.random() * 25;
        let drawWeight = 20 + Math.random() * 10;
        let awayWeight = 100 - homeWeight - drawWeight;

        const isElite = match.league.includes('Champions') || match.league.includes('Premier');
        if (isElite) { drawWeight += 10; homeWeight -= 5; awayWeight -= 5; }

        const homeProb = Math.min(Math.max(Math.round(homeWeight), 5), 90);
        const drawProb = Math.min(Math.max(Math.round(drawWeight), 5), 90);
        const awayProb = 100 - homeProb - drawProb;

        // --- MARCADO PROBABLE Y TENDENCIA ---
        const getScore = (prob) => {
            if (prob > 60) return Math.floor(Math.random() * 3) + 2; // Favorito
            if (prob > 40) return Math.floor(Math.random() * 3) + 1;
            return Math.floor(Math.random() * 2); 
        };
        
        // Base de marcador real si el partido está en vivo
        const baseHome = (match.status === 'EN VIVO' && match.homeScore) ? parseInt(match.homeScore) : 0;
        const baseAway = (match.status === 'EN VIVO' && match.awayScore) ? parseInt(match.awayScore) : 0;

        let homeScore = baseHome + getScore(homeProb);
        let awayScore = baseAway + getScore(awayProb);
        
        let winnerText = "EMPATE TÉCNICO";
        let trendColor = "var(--text-muted)";
        
        if (homeProb > awayProb + 10) { 
            winnerText = `TENDENCIA: ${match.homeTeam}`; 
            trendColor = "var(--secondary)";
        } else if (awayProb > homeProb + 10) { 
            winnerText = `TENDENCIA: ${match.awayTeam}`; 
            trendColor = "var(--accent)";
        }

        const totalGoals = homeScore + awayScore;
        const goalPrediction = totalGoals > 2.5 ? "+2.5 GOLES" : "-2.5 GOLES";

        const contextPhrases = [
            `"SportFlow AI detecta alta probabilidad de victoria para ${match.homeTeam}."`,
            `"Análisis Big-Data: El empate es el resultado más probable en este ${match.homeTeam} vs ${match.awayTeam}."`,
            `"Cuidado con ${match.awayTeam}, nuestro motor de IA detecta un 82% de eficiencia táctica hoy."`,
            `"Mercado Caliente: La tendencia indica más de 2.5 goles en este duelo de ${match.league}."`,
            `"Predicción de Expertos: ${match.homeTeam} dominará la posesión según el histórico."`,
            `"El flujo de datos indica un bloque defensivo sólido por parte de ${match.awayTeam}."`,
            `"SportFlow Analytics: Las variables climáticas y de forma favorecen a ${match.homeTeam}."`,
            `"Nuestro motor predictivo ve un escenario de alta intensidad para este ${match.homeTeam} vs ${match.awayTeam}."`
        ];

        // Frases de Marcador en Vivo (Momentum)
        if(match.status === 'EN VIVO') {
            contextPhrases.push(`"Con el ${baseHome}-${baseAway} parcial, la energía del partido está cambiando."`);
            contextPhrases.push(`"El Brujo analizó el ${baseHome}-${baseAway} y ve más movimiento en el área."`);
            contextPhrases.push(`"A pesar del marcador actual, la jerarquía de liga se impondrá al final."`);
        }

        const selectedPhrase = contextPhrases[Math.floor(Math.random() * contextPhrases.length)];

        // UI Update
        const homePctEl = document.getElementById('pred-pct-home');
        const drawPctEl = document.getElementById('pred-pct-draw');
        const awayPctEl = document.getElementById('pred-pct-away');
        if(homePctEl) homePctEl.textContent = `${homeProb}%`;
        if(drawPctEl) drawPctEl.textContent = `${drawProb}%`;
        if(awayPctEl) awayPctEl.textContent = `${awayProb}%`;

        const homeBar = document.getElementById('pred-bar-home');
        if(homeBar) homeBar.style.width = `${homeProb}%`;
        const drawBar = document.getElementById('pred-bar-draw');
        if(drawBar) drawBar.style.width = `${drawProb}%`;
        const awayBar = document.getElementById('pred-bar-away');
        if(awayBar) awayBar.style.width = `${awayProb}%`;

        const scoreEl = document.getElementById('guru-score');
        if(scoreEl) scoreEl.innerHTML = `<span style="color: ${trendColor}">${winnerText}</span><br>${homeScore} - ${awayScore} <small>(${goalPrediction})</small>`;
        const phraseEl = document.getElementById('guru-phrase');
        if(phraseEl) phraseEl.textContent = selectedPhrase;
    }

    // --- FAN CHAT LOGIC ---
    function setupFanChat() {
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-chat');
        if (!chatMessages) return;

        const botMessages = ["¡Vamos!", "Golazo se viene", "El Gurú siempre acierta", "HD total hoy"];
        const users = ["FanGool", "MasterSport", "TurboStream"];

        setInterval(() => {
            const msg = document.createElement('div');
            msg.className = 'msg';
            msg.innerHTML = `<strong>${users[Math.floor(Math.random() * users.length)]}:</strong> ${botMessages[Math.floor(Math.random() * botMessages.length)]}`;
            chatMessages.appendChild(msg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            if (chatMessages.childElementCount > 10) chatMessages.removeChild(chatMessages.firstChild);
        }, 8000);

        const sendMessage = () => {
            if (!chatInput.value.trim()) return;
            const msg = document.createElement('div');
            msg.className = 'msg';
            msg.innerHTML = `<strong>Tú:</strong> ${chatInput.value}`;
            chatMessages.appendChild(msg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            chatInput.value = '';
        };

        if(sendBtn) sendBtn.onclick = sendMessage;
        if(chatInput) chatInput.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };
    }
    setupFanChat();

    function resetVideoPlayer() {
        if(videoOverlay) {
            videoOverlay.style.display = 'flex';
            const step1 = document.getElementById('overlay-step-1');
            const step2 = document.getElementById('overlay-step-2');
            if(step1) { step1.classList.remove('hidden'); step1.classList.add('active'); }
            if(step2) { step2.classList.remove('active'); step2.classList.add('hidden'); }
            const overlayVideo = document.getElementById('overlay-guide-video');
            if (overlayVideo) { 
                overlayVideo.muted = true;
                overlayVideo.loop = true; // Wait state loops
                overlayVideo.currentTime = 0; 
                overlayVideo.play().catch(() => {}); 
                window.isUnmuted = false; // Reset the unmute flag
            }
        }
        
        // Reset Guru State with ACTIVE MATCH Context
        const lockedState = document.getElementById('guru-locked-state');
        const unlockedState = document.getElementById('guru-unlocked-state');
        const matchNameEl = document.getElementById('guru-match-name');
        const leagueNameEl = document.getElementById('guru-league-name');

        if(lockedState) lockedState.classList.remove('hidden');
        if(unlockedState) unlockedState.classList.add('hidden');
        
        if(activeMatch) {
            if(matchNameEl) matchNameEl.textContent = `${activeMatch.homeTeam} vs ${activeMatch.awayTeam}`;
            if(leagueNameEl) leagueNameEl.textContent = activeMatch.league;
        }

        if(livePlayer) { livePlayer.style.display = 'none'; livePlayer.classList.add('hidden'); }
        if(streamIframe) streamIframe.src = '';
    }

    // --- SHARE FUNCTIONALITY (Richard VIP Viral v8.0) ---
    const shareBtn = document.getElementById('btn-share');
    if(shareBtn) {
        shareBtn.onclick = async () => {
            if(!activeMatch) return;

            // v8.0: Safe Link Logic (Handshake for Social Media to avoid bans)
            const isViral = window.currentFilter === 'viral';
            const shareUrl = isViral 
                ? `${window.location.origin}/handshake.html?id=${activeMatch.id}&ref=social`
                : window.location.href;

            const shareData = {
                title: isViral ? `🔥 ¡URGENTE! Mira esto: ${activeMatch.homeTeam} vs ${activeMatch.awayTeam}` : 'SportFlow AI | VIP Sports',
                text: isViral 
                    ? `😱 No vas a creer lo que está pasando en este evento de ${activeMatch.homeTeam}. ¡Míralo EN VIVO aquí rápido! ⚽🔥`
                    : `¡Disfruta el partido de ${activeMatch.homeTeam} vs ${activeMatch.awayTeam} en HD! Análisis y datos exclusivos. ⚽🔥`,
                url: shareUrl
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    // Fallback: Copy to clipboard
                    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                    alert("¡Link y mensaje copiados al portapapeles! Compártelo en WhatsApp o Redes Sociales. 🚀");
                }
            } catch (err) { }
        };
    }

    document.getElementById('btn-direct').onclick = () => {
        if (lastFinalUrl) { window.open(lastFinalUrl, '_blank'); }
        else if (streamIframe && streamIframe.src && streamIframe.src !== 'about:blank') { window.open(streamIframe.src, '_blank'); }
        else { alert("Selecciona un partido y desbloquea la señal primero."); }
    };

    const btnTutorial = document.getElementById('btn-tutorial');
    const guideModal = document.getElementById('guru-guide-modal');
    const closeGuide = document.getElementById('close-guide');
    const guideVideo = document.getElementById('ai-guide-video');

    if (btnTutorial && guideModal) {
        btnTutorial.onclick = () => {
            guideModal.classList.remove('hidden');
            if (guideVideo) { guideVideo.currentTime = 0; guideVideo.play().catch(() => {}); }
        };
    }
    if (closeGuide && guideModal) { 
        closeGuide.onclick = () => { guideModal.classList.add('hidden'); if (guideVideo) guideVideo.pause(); }; 
    }
    if (guideModal) {
        guideModal.onclick = (e) => { if (e.target === guideModal) { guideModal.classList.add('hidden'); if (guideVideo) guideVideo.pause(); } };
    }

    // --- AUTOMATED SEO ENGINE ---
    function updateSEOMetadata() {
        if (!activeMatch) return;
        
        let title = `${activeMatch.homeTeam} vs ${activeMatch.awayTeam} EN VIVO | SportFlow AI`;
        let desc = `Mira el partido entre ${activeMatch.homeTeam} y ${activeMatch.awayTeam} por ${activeMatch.league} en vivo. Resultados, estadísticas y predicciones de SportFlow AI.`;
        let path = `/partido/${activeMatch.id}/${activeMatch.homeTeam.toLowerCase().replace(/\s+/g, '-')}-vs-${activeMatch.awayTeam.toLowerCase().replace(/\s+/g, '-')}`;

        // v4.0 Contextual SEO
        if (window.currentContext) {
            const { type, name } = window.currentContext;
            const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
            const isEn = window.currentLang === 'en';
            
            if (type === 'team') {
                title = isEn ? `${cleanName} Live | SportFlow Data Center` : `Canal ${cleanName} HD | Centro de Datos SportFlow AI`;
                desc = isEn ? `Follow all ${cleanName} matches live. Stats, lineups and HD streaming.` : `Sigue todos los partidos de ${cleanName} en vivo. Estadísticas, alineaciones y transmisión en alta definición.`;
            } else if (type === 'league') {
                title = isEn ? `${cleanName} Results | Standings & Live` : `Resultados ${cleanName} | Tabla de Posiciones y En Vivo`;
                desc = isEn ? `Complete coverage of ${cleanName}. Results and standings updated by AI.` : `Cobertura completa de la ${cleanName}. Partidos de hoy, resultados y tabla actualizada por IA.`;
            } else if (type === 'category') {
                title = isEn ? `${cleanName} Live | Premium HD Streaming` : `${cleanName} en Vivo | Transmisión Especial HD`;
                desc = isEn ? `Watch the best ${cleanName} events today. Exclusive premium access.` : `Mira los mejores eventos de ${cleanName} hoy. Acceso premium a transmisiones virales y exclusivas.`;
            }
            
            // Actualizar URL sin recargar
            const slug = name.replace(/ /g, '-');
            let pathPrefix = isEn ? '/en' : '';
            let typePath = type;
            if (isEn) {
                if (type === 'team') typePath = 'team';
                if (type === 'league') typePath = 'league';
                if (type === 'category') typePath = 'category';
            }
            const newPath = `${pathPrefix}/${typePath}/${slug}`;
            window.history.replaceState({ type, name }, title, newPath);
        } else if (activeMatch) {
            // If no specific context, but there's an active match, use its details for the path
            const isEn = window.currentLang === 'en';
            const pathPrefix = isEn ? '/en' : '';
            const matchPathSegment = isEn ? 'match' : 'partido';
            const homeTeamSlug = activeMatch.homeTeam.toLowerCase().replace(/\s+/g, '-');
            const awayTeamSlug = activeMatch.awayTeam.toLowerCase().replace(/\s+/g, '-');
            const newPath = `${pathPrefix}/${matchPathSegment}/${activeMatch.id}/${homeTeamSlug}-vs-${awayTeamSlug}`;
            window.history.replaceState({ matchId: activeMatch.id }, title, newPath);
        }

        document.title = title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
        
        // Open Graph refresh
        document.querySelector('meta[property="og.title"]')?.setAttribute('content', title);
        document.querySelector('meta[property="og.description"]')?.setAttribute('content', desc);

        // The history.replaceState for activeMatch context is now handled within the if/else if blocks
        // window.history.replaceState({ matchId: activeMatch.id, context: window.currentContext }, title, path);

        // Update Guru Hero Titles
        const gMatch = document.getElementById('guru-match-name');
        const gLeague = document.getElementById('guru-league-name');
        const gHome = document.getElementById('guru-team-home');
        const gAway = document.getElementById('guru-team-away');
        if(gMatch) gMatch.textContent = `${activeMatch.homeTeam} vs ${activeMatch.awayTeam}`;
        if(gLeague) gLeague.textContent = activeMatch.league;
        if(gHome) gHome.textContent = activeMatch.homeTeam;
        if(gAway) gAway.textContent = activeMatch.awayTeam;
    }

    function updateCrawlerMagnet() {
        const magnet = document.getElementById('seo-crawler-magnet');
        if (!magnet || matches.length === 0) return;
        
        const teams = new Set(JSON.parse(localStorage.getItem('sportflow_teams') || '[]'));
        const leagues = new Set(JSON.parse(localStorage.getItem('sportflow_leagues') || '[]'));
        const I18N = {
            es: {
                footerTeams: 'EQUIPOS DESTACADOS',
                footerLeagues: 'LIGAS PRINCIPALES',
                footerSpecial: 'CATEGORÍAS ESPECIALES'
            },
            en: {
                footerTeams: 'FEATURED TEAMS',
                footerLeagues: 'TOP LEAGUES',
                footerSpecial: 'SPECIAL CATEGORIES'
            }
        };

        let html = '<div class="seo-footer-explorer" style="padding: 40px; background: #050505; border-top: 1px solid #222; margin-top: 50px;">';
        
        // Match Section
        html += '<div class="seo-section"><h4>PARTIDOS DE HOY</h4><ul>';
        matches.forEach(m => {
            const cleanName = `${m.homeTeam}-vs-${m.awayTeam}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
            html += `<li><a href="/partido/${m.id}/${cleanName}">Ver ${m.homeTeam} vs ${m.awayTeam} en vivo</a></li>`;
        });
        html += '</ul></div>';

        // Team Section
        const langPrefix = window.currentLang === 'en' ? '/en' : '';
        const teamPath = window.currentLang === 'en' ? 'team' : 'equipo';
        const t = I18N[window.currentLang] || I18N.es;

        if (teams.size > 0) {
            html += `<div class="seo-section"><h4>${t.footerTeams}</h4><ul>`;
            [...teams].slice(0, 30).forEach(team => {
                const slug = team.toLowerCase().replace(/ /g, '-');
                html += `<li><a href="${langPrefix}/${teamPath}/${slug}">${window.currentLang === 'en' ? team + ' HD' : 'Canal ' + team + ' HD'}</a></li>`;
            });
            html += '</ul></div>';
        }

        // Categorías de Nicho (v10.0 + UK v11.0)
        const categories = window.currentLang === 'en' ? ['Wrestling', 'Slap Fights', 'Girls Sports', 'American Football'] : ['Lucha Libre', 'Peleas Slap', 'Deporte Femenino', 'Fútbol Americano'];
        html += `<div class="seo-section"><h4>${t.footerSpecial}</h4><ul>`;
        categories.forEach(cat => {
            const catSlug = cat.toLowerCase().replace(/ /g, '-').replace('femenino', 'chicas').replace('fights', 'pelea').replace('wrestling', 'lucha').replace('girls-sports', 'chicas').replace('football', 'american');
            html += `<li><a href="${langPrefix}/${window.currentLang === 'en' ? 'category' : 'categoria'}/${catSlug}">${window.currentLang === 'en' ? cat + ' Live' : cat + ' en Vivo'}</a></li>`;
        });
        html += '</ul></div>';

        // League Section
        html += `<div class="seo-section"><h4>${t.footerLeagues}</h4><ul>`;
        [...leagues].forEach(l => {
            const slug = l.toLowerCase().replace(/\s+/g, '-');
            html += `<li><a href="/liga/${slug}">${l} online</a></li>`;
        });
        html += '</ul></div>';

        html += '</div>';
        magnet.innerHTML = html;
        magnet.style.display = 'block';
        magnet.style.visibility = 'visible';
        
        // Re-trigger ad loading for the new dynamic containers
        setTimeout(loadAds, 500);
    }

    // Exportar para usar en otros clicks
    window.refreshSEO = updateSEOMetadata;

    // --- KICK INTERACTION ENGINE (v2.4.4) ---
    function toggleKickChat(active) {
        const fakeChat = document.getElementById('chat-messages');
        const fakeInput = document.getElementById('chat-input-area');
        const realChat = document.getElementById('real-kick-chat');
        const chatIframe = document.getElementById('kick-chat-iframe');
        const announcement = document.getElementById('kick-live-call');
        const viralTag = document.getElementById('viral-tag');

        if (active) {
            if (fakeChat) fakeChat.classList.add('hidden');
            if (fakeInput) fakeInput.classList.add('hidden');
            if (realChat) {
                realChat.classList.remove('hidden');
                if (chatIframe && !chatIframe.src) {
                    chatIframe.src = `https://kick.com/popout/${CONFIG.KICK_CHANNEL}/chat`;
                }
            }
            if (announcement) announcement.classList.remove('hidden');
            if (viralTag) viralTag.classList.remove('hidden');
            startKickNotifications();
        } else {
            if (fakeChat) fakeChat.classList.remove('hidden');
            if (fakeInput) fakeInput.classList.remove('hidden');
            if (realChat) realChat.classList.add('hidden');
            if (announcement) announcement.classList.add('hidden');
            if (viralTag) viralTag.classList.add('hidden');
        }
    }

    let kickNotifyInterval = null;
    function startKickNotifications() {
        if (kickNotifyInterval) return;
        const callText = document.getElementById('kick-call-text');
        const phrases = [
            "¡ÚNETE AL CHAT EN KICK PARA SORTEOS!",
            "¡SÍGUEME EN KICK PARA NO PERDER LA SEÑAL!",
            "¡CHARLA EN VIVO CON RICHARD AQUÍ!",
            "¿QUIÉN GANA HOY? VOTA EN EL CHAT DE KICK"
        ];
        let current = 0;
        kickNotifyInterval = setInterval(() => {
            if (!document.getElementById('kick-live-call').classList.contains('hidden')) {
                current = (current + 1) % phrases.length;
                if (callText) callText.textContent = phrases[current];
            } else {
                clearInterval(kickNotifyInterval);
                kickNotifyInterval = null;
            }
        }, 10000);
    }

    // Autoplay reinforcement (v1.8.2)
    document.addEventListener('click', () => {
        const ovVideo = document.getElementById('overlay-guide-video');
        if (ovVideo && ovVideo.paused) ovVideo.play().catch(() => {});
    }, { once: true });

    // --- TELEGRAM WIDGET ENGINE (v3.0) ---
    function updateTelegramWidget(match) {
        const stream = document.getElementById('telegram-msg-stream');
        if(!stream || !match) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const alerts = [
            `🔥 ¡Señal activa para el ${match.homeTeam} vs ${match.awayTeam}! Entra ahora.`,
            `📊 El Gurú detectó movimiento en las apuestas para ${match.league}.`,
            `🚀 Únete al VIP para ver las fijas de hoy sin anuncios.`
        ];

        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        
        stream.innerHTML = `
            <div class="tg-msg">
                <span class="tg-time">${time}</span>
                <p>${randomAlert}</p>
            </div>
        `;
    }

        `;
    }

    // Initialize Crawler Magnet for first time
    updateCrawlerMagnet();
});
