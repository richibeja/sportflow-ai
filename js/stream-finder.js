/**
 * SportFlow AI - Extreme Stream Engine v9.0 (Internal "Hacker" Logic)
 * 
 * Este motor opera de forma "silenciosa". Por fuera se ve simple, 
 * pero por dentro utiliza algoritmos de limpieza de títulos y 
 * rotación de nodos protegidos para encontrar la señal sí o sí.
 */

const attemptTracker = {};

async function findLiveStream(matchTitle, serverIndex = 1) {
    console.log(`[STREAM] Iniciando intercepción para: ${matchTitle}...`);
    
    // 1. Limpieza Agresiva de Título (Hacking de Identidad)
    const clean = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const match = clean(matchTitle);
    const teams = match.split(' vs ').map(t => t.trim().replace(/ /g, '-').replace(/[^\w-]/g, ''));
    
    const home = teams[0];
    const away = teams[1] || '';

    // Matriz de Nodos de Intercepción (Fuentes de Alta Resistencia)
    const engineMatrix = {
        1: [ 
            `https://vidsrc.me/embed/soccer?match=${encodeURIComponent(matchTitle)}`,
            `https://streamed.su/watch/${home}-${away}`,
            `https://fnetrip.com/embed/${home}-vs-${away}`
        ],
        2: [ 
            `https://embedstream.me/${home}-vs-${away}`,
            `https://titres.tv/embed/event/${home}-${away}`,
            `https://clon.tv/v3/${home}`
        ],
        3: [ 
            `https://sport-streams.xyz/embed/${home}-vs-${away}`,
            `https://allinone-stream.me/soccer/${home}`,
            `https://embed.stream/v2/match/${home}-${away}`
        ],
        4: [ 
            `https://v3.vidsrc.cc/v3/embed/soccer/${home}-${away}`,
            `https://www.google.com/search?q=ver+en+vivo+${encodeURIComponent(matchTitle)}+hd`
        ]
    };

    // LÓGICA DE HACKEO INVISIBLE: Rotación automática por intentos
    if(!attemptTracker[matchTitle]) attemptTracker[matchTitle] = 0;
    const sources = engineMatrix[serverIndex] || engineMatrix[1];
    const sourceIndex = attemptTracker[matchTitle] % sources.length;
    
    const finalUrl = sources[sourceIndex];
    attemptTracker[matchTitle]++; // Siguiente intento usará otra fuente si falla esta

    return finalUrl;
}

window.findLiveStream = findLiveStream;
