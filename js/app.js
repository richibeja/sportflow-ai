document.addEventListener('DOMContentLoaded', () => {
    console.log('SportFlow AI: Extreme Ultra v5.0');
    
    // --- MASTER CONFIG (Control total de Richard) ---
    const CONFIG = {
        smartLink: 'https://www.effectivegatecpm.com/jm7f9ypm?key=b8f95870742d9bd9e730551fa23f4398',
        madrinaMessage: '"¡Hola Richard! Te dejé mi link VIP para el partido aquí abajo... ⚽✨"',
        chatPhrases: [
            "¡Qué buena calidad tiene la señal!", 
            "¡GOLAAAAAAZO de visita!", 
            "Esta web no falla nunca, gran trabajo.", 
            "¡Saludos desde Monterrey!", 
            "El servidor 2 vuela, el 1 se me trabó un poco.", 
            "¡Vamos mi equipo, hoy ganamos!"
        ]
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
    const madrinaP = document.querySelector('.madrina-text p');

    // --- INIT ---
    if(madrinaP) madrinaP.textContent = CONFIG.madrinaMessage;
    setupBackground();
    syncMatches();
    renderNews();
    setupNavFilters();
    startChatSimulation();
    setInterval(syncMatches, 60000);

    // --- MONETIZATION ENGINE ---
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
            { id: 'eng.1', name: 'Premier League' },
            { id: 'uefa.champions', name: 'Champions League' },
            { id: 'esp.1', name: 'La Liga' },
            { id: 'ita.1', name: 'Serie A' },
            { id: 'ger.1', name: 'Bundesliga' },
            { id: 'fra.1', name: 'Ligue 1' },
            { id: 'arg.1', name: 'Liga Argentina' }
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
            };
            matchSelector.appendChild(card);
        });
    }

    function renderHero(match) {
        if(!heroContent) return;
        
        // Actualizar mensaje de la Madrina en automático según el partido
        const madrinaPhrases = [
            `⚽ ¡Richard! ¿Ya viste el partido de ${match.homeTeam} vs ${match.awayTeam}? Está riquísimo, dale clic abajo...`,
            `✨ Richard, te conseguí el link HD para el ${match.homeTeam}. ¡No te lo pierdas!`,
            `🔥 ¡Apúrate Richard! La señal del ${match.league} ya está activa. Entra aquí:`,
            `💖 Richard, ¿vas con el ${match.homeTeam} o el ${match.awayTeam}? Avísame en el chat...`
        ];
        if(madrinaP) {
            madrinaP.textContent = madrinaPhrases[Math.floor(Math.random() * madrinaPhrases.length)];
        }

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
            if(tab.dataset.tab === 'video') triggerSmartLink();
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
            unlockBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> HACKING SIGNAL...';
            triggerSmartLink();
            setTimeout(() => {
                videoOverlay.classList.add('hidden');
                livePlayer.classList.remove('hidden');
                loadServer(1);
                startAutoHeal();
                unlockBtn.innerHTML = '<i class="fas fa-unlock-alt"></i> DESBLOQUEAR SEÑAL';
            }, 2000);
        };
    }

    serverBtns.forEach(btn => {
        btn.onclick = () => {
            if (btn.dataset.server === 'sos') {
                // S.O.S ya no te saca de la web, busca internamente en el nodo de emergencia
                loadServer(4);
                triggerSmartLink();
                return;
            }
            serverBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentServer = parseInt(btn.dataset.server);
            if (!livePlayer.classList.contains('hidden')) loadServer(currentServer);
        };
    });

    async function loadServer(serverNum) {
        if (!activeMatch) return;
        signalStatus.textContent = "OPTIMIZING NODE...";
        streamIframe.src = ''; 
        const finalUrl = await findLiveStream(`${activeMatch.homeTeam} vs ${activeMatch.awayTeam}`, serverNum);
        streamIframe.src = finalUrl;
        setTimeout(() => { signalStatus.textContent = "SIGNAL STABLE (ENCRYPTED)"; }, 3000);
    }

    function startAutoHeal() {
        if(autoHealInterval) clearInterval(autoHealInterval);
        autoHealInterval = setInterval(() => {
            if (!livePlayer.classList.contains('hidden')) {
                console.log("Auto-healing signal...");
                signalStatus.textContent = "SIGNAL REPAIR IN PROGRESS...";
                setTimeout(() => { signalStatus.textContent = "SIGNAL STABLE (ENCRYPTED)"; }, 2000);
            }
        }, 30000);
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

    document.getElementById('btn-report').onclick = () => {
        alert("¡Reporte recibido! Nuestros técnicos están revisando la señal del Servidor " + currentServer);
        loadServer((currentServer % 3) + 1); // Salto automático a otro servidor
    };

    // --- CHAT SIMULATION ---
    function startChatSimulation() {
        const chatMessages = document.getElementById('chat-messages');
        const users = [
            { name: 'Richard_VIP', class: 'name-vip', origin: 'MX' },
            { name: 'Gool_Master', class: 'name-mx', origin: 'MX' },
            { name: 'Tio_Betting', class: 'name-ar', origin: 'AR' },
            { name: 'Futbol_Real', class: 'name-es', origin: 'ES' }
        ];
        const phrases = [
            "¡Qué buena calidad tiene la señal!", "¡GOLAAAAAAZO de visita!", "¿Alguien tiene el link del otro partido?",
            "Esta web no falla nunca, gran trabajo.", "¡Saludos desde Monterrey!", "Penal clarísimo, ¡no lo puedo creer!",
            "El servidor 2 vuela, el 1 se me trabó un poco.", "Vamos mi equipo, hoy ganamos sí o sí."
        ];

        // --- INTERACCIÓN REAL ---
        const input = document.getElementById('user-chat-input');
        const sendBtn = document.getElementById('btn-send-chat');

        let userNickname = 'Fan_' + Math.floor(Math.random() * 900 + 100);
        let firstMessage = true;

        const sendMessage = () => {
            const text = input.value.trim();
            if(!text) return;

            if (firstMessage) {
                // Monetización al primer comentario (Protocolo Anti-Spam Fake)
                alert("SISTEMA: Verificando protocolo Anti-Spam. Completa la validación para publicar tu comentario.");
                triggerSmartLink();
                firstMessage = false;
                return;
            }

            const msg = document.createElement('div');
            msg.className = 'msg';
            msg.innerHTML = `<span style="color: var(--secondary)">${userNickname} (Tú):</span><span>${text}</span>`;
            chatMessages.appendChild(msg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            input.value = '';

            // Respuesta automática de un Bot para que se sienta vivo
            setTimeout(() => {
                const botMsg = document.createElement('div');
                botMsg.className = 'msg';
                botMsg.innerHTML = `<span class="name-vip">Richard_Moderador:</span><span>¡Bienvenido @${userNickname}! Disfruta el partido.</span>`;
                chatMessages.appendChild(botMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 2000);
        };

        if(sendBtn) sendBtn.onclick = sendMessage;
        if(input) input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };

        setInterval(() => {
            if (Math.random() > 0.7) {
                const user = users[Math.floor(Math.random() * users.length)];
                const phrase = phrases[Math.floor(Math.random() * phrases.length)];
                const msg = document.createElement('div');
                msg.className = 'msg';
                msg.innerHTML = `<span class="${user.class}">${user.name}:</span><span>${phrase}</span>`;
                chatMessages.appendChild(msg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                if(chatMessages.children.length > 20) chatMessages.removeChild(chatMessages.firstChild);
            }
        }, 4000);
    }

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
