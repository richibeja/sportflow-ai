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
    
    // Smart Sync: Auto-unlock logic
    if (window.location.pathname.includes('match-preview.html') || window.location.pathname.includes('/evento/')) {
        const isUnlocked = localStorage.getItem('signal_unlocked') === 'true';
        if (isUnlocked) {
            setTimeout(unlockSignal, 1000); 
        }

        // Dynamic Title Injection (1000+ Pages Support)
        const path = window.location.pathname;
        if (path.includes('/evento/') || path.includes('/partido/')) {
            const rawName = path.split('/').pop().replace(/-/g, ' ').toUpperCase();
            if (rawName && rawName !== 'MATCH PREVIEW.HTML') {
                const titleNode = document.querySelector('.section-title');
                if (titleNode) titleNode.innerHTML = `<i class="fas fa-fire"></i> EN VIVO: ${rawName}`;
                document.title = `${rawName} | SportFlow AI Premium`;
            }
        }
    } else {
        // We are on Home: Reset unlock state for safety
        localStorage.setItem('signal_unlocked', 'false');
    }

    // --- ADS ENGINE ---
    function renderAd(containerId, adKey, width, height) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = ''; 
        
        // Use srcdoc iframe to isolate global variables like atOptions
        const iframe = document.createElement('iframe');
        iframe.style.width = width + 'px';
        iframe.style.height = height + 'px';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        iframe.scrolling = 'no';
        
        const adHtml = `
            <!DOCTYPE html>
            <html>
                <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:transparent;">
                    <script type="text/javascript">
                        atOptions = {
                            'key' : '${adKey}',
                            'format' : 'iframe',
                            'height' : ${height},
                            'width' : ${width},
                            'params' : {}
                        };
                    </script>
                    <script type="text/javascript" src="https://wistfulseverely.com/${adKey}/invoke.js"></script>
                </body>
            </html>
        `;
        
        iframe.srcdoc = adHtml;
        container.appendChild(iframe);
    }

    function loadAds() {
        const isMobile = window.innerWidth <= 768;
        const key320x50 = '0d6323163d0bf049f77d24605b7baf54';
        const key728x90 = 'd73933b8cfbbda3517bd62db85dfa4bf';

        // 3 slots dinámicos (el huequito se carga directo en HTML para fiabilidad)
        const slots = [
            ['ad-container-top', isMobile ? key320x50 : key728x90, isMobile ? 320 : 728, isMobile ? 50 : 90],
            ['ad-top-blog', isMobile ? key320x50 : key728x90, isMobile ? 320 : 728, isMobile ? 50 : 90],
            ['ad-mid-blog', isMobile ? key320x50 : key728x90, isMobile ? 320 : 728, isMobile ? 50 : 90],
            ['ad-container-sticky', key320x50, 320, 50]
        ];

        slots.forEach(slot => renderAd(...slot));

        // Auto-show sticky footer after 5s
        setTimeout(() => {
            const sticky = document.getElementById('sticky-footer-ad');
            if (sticky) sticky.classList.remove('hidden');
        }, 5000);

        // Sticky Close Logic
        const closeBtn = document.getElementById('close-sticky-ad');
        if (closeBtn) {
            closeBtn.onclick = () => {
                const sticky = document.getElementById('sticky-footer-ad');
                if (sticky) sticky.style.display = 'none';
            };
        }
    }

    // --- SYNC MATCHES ---
    async function syncMatches() {
        const leagues = [
            { id: 'arg.1', name: 'LPF' },
            { id: 'uefa.champions', name: 'UCL' },
            { id: 'conmebol.libertadores', name: 'LIB' },
            { id: 'esp.1', name: 'ESP' },
            { id: 'eng.1', name: 'PRE' },
            { id: 'col.1', name: 'COL' },
            { id: 'ita.1', name: 'SER' },
            { id: 'ger.1', name: 'BUN' },
            { id: 'fra.1', name: 'L1' },
            { id: 'por.1', name: 'POR' },
            { id: 'usa.1', name: 'MLS' },
            { id: 'mex.1', name: 'MX' },
            { id: 'bra.1', name: 'BRA' },
            { id: 'uefa.europa', name: 'UEL' },
            { id: 'conmebol.sudamericana', name: 'SUD' },
            { id: 'fifa.friendly', name: 'INT' },
            { id: 'esp.2', name: 'ES2' },
            { id: 'eng.2', name: 'CHAM' }
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

            renderMatchSelector();
        } catch (err) {}
    }

    // --- RENDER SELECTOR (PREMIUM v5.68) ---
    function renderMatchSelector() {
        const selector = document.getElementById('upcoming-matches');
        if (!selector) return;

        let filtered = matches;
        if (window.currentFilter === 'live') filtered = matches.filter(m => m.status === 'EN VIVO');
        if (!filtered.length) {
            selector.innerHTML = '<div style="padding:15px;color:#555;font-size:0.8rem;text-align:center;"><i class="fas fa-satellite-dish"></i> No hay partidos ahora</div>';
            return;
        }

        selector.innerHTML = filtered.map(m => {
            const isLive = m.status === 'EN VIVO';
            const isFinished = m.time && (m.time.toLowerCase().includes('ft') || m.time.toLowerCase().includes('final'));
            const statusColor = isLive ? '#ff4b4b' : isFinished ? '#888' : 'var(--accent)';
            const statusIcon = isLive ? 'fa-circle' : isFinished ? 'fa-check-circle' : 'fa-clock';
            const statusLabel = isLive ? 'EN VIVO' : isFinished ? 'FINAL' : 'PRÓXIMO';
            const homeName = m.home?.team?.abbreviation || m.home?.team?.displayName?.split(' ').pop() || '???';
            const awayName = m.away?.team?.abbreviation || m.away?.team?.displayName?.split(' ').pop() || '???';
            const homeScore = isLive || isFinished ? (m.home?.score ?? 0) : '-';
            const awayScore = isLive || isFinished ? (m.away?.score ?? 0) : '-';

            return `
            <div class="match-card-mini" onclick="handleCardClick()" style="cursor:pointer;flex-shrink:0;width:280px;background:#0d1117;border:1px solid ${isLive ? '#ff4b4b44' : '#222'};border-radius:15px;padding:20px;display:flex;flex-direction:column;gap:15px;transition:border-color 0.3s;box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                <!-- LEAGUE BADGE -->
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:0.6rem;font-weight:800;color:var(--accent);letter-spacing:1px;">${m.league}</span>
                    <span style="font-size:0.55rem;color:#444;">${m.date}</span>
                </div>
                <!-- TEAMS + SCORE -->
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.78rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:95px;color:#eee;">${homeName}</span>
                        <span style="font-size:0.9rem;font-weight:900;color:${isLive ? '#ff4b4b' : '#fff'};min-width:18px;text-align:right;">${homeScore}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.78rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:95px;color:#aaa;">${awayName}</span>
                        <span style="font-size:0.9rem;font-weight:900;color:${isLive ? '#ff4b4b' : '#fff'};min-width:18px;text-align:right;">${awayScore}</span>
                    </div>
                </div>
                <!-- STATUS -->
                <div style="border-top:1px solid #1a1a2e;padding-top:10px;display:flex;flex-direction:column;align-items:center;gap:4px;">
                    <div style="display:flex;align-items:center;gap:5px;">
                        <i class="fas ${statusIcon}" style="color:${statusColor};font-size:0.55rem;${isLive ? 'animation:pulse-dot 1.2s infinite;' : ''}"></i>
                        <span style="font-size:0.65rem;font-weight:800;color:${statusColor};letter-spacing:0.5px;">${isLive ? m.time : statusLabel}</span>
                    </div>
                    <div style="font-size:0.55rem;color:#555;text-transform:uppercase;letter-spacing:1px;margin-top:2px;">
                        <i class="fas fa-info-circle"></i> 2 ads para desbloquear signal
                    </div>
                </div>
                <!-- SOURCE TAG -->
                <div style="position:absolute;top:10px;right:10px;background:rgba(57,255,20,0.1);padding:2px 6px;border-radius:4px;border:1px solid rgba(57,255,20,0.2);">
                    <span style="font-size:0.5rem;color:var(--accent);font-weight:900;">FUÉBOL LIBRE HD</span>
                </div>
            </div>`;
        }).join('');
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
                    <iframe src="${url}" frameborder="0" allowfullscreen referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation" style="width: 100%; aspect-ratio: 16/9; display: block; border-radius: 12px; border: 1px solid #111;"></iframe>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: var(--accent); font-weight: 800; font-size: 0.9rem;"><i class="fas fa-signal"></i> SEÑAL PROTEGIDA ACTIVA (HACKER MODE)</p>
                </div>
            `;
        }
    }

    const playBtn = document.getElementById('btn-decoy-play');
    if(playBtn) playBtn.onclick = handleUnlockAttempt;

    function setupNavFilters() {
        const all = document.getElementById('f-all');
        const live = document.getElementById('f-live');
        if(all) all.onclick = () => { window.currentFilter = 'all'; all.classList.add('active'); if(live) live.classList.remove('active'); renderMatchSelector(); };
        if(live) live.onclick = () => { window.currentFilter = 'live'; live.classList.add('active'); if(all) all.classList.remove('active'); renderMatchSelector(); };
    }

    // --- CARD CLICK (3-Click Monetization & Internal Navigation) ---
    window.handleCardClick = function() {
        clickCount++;
        if (clickCount < 3) {
            window.open(CONFIG.SL_LINK, '_blank');
        } else {
            // Guardar estado de desbloqueo y navegar
            localStorage.setItem('signal_unlocked', 'true');
            clickCount = 0;
            window.location.href = 'match-preview.html';
        }
    };

    // --- SHARE FUNCTIONALITY ---
    window.shareApp = function() {
        if (navigator.share) {
            navigator.share({
                title: 'SportFlow AI | Deportes en Vivo',
                text: 'Mira los mejores partidos en vivo y con análisis de IA en SportFlow AI.',
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: Copy link
            const dummy = document.createElement('input');
            document.body.appendChild(dummy);
            dummy.value = window.location.href;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            alert('¡Enlace copiado al portapapeles! Compártelo con tus amigos.');
        }
    };
});
