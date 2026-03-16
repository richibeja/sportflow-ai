document.addEventListener('DOMContentLoaded', () => {
    console.log('SportFlow AI: Extreme Ultra v5.0');
    
    // --- MASTER CONFIG (Control total de Richard) ---
    const CONFIG = {
        smartLink: 'https://www.effectivegatecpm.com/jm7f9ypm?key=b8f95870742d9bd9e730551fa23f4398'
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

    // --- MONETIZATION ENGINE (Smart-Targeting) ---
    window.triggerSmartLink = () => {
        window.open(CONFIG.smartLink, '_blank');
    };

    function setupNavFilters() {
        document.getElementById('nav-home').onclick = (e) => { e.preventDefault(); filterMatches('all'); setActiveNav(e.target); };
        document.getElementById('nav-intl').onclick = (e) => { e.preventDefault(); filterMatches('intl'); setActiveNav(e.target); };
        document.getElementById('nav-live').onclick = (e) => { e.preventDefault(); filterMatches('live'); setActiveNav(e.target); };
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
            { id: 'col.1', name: 'Liga Colombia' },
            { id: 'arg.1', name: 'Liga Argentina' },
            { id: 'bra.1', name: 'Brasileirão' },
            { id: 'chi.1', name: 'Liga Chile' },
            { id: 'per.1', name: 'Liga Perú' },
            { id: 'ecu.1', name: 'Liga Ecuador' },
            { id: 'usa.1', name: 'MLS (USA)' },
            { id: 'eng.1', name: 'Premier League' },
            { id: 'esp.1', name: 'La Liga' },
            { id: 'ita.1', name: 'Serie A' },
            { id: 'ger.1', name: 'Bundesliga' },
            { id: 'fra.1', name: 'Ligue 1' },
            { id: 'uefa.champions', name: 'Champions League' },
            { id: 'uefa.europa', name: 'Europa League' },
            { id: 'conmebol.libertadores', name: 'Copa Libertadores' },
            { id: 'conmebol.sudamericana', name: 'Sudamericana' }
        ];

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
                            
                            return {
                                id: event.id,
                                league: league.name,
                                homeTeam: competitorHome.team.displayName,
                                awayTeam: competitorAway.team.displayName,
                                homeLogo: competitorHome.team.logo || 'https://via.placeholder.com/50',
                                awayLogo: competitorAway.team.logo || 'https://via.placeholder.com/50',
                                homeScore: competitorHome.score,
                                awayScore: competitorAway.score,
                                time: event.status.type.shortDetail,
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
                matches.push(...allMatches.slice(0, 20)); // Más capacidad para que siempre haya qué ver

                if (!activeMatch || !matches.find(m => m.id === activeMatch.id)) {
                    activeMatch = matches[0];
                }
            } else {
                if(heroContent) heroContent.innerHTML = '<div class="loading-state">No hay partidos programados para hoy en estas ligas. ¡Vuelve más tarde!</div>';
            }
        } catch (error) {
            console.error('Error crítico de sincronización:', error);
            if(heroContent) heroContent.innerHTML = '<div class="loading-state">Error al conectar con el servidor de deportes.</div>';
        }
        
        renderMatchSelector();
        renderHero(activeMatch);
        renderSchedule();
        renderAIAnalytics();
        renderHackerLogs();
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
                renderSchedule(); // Sincronizar tabla de abajo
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
            renderAIAnalytics();
    }

    function renderAIAnalytics() {
        const momentumContainer = document.getElementById('momentum-bars');
        if(!momentumContainer) return;

        // Limpiar
        momentumContainer.innerHTML = '';
        for(let i=0; i<40; i++) {
            const h = Math.floor(Math.random() * 100);
            const bar = document.createElement('div');
            bar.className = 'm-bar';
            bar.style.height = `${h}%`;
            bar.style.opacity = (h/100);
            momentumContainer.appendChild(bar);
        }
    function renderHackerLogs() {
        const tickerContainer = document.getElementById('tab-ticker');
        if(!tickerContainer) return;
        
        const eventTypes = [
            { icon: 'fa-shield-alt', text: 'ATAQUE BLOQUEADO', color: '#ff4757' },
            { icon: 'fa-bullseye', text: 'INTENTO DE GOL INTERCEPTADO', color: '#39ff14' },
            { icon: 'fa-exchange-alt', text: 'NODO DE JUGADOR ACTUALIZADO (CAMBIO)', color: '#00d4ff' },
            { icon: 'fa-exclamation-circle', text: 'ADVERTENCIA DE TARJETA DETECTADA', color: '#ffa502' }
        ];

        tickerContainer.innerHTML = `
            <div class="hacker-logs-wrapper">
                <h4 class="hacker-sub"><i class="fas fa-terminal"></i> SIGNAL EVENT LOGS</h4>
                <div class="logs-list">
                    ${Array.from({length: 6}).map(() => {
                        const evt = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                        return `
                        <div class="log-entry">
                            <span class="log-time">[${Math.floor(Math.random()*90)}']</span>
                            <i class="fas ${evt.icon}" style="color: ${evt.color}"></i>
                            <span class="log-text">${evt.text}</span>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
        // Predicciones Aleatorias Realistas
        const homeProb = 30 + Math.floor(Math.random() * 40);
        const drawProb = 10 + Math.floor(Math.random() * 20);
        const awayProb = 100 - homeProb - drawProb;

        document.getElementById('pred-home').textContent = `${homeProb}%`;
        document.getElementById('pred-draw').textContent = `${drawProb}%`;
        document.getElementById('pred-away').textContent = `${awayProb}%`;

        // Estadísticas básicas
        const pos = 45 + Math.floor(Math.random() * 10);
        document.getElementById('stat-possession').textContent = `${pos}% - ${100-pos}%`;
        document.getElementById('pos-bar').style.width = `${pos}%`;

        // Madrina Tip
        const tips = [
            "El local viene con racha, ¡métele un par de pesitos al hándicap!",
            "Veo un partido muy trabado, el -2.5 goles es la fija de hoy.",
            "¡Ojo con el visitante! Han hecho 3 cambios ofensivos, el empate no es loco.",
            "Mi intuición dice que habrá gol en los últimos 10 minutos. ¡Pilas pues!",
            "Si quieres ganar de verdad, sígueme en Telegram que allá tengo la fija."
        ];
        document.getElementById('madrina-tip-text').textContent = tips[Math.floor(Math.random() * tips.length)];
    };
    }

    function renderNews() {
        if(!newsContainer) return;
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

        scheduleBody.innerHTML = '';
        filtered.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.className = item.id === (activeMatch ? activeMatch.id : '') ? 'active-row' : '';
            tr.innerHTML = `
                <td>${item.homeTeam} vs ${item.awayTeam}</td>
                <td><span class="canal-tag">${item.league.substring(0,10)}...</span></td>
                <td>${item.time}</td>
                <td><span class="status-online"><i class="fas fa-circle"></i> ${item.status}</span></td>
            `;
            tr.onclick = () => {
                activeMatch = item;
                resetVideoPlayer();
                renderMatchSelector();
                renderHero(activeMatch);
                renderSchedule();
                document.getElementById('main-match-hero').scrollIntoView({ behavior: 'smooth' });
            };
            scheduleBody.appendChild(tr);
        });
    }

    // Tab Logic
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(c => c.id === `tab-${tab.dataset.tab}` ? c.classList.remove('hidden') : c.classList.add('hidden'));
            if(tab.dataset.tab === 'video') triggerSmartLink();
            if(tab.dataset.tab === 'stats') renderAIAnalytics();
        };
    });

    // --- VIDEO EXTREME LOGIC ---
    const unlockBtn = document.getElementById('unlock-stream-btn');
    const videoOverlay = document.getElementById('video-overlay');
    const livePlayer = document.getElementById('live-player');
    const streamIframe = document.getElementById('stream-iframe');
    const serverBtns = document.querySelectorAll('.server-btn');
    const signalStatus = document.getElementById('signal-status');

    let currentServer = 1;
    let autoHealInterval = null;

    if(unlockBtn) {
        unlockBtn.onclick = async () => {
            triggerSmartLink();
            
            unlockBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> INTERCEPTANDO...';
            signalStatus.textContent = "ESTABLECIENDO TÚNEL SEGURO...";
            
            setTimeout(() => {
                if(videoOverlay) videoOverlay.style.display = 'none';
                if(livePlayer) livePlayer.style.display = 'block';
                livePlayer.classList.remove('hidden');
                
                loadServer(1);
                // Auto-heal más ligero para no trabar la PC de Richard
                if(autoHealInterval) clearInterval(autoHealInterval);
                autoHealInterval = setInterval(() => {
                    if (!document.hidden && !livePlayer.classList.contains('hidden')) {
                        console.log("Re-sincronizando buffer...");
                    }
                }, 60000); 
            }, 1000);
        };
    }

    serverBtns.forEach(btn => {
        btn.onclick = () => {
            if (btn.dataset.server === 'sos') {
                // S.O.S Maestro: Abre agregadores de alta resistencia en pestaña nueva
                const masters = [
                    'https://www.rojadirectatv.me/',
                    'https://www.pirlotv.fr/',
                    'https://librefutboltv.com/'
                ];
                const randomMaster = masters[Math.floor(Math.random() * masters.length)];
                window.open(randomMaster, '_blank');
                triggerSmartLink();
                return;
            }
            serverBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentServer = parseInt(btn.dataset.server);
            if (!livePlayer.classList.contains('hidden')) loadServer(currentServer);
        };
    });

    let currentSubSource = 0;

    async function loadServer(serverNum) {
        if (!activeMatch) return;
        
        signalStatus.textContent = "INTERCEPTANDO NODO SEGURO...";
        signalStatus.style.color = "var(--secondary)";
        streamIframe.src = ''; 

        const finalUrl = await findLiveStream(`${activeMatch.homeTeam} vs ${activeMatch.awayTeam}`, serverNum);
        console.log(`[HACKER] Signal intercepted: ${finalUrl}`);
        
        // Cargar en el iframe
        streamIframe.src = finalUrl;

        // Limpiar avisos previos
        const oldNotice = document.getElementById('hacker-bypass-notice');
        if(oldNotice) oldNotice.remove();

        // Crear el "Bypass Wizard" (Botón de fuerza bruta)
        const notice = document.createElement('div');
        notice.id = 'hacker-bypass-notice';
        notice.className = 'hacker-wizard';
        notice.innerHTML = `
            <div class="wizard-content">
                <i class="fas fa-user-secret"></i>
                <p>LA SEÑAL HA SIDO INTERCEPTADA</p>
                <small>Si el cuadro se ve negro por seguridad de tu PC, usa el ruteo directo:</small>
                <button onclick="window.open('${finalUrl}', '_blank'); triggerSmartLink();">ABRIR SEÑAL MAESTRA</button>
            </div>
        `;
        document.querySelector('.live-player').appendChild(notice);

        // Mostrar el botón después de un breve delay
        setTimeout(() => {
            if(document.getElementById('hacker-bypass-notice')) {
                document.getElementById('hacker-bypass-notice').classList.add('show');
            }
        }, 1500);

        signalStatus.textContent = "SIGNAL STABLE (HD)";
        signalStatus.style.color = "var(--accent)";
    }

    function startAutoHeal() {
        if(autoHealInterval) clearInterval(autoHealInterval);
        autoHealInterval = setInterval(() => {
            if (document.hidden) return; 
            if (!livePlayer.classList.contains('hidden')) {
                // Solo loguear, no refrescar el DOM agresivamente
                console.log("Hacker Mode: Connection heartbeat...");
            }
        }, 300000); // 5 minutos, mucho más estable
    }

    function resetVideoPlayer() {
        if(videoOverlay) videoOverlay.classList.remove('hidden');
        if(livePlayer) livePlayer.classList.add('hidden');
        if(streamIframe) streamIframe.src = '';
        if(autoHealInterval) clearInterval(autoHealInterval);
    }

    // --- PREMIUM CONTROLS ---
    document.getElementById('btn-cinema').onclick = () => {
        document.body.classList.toggle('cinema-mode');
        document.getElementById('btn-cinema').innerHTML = document.body.classList.contains('cinema-mode') ? 
            '<i class="fas fa-compress"></i> SALIR CINE' : '<i class="fas fa-tv"></i> MODO CINE';
    };
    
    document.getElementById('btn-direct').onclick = () => {
        if (streamIframe.src) {
            window.open(streamIframe.src, '_blank');
            triggerSmartLink();
        } else {
            alert("Selecciona un partido y desbloquea la señal primero.");
        }
    };

    document.getElementById('btn-report').onclick = () => {
        signalStatus.textContent = "SIGNAL FAILURE REPORTED. RE-SCANNING NODES...";
        signalStatus.style.color = "#ff4757";
        setTimeout(() => {
            loadServer(currentServer); // Al re-llamar loadServer, el motor busca una nueva ruta
        }, 1000);
    };



    // Floating CTA
    setTimeout(() => {
        const floatingCta = document.getElementById('floating-cta');
        if(floatingCta) {
            floatingCta.classList.add('show');
            const floatBtn = document.getElementById('btn-floating-smart');
            if(floatBtn) floatBtn.onclick = () => triggerSmartLink();
        }
    }, 10000);
});
