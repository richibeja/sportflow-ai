document.addEventListener('DOMContentLoaded', () => {
    // --- MASTER CONFIG ---
    const CONFIG = {
        KICK_CHANNEL: 'richardbejarano5',
        SIGNAL_TYPE: 'KICK',
        EXTERNAL_URL: 'https://futbollibretv.me/', // Servidor secundario
        SL_LINK: "https://wistfulseverely.com/d7044ubwez?key=bac3a61df59dc6f36412f9eb2ff17156"
    };

    let matches = [];
    let clickCount = 0;

    // --- INIT ---
    syncMatches();
    setInterval(syncMatches, 30000);
    loadAds();
    setupNavFilters();

    // --- ADS ENGINE ---
    function renderAd(containerId, adKey, width, height) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = ''; 
        const scriptOptions = document.createElement('script');
        scriptOptions.text = `atOptions = { 'key' : '${adKey}', 'format' : 'iframe', 'height' : ${height}, 'width' : ${width}, 'params' : {} };`;
        const scriptInvoke = document.createElement('script');
        scriptInvoke.src = `https://wistfulseverely.com/${adKey}/invoke.js`;
        container.appendChild(scriptOptions);
        container.appendChild(scriptInvoke);
    }

    function loadAds() {
        const isMobile = window.innerWidth <= 768;
        const key320x50 = '0d6323163d0bf049f77d24605b7baf54';
        const key728x90 = 'd73933b8cfbbda3517bd62db85dfa4bf';

        const slots = [
            ['ad-container-header', isMobile ? key320x50 : key728x90, isMobile ? 320 : 728, isMobile ? 50 : 90],
            ['ad-container-top', isMobile ? key320x50 : key728x90, isMobile ? 320 : 728, isMobile ? 50 : 90],
            ['ad-mid-blog', isMobile ? key320x50 : key728x90, isMobile ? 320 : 728, isMobile ? 50 : 90],
            ['ad-container-sticky', key320x50, 320, 50]
        ];

        slots.forEach(slot => renderAd(...slot));
    }

    // --- SYNC MATCHES ---
    async function syncMatches() {
        const leagues = [
            { id: 'arg.1', name: 'LPF' },
            { id: 'uefa.champions', name: 'UCL' },
            { id: 'conmebol.libertadores', name: 'LIB' },
            { id: 'esp.1', name: 'ESP' },
            { id: 'eng.1', name: 'PRE' },
            { id: 'col.1', name: 'COL' }
        ];

        try {
            let all = [];
            for (const l of leagues) {
                try {
                    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l.id}/scoreboard`);
                    const data = await res.json();
                    if (data.events) {
                        all = [...all, ...data.events.map(ev => ({
                            id: ev.id,
                            league: l.name,
                            home: ev.competitions[0].competitors.find(c => c.homeAway === 'home'),
                            away: ev.competitions[0].competitors.find(c => c.homeAway === 'away'),
                            status: ev.status.type.state === 'in' ? 'EN VIVO' : 'PRÓXIMAMENTE',
                            time: ev.status.type.shortDetail,
                            date: new Date(ev.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
                        }))];
                    }
                } catch(e) {}
            }
            matches = all;
            localStorage.setItem('sportflow_matches', JSON.stringify(all));
            
            // UPDATE LIVE BADGE
            const liveCount = all.filter(m => m.status === 'EN VIVO').length;
            const badge = document.getElementById('live-count-badge');
            if(badge) badge.textContent = liveCount;

            // renderMatchSelector();
        } catch (err) {}
    }

    // --- RENDER SELECTOR ---
    function renderMatchSelector() {
        const selector = document.getElementById('upcoming-matches');
        if(!selector) return;
        selector.innerHTML = '';

        let filtered = matches;
        if(window.currentFilter === 'live') filtered = matches.filter(m => m.status === 'EN VIVO');

        filtered.forEach(m => {
            const card = document.createElement('div');
            card.className = `match-card-mini`;
            card.style.cursor = 'pointer';
            
            card.onclick = () => {
                // REDIRECT TO EXTERNAL VIA AD
                window.open(CONFIG.SL_LINK, '_blank');
                setTimeout(() => {
                    window.open(CONFIG.SL_LINK, '_blank');
                    setTimeout(() => {
                        window.location.href = CONFIG.EXTERNAL_URL;
                    }, 500);
                }, 300);
            };

            card.innerHTML = `
                <div class="mini-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 800; color: var(--accent); font-size: 0.7rem;">${m.league}</span>
                    <div class="match-time-badge" style="font-size: 0.65rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${m.date}</div>
                </div>
                <div class="mini-teams" style="display: flex; flex-direction: column; gap: 5px;">
                    <div class="mini-team" style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.85rem; font-weight: 600;">${m.home.team.displayName}</span>
                        <div class="score-pill" style="background: var(--accent); color: #000; padding: 1px 6px; border-radius: 4px; font-weight: 800; font-size: 0.75rem;">${m.home.score || 0}</div>
                    </div>
                    <div class="mini-team" style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.85rem; font-weight: 600;">${m.away.team.displayName}</span>
                        <div class="score-pill" style="background: var(--accent); color: #000; padding: 1px 6px; border-radius: 4px; font-weight: 800; font-size: 0.75rem;">${m.away.score || 0}</div>
                    </div>
                </div>
                <div class="mini-status" style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 5px;">
                    <span style="color: ${m.status === 'EN VIVO' ? '#ff4b4b' : '#666'}; font-size: 0.7rem; font-weight: 700;">
                        <i class="fas ${m.status === 'EN VIVO' ? 'fa-circle-play pulse' : 'fa-clock'}"></i> ${m.time}
                    </span>
                </div>
            `;
            selector.appendChild(card);
        });
    }

    // --- DECOY UNLOCK ---
    const handleUnlockAttempt = () => {
        clickCount++;
        const target = document.getElementById('decoy-step-tag');
        if (clickCount < 3) {
            window.open(CONFIG.SL_LINK, '_blank');
            if(target) target.textContent = `PASO ${clickCount+1}/2: VALIDANDO...`;
            setTimeout(() => { if(target) target.textContent = `REINTENTAR PASO ${clickCount+1}`; }, 2000);
        } else {
            if(target) target.textContent = `¡CONEXIÓN ESTABLECIDA!`;
            unlockSignal();
        }
    };

    function unlockSignal() {
        const decoyZone = document.querySelector('.decoy-player-zone');
        const host = window.location.hostname;
        const url = `https://player.kick.com/${CONFIG.KICK_CHANNEL}?parent=${host}&autoplay=true&muted=false`;
        if(decoyZone) {
            decoyZone.innerHTML = `
                <div class="player-wrapper">
                    <div class="signal-guard"></div>
                    <iframe src="${url}" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin allow-forms allow-presentation" style="width: 100%; aspect-ratio: 16/9; display: block; border-radius: 12px; border: 1px solid #111;"></iframe>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: var(--accent); font-weight: 800; font-size: 0.9rem;"><i class="fas fa-signal"></i> SEÑAL PROTEGIDA ACTIVA</p>
                </div>
            `;
        }
    }

    const playBtn = document.getElementById('btn-decoy-play');
    if(playBtn) playBtn.onclick = handleUnlockAttempt;

    function setupNavFilters() {
        const all = document.getElementById('f-all');
        const live = document.getElementById('f-live');
        if(all) all.onclick = () => { window.currentFilter = 'all'; all.classList.add('active'); if(live) live.classList.remove('active'); /* renderMatchSelector(); */ };
        if(live) live.onclick = () => { window.currentFilter = 'live'; live.classList.add('active'); if(all) all.classList.remove('active'); /* renderMatchSelector(); */ };
    }
});
