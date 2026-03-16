document.addEventListener('DOMContentLoaded', () => {

    
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
    setupNavFilters();
    setInterval(syncMatches, 60000);

    // Ensure first step is visible
    setTimeout(() => {
        const step1 = document.getElementById('overlay-step-1');
        if(step1) step1.classList.add('active');
    }, 100);

    // --- MONETIZATION ENGINE (Richard Special v2) ---
    window.triggerSmartLink = () => {
        window.open(CONFIG.smartLink, '_blank');
    };

    function setupNavFilters() {
        document.getElementById('nav-home').onclick = (e) => { e.preventDefault(); filterMatches('all'); setActiveNav(e.target); };
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
                matches.push(...allMatches.slice(0, 20)); // Más capacidad para que siempre haya qué ver

                // --- DEEP LINKING LOGIC ---
                const urlParams = window.location.pathname.split('/');
                const matchIdFromUrl = urlParams.includes('partido') ? urlParams[urlParams.indexOf('partido') + 1] : null;

                if (matchIdFromUrl) {
                    const linkedMatch = matches.find(m => String(m.id) === String(matchIdFromUrl));
                    if (linkedMatch) {
                        activeMatch = linkedMatch;
                    } else {
                        // Si no está en el TOP 20, intentamos encontrarlo en el pool completo
                        const poolMatch = allMatches.find(m => String(m.id) === String(matchIdFromUrl));
                        if (poolMatch) {
                            activeMatch = poolMatch;
                            if (!matches.find(m => m.id === poolMatch.id)) matches.unshift(poolMatch);
                        } else {
                            activeMatch = matches[0];
                        }
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
            renderMatchSelector();
            renderHero(activeMatch || matches[0]);
            renderSchedule();
            resetVideoPlayer();
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
                    <span class="match-time-badge">${match.time}</span>
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
                renderHero(activeMatch);
                renderSchedule(); // Sincronizar tabla de abajo
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
            <div class="teams-container">
                <div class="team home"><div class="team-logo"><img src="${match.homeLogo}"></div><h3>${match.homeTeam}</h3></div>
                <div class="score-board">
                    <div class="score"><span id="home-score">${match.homeScore}</span><span class="separator">-</span><span id="away-score">${match.awayScore}</span></div>
                    <div class="match-time-badge">${match.date} - ${match.time}</div>
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

        scheduleBody.innerHTML = '';
        filtered.forEach(item => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.className = item.id === (activeMatch ? activeMatch.id : '') ? 'active-row' : '';
            tr.innerHTML = `
                <td>${item.homeTeam} vs ${item.awayTeam}</td>
                <td><span class="canal-tag">${item.channel}</span></td>
                <td>${item.date} - ${item.time}</td>
                <td><span class="status-online"><i class="fas fa-circle"></i> ${item.status}</span></td>
            `;
            tr.onclick = () => {
                activeMatch = item;
                resetVideoPlayer();
                renderMatchSelector();
                renderHero(activeMatch);
                renderSchedule();
                updateSEOMetadata(); // Actualizar SEO y URL
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
        };
    });
     // --- VIDEO UNLOCK ENGINE (Original 3-Step Flow Restored) ---
    const step1Btn = document.getElementById('unlock-step-1-btn');
    const step2Btn = document.getElementById('unlock-step-2-btn');
    const signalStatus = document.getElementById('signal-status');
    const videoOverlay = document.getElementById('video-overlay');
    const livePlayer = document.getElementById('live-player');
    const streamIframe = document.getElementById('stream-iframe');

    if(step1Btn) {
        step1Btn.onclick = () => {
            triggerSmartLink(); // Ad 1
            
            const step1 = document.getElementById('overlay-step-1');
            const step2 = document.getElementById('overlay-step-2');
            
            if (step1 && step2) {
                step1.classList.remove('active');
                setTimeout(() => {
                    step1.classList.add('hidden');
                    step2.classList.remove('hidden');
                    setTimeout(() => step2.classList.add('active'), 50);
                }, 500);
            }

            if(signalStatus) {
                signalStatus.textContent = "VERIFICANDO PASO 1/2...";
                signalStatus.style.color = "#00d4ff";
            }
        };
    }

    if(step2Btn) {
        step2Btn.onclick = async () => {
            triggerSmartLink(); // Ad 2
            
            if(signalStatus) {
                signalStatus.textContent = "DECODIFICANDO SEÑAL FINAL...";
                signalStatus.style.color = "#39ff14";
            }
            
            await loadServer(1);
            
            // Show player
            if(videoOverlay) videoOverlay.style.display = 'none';
            if(livePlayer) {
                livePlayer.classList.remove('hidden');
                livePlayer.style.display = 'block';
            }
        };
    }

    // --- SPORT-GURU ENGINE (Dedicated Section & Ad Gate) ---
    const guruUnlockBtn = document.getElementById('guru-unlock-btn');
    if(guruUnlockBtn) {
        guruUnlockBtn.onclick = () => {
            if(!activeMatch) return;
            
            const statusBox = document.getElementById('guru-status-box');
            const statusText = document.getElementById('guru-status-text');
            const btnReveal = document.getElementById('guru-unlock-btn');
            
            // --- BLOQUEO DE PASADO (Professional Check) ---
            if(activeMatch.status === 'FINALIZADO') {
                if(statusBox && statusText && btnReveal) {
                    btnReveal.style.display = 'none';
                    statusBox.classList.remove('hidden');
                    statusBox.style.borderLeftColor = 'var(--accent)';
                    statusText.textContent = "Data Core: No es posible procesar datos históricos de eventos finalizados.";
                    statusText.style.color = "var(--accent)";
                    setTimeout(() => {
                        statusBox.classList.add('hidden');
                        btnReveal.style.display = 'block';
                        statusBox.style.borderLeftColor = 'var(--secondary)';
                        statusText.style.color = 'var(--secondary)';
                    }, 3000);
                }
                return;
            }

            triggerSmartLink(); // Ad for Guru
            
            if(statusBox && statusText && btnReveal) {
                btnReveal.style.display = 'none';
                statusBox.classList.remove('hidden');
                
                const steps = [
                    `Sincronizando variables de ${activeMatch.homeTeam}...`,
                    `Analizando big-data en ${activeMatch.league}...`,
                    `Evaluando impacto de bajas en ${activeMatch.awayTeam}...`,
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
                                // Reset for next time
                                btnReveal.style.display = 'block';
                                statusBox.classList.add('hidden');
                            }
                        }, 800);
                    }
                }, 1000);
            }
        };
    }

    // --- STREAM LOADING LOGIC ---
    let lastFinalUrl = '';
    const serverBtns = document.querySelectorAll('.server-btn');

    serverBtns.forEach(btn => {
        btn.onclick = () => {
            if (btn.dataset.server === 'sos') {
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
            const serverNum = parseInt(btn.dataset.server);
            if (livePlayer && !livePlayer.classList.contains('hidden')) loadServer(serverNum);
        };
    });

    async function loadServer(serverNum) {
        if (!activeMatch) return;
        const finalUrl = await findLiveStream(`${activeMatch.homeTeam} vs ${activeMatch.awayTeam}`, serverNum);
        lastFinalUrl = finalUrl;
        if (streamIframe) streamIframe.src = finalUrl;
        console.log(`[STREAM-OK] Canal Sintonizado: ${finalUrl}`);
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
            `"El Brujo ve a ${match.homeTeam} con un aura de victoria en la ${match.league}."`,
            `"Analizando astros: El empate acecha en este ${match.homeTeam} vs ${match.awayTeam}."`,
            `"Cuidado con ${match.awayTeam}, el Gurú detecta una sorpresa táctica hoy."`,
            `"Mercado Caliente: Se esperan goles, la defensa de ${match.homeTeam} flaquea."`,
            `"Predicción Sagrada: ${match.homeTeam} impondrá su jerarquía en casa."`,
            `"El flujo de datos indica que ${match.awayTeam} viene a encerrarse."`,
            `"Consulté las noticias de ${match.homeTeam} y hay optimismo puro."`,
            `"Mi visión para este ${match.homeTeam} vs ${match.awayTeam} es clara."`
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
            const overlayVideo = document.getElementById('guide-video');
            if (overlayVideo) { overlayVideo.currentTime = 0; overlayVideo.play().catch(() => {}); }
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

    // --- SHARE FUNCTIONALITY (Richard VIP Viral) ---
    const shareBtn = document.getElementById('btn-share');
    if(shareBtn) {
        shareBtn.onclick = async () => {
            const shareData = {
                title: 'SportFlow AI | Deportes en Vivo',
                text: `¡Mira el partido de ${activeMatch ? activeMatch.homeTeam + ' vs ' + activeMatch.awayTeam : 'hoy'} en HD y con las predicciones del Brujo! ⚽🔥`,
                url: window.location.href
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
        if (lastFinalUrl) { window.open(lastFinalUrl, '_blank'); triggerSmartLink(); }
        else if (streamIframe && streamIframe.src && streamIframe.src !== 'about:blank') { window.open(streamIframe.src, '_blank'); triggerSmartLink(); }
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
        const title = `${activeMatch.homeTeam} vs ${activeMatch.awayTeam} en VIVO | SportFlow AI`;
        const desc = `Mira el partido entre ${activeMatch.homeTeam} y ${activeMatch.awayTeam} por ${activeMatch.league} en vivo. Resultados, estadísticas y predicciones del Brujo.`;
        
        document.title = title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
        
        // Actualizar URL sin recargar para que el usuario pueda compartir el link específico
        const cleanName = `${activeMatch.homeTeam}-vs-${activeMatch.awayTeam}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const newPath = `/partido/${activeMatch.id}/${cleanName}`;
        window.history.replaceState({ id: activeMatch.id }, title, newPath);
    }

    function updateCrawlerMagnet() {
        const magnet = document.getElementById('seo-crawler-magnet');
        if (!magnet || matches.length === 0) return;
        
        let html = '<h2>Partidos en Vivo y Próximos</h2><ul>';
        matches.forEach(m => {
            const cleanName = `${m.homeTeam}-vs-${m.awayTeam}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
            html += `<li><a href="/partido/${m.id}/${cleanName}">${m.homeTeam} vs ${m.awayTeam} en vivo hoy</a></li>`;
        });
        html += '</ul>';
        magnet.innerHTML = html;
    }

    // Exportar para usar en otros clicks
    window.refreshSEO = updateSEOMetadata;
});
