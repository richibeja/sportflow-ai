document.addEventListener('DOMContentLoaded', () => {
    console.log('SportFlow AI: Full Experience v2.0');
    
    // --- MONETIZATION CONFIG ---
    const CONFIG = {
        smartLink: 'https://www.effectivegatecpm.com/jm7f9ypm?key=b8f95870742d9bd9e730551fa23f4398', // Link de Adsterra actualizado
        socialBar: true // Barra social activa
    };

    // --- DATA: Matches ---
    const matches = [
        {
            id: 'ucl-01',
            league: 'UEFA Champions League',
            homeTeam: 'Real Madrid',
            awayTeam: 'Man City',
            homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
            awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png',
            homeScore: 0,
            awayScore: 0,
            time: '21:00',
            status: 'PRÓXIMAMENTE',
            streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Ejemplo, cambiar por señal real
        },
        {
            id: 'mx-01',
            league: 'Liga MX • Clásico Regio',
            homeTeam: 'Monterrey',
            awayTeam: 'Tigres UANL',
            homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/CF_Monterrey_logo.svg/1200px-CF_Monterrey_logo.svg.png',
            awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Tigres_UANL_logo.svg/1200px-Tigres_UANL_logo.svg.png',
            homeScore: 2,
            awayScore: 1,
            time: '67\'',
            status: 'EN VIVO',
            streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Ejemplo, cambiar por señal real
        },
        {
            id: 'epl-01',
            league: 'Premier League',
            homeTeam: 'Liverpool',
            awayTeam: 'Arsenal',
            homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png',
            awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png',
            homeScore: 0,
            awayScore: 0,
            time: '14:30',
            status: 'HOY',
            streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Ejemplo, cambiar por señal real
        }
    ];

    // --- DATA: News ---
    const news = [
        {
            title: 'Mbappé listo para el Clásico Europeo',
            tag: 'CHAMPIONS',
            desc: 'El delantero francés confirma su titularidad para el encuentro ante el City en el Bernabéu.',
            img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Monterrey busca el liderato solitario',
            tag: 'LIGA MX',
            desc: 'Los Rayados necesitan la victoria ante su acérrimo rival para consolidarse en la cima.',
            img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
        },
        {
            title: 'Klopp advierte sobre el poderío del Arsenal',
            tag: 'PREMIER',
            desc: 'Liverpool se prepara para el duelo más importante de la jornada en Anfield.',
            img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'
        }
    ];

    // --- DATA: Schedule ---
    const schedule = [
        { event: 'Real Madrid vs Man City', channel: 'TNT Sports', time: '21:00', signal: 'ONLINE HD' },
        { event: 'Monterrey vs Tigres', channel: 'TUDN / VIX+', time: '21:10', signal: 'EN VIVO' },
        { event: 'Lakers vs Warriors', channel: 'ESPN', time: '22:00', signal: 'PRÓXIMAMENTE' }
    ];

    let activeMatch = matches[1];

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
    renderMatchSelector();
    renderHero(activeMatch);
    renderNews();
    renderSchedule();

    // --- LOGIC ---
    function setupBackground() {
        bgOverlay.style.backgroundImage = `url(sportflow_hero_bg.png)`;
        bgOverlay.style.backgroundSize = 'cover';
        bgOverlay.style.backgroundPosition = 'center';
        bgOverlay.style.opacity = '0.3';
    }

    function renderMatchSelector() {
        matchSelector.innerHTML = '';
        matches.forEach(match => {
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
                <button class="btn-secondary"><i class="fas fa-chart-bar"></i> ESTADÍSTICAS</button>
            </div>
        `;
        document.getElementById('btn-watch-hd').onclick = () => {
            // Activar la pestaña de video
            const videoTab = document.querySelector('[data-tab="video"]');
            if(videoTab) videoTab.click();
            
            // Hacer scroll hasta el reproductor
            document.querySelector('.match-details').scrollIntoView({ behavior: 'smooth' });
        };
        
        // Listener para el botón de la Madrina
        const madrinaWatch = document.getElementById('btn-madrina-watch');
        if(madrinaWatch) {
            madrinaWatch.onclick = () => window.open(CONFIG.smartLink, '_blank');
        }
    }

    function renderNews() {
        newsContainer.innerHTML = news.map(item => `
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
        scheduleBody.innerHTML = schedule.map(item => `
            <tr>
                <td>${item.event}</td>
                <td><span class="canal-tag">${item.channel}</span></td>
                <td>${item.time}</td>
                <td><span class="status-online"><i class="fas fa-circle"></i> ${item.signal}</span></td>
            </tr>
        `).join('');
    }

    // Tab Logic
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(c => c.id === `tab-${tab.dataset.tab}` ? c.classList.remove('hidden') : c.classList.add('hidden'));
        };
    });

    // Video Unlock Logic
    const unlockBtn = document.getElementById('unlock-stream-btn');
    const videoOverlay = document.getElementById('video-overlay');
    const livePlayer = document.getElementById('live-player');
    const streamIframe = document.getElementById('stream-iframe');

    if(unlockBtn) {
        unlockBtn.onclick = async () => {
            // Animación de carga
            unlockBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> BUSCANDO SEÑAL...';
            
            // BUSQUEDA AUTOMÁTICA DE LINK
            const autoLink = await findLiveStream(`${activeMatch.homeTeam} vs ${activeMatch.awayTeam}`);
            
            window.open(CONFIG.smartLink, '_blank');
            videoOverlay.classList.add('hidden');
            livePlayer.classList.remove('hidden');
            streamIframe.src = autoLink;
            
            unlockBtn.innerHTML = 'DESBLOQUEAR SEÑAL';
        };
    }

    function resetVideoPlayer() {
        if(videoOverlay) videoOverlay.classList.remove('hidden');
        if(livePlayer) livePlayer.classList.add('hidden');
        if(streamIframe) streamIframe.src = '';
    }

    // Simulación de Goles
    setInterval(() => {
        if (activeMatch.status === 'EN VIVO' && Math.random() > 0.98) {
            activeMatch.homeScore++;
            document.getElementById('home-score').textContent = activeMatch.homeScore;
            notifyGoal(activeMatch.homeTeam);
        }
    }, 15000);

    function notifyGoal(team) {
        const toast = document.createElement('div');
        toast.className = 'goal-toast';
        toast.innerHTML = `🏁 ¡GOL DE ${team.toUpperCase()}!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
        const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
        audio.play().catch(() => {});
    }

    // Styles for Goal Toast in JS to keep it dynamic
    const style = document.createElement('style');
    style.innerHTML = `.goal-toast { position: fixed; top: 100px; right: 20px; background: var(--accent); color: var(--bg-dark); padding: 15px 30px; border-radius: 12px; font-weight: 800; box-shadow: 0 10px 30px rgba(57, 255, 20, 0.5); animation: slideIn 0.5s ease-out; z-index: 9999; } @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
    document.head.appendChild(style);

    setTimeout(() => {
        const floatingCta = document.getElementById('floating-cta');
        if(floatingCta) {
            floatingCta.classList.add('show');
            document.getElementById('btn-floating-smart').onclick = () => window.open(CONFIG.smartLink, '_blank');
        }
    }, 6000);
});
