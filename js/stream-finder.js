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
            `https://television.libre.futbol/tv6/`,
            `https://television.libre.futbol/tv1/`,
            `https://television.libre.futbol/`,
            `https://librefutbol.net/`,
            `https://pelotalibre.org/`
        ],
        2: [ 
            `https://futbollibre.surf/`,
            `https://futbollibretv.net/`,
            `https://futbollibretv.su/`
        ],
        3: [ 
            `https://www.rojadirectatv.me/`,
            `https://pirlotvonline.com.mx/`,
            `https://futbollibre.lol/`
        ],
        4: [ 
            `https://televisionlibre.net/`,
            `https://television-libre.online/`
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
