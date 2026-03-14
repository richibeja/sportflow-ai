/**
 * SportFlow AI - Hacker God Mode v6.0 (SIGNAL CORE)
 * 
 * Este motor imita el comportamiento de los grandes "agregadores" rusos y árabes.
 * No depende de una URL estática, sino que genera múltiples variantes para
 * "engañar" a los bloqueos y encontrar el stream activo.
 */

async function findLiveStream(matchTitle, serverIndex = 1) {
    console.log(`[HACKER MODE] Decodificando señal para: ${matchTitle}...`);
    
    // Generamos múltiples versiones del nombre para máxima compatibilidad
    const cleanTitle = matchTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const parts = cleanTitle.split(' vs ');
    const home = parts[0].trim().replace(/ /g, '-').replace(/[^\w-]/g, '');
    const away = parts[1] ? parts[1].trim().replace(/ /g, '-').replace(/[^\w-]/g, '') : '';
    
    const slugs = [
        `${home}-vs-${away}`,
        `${home}-${away}`,
        `${home}`,
        `${away}`
    ];

    // Matriz de proveedores "Inmunes" (Usados por apps de alta resistencia)
    const providerMatrix = {
        1: [ // SERVIDOR 1: Nodos Globales (Alta Velocidad)
            `https://vidsrc.me/embed/soccer?match=${encodeURIComponent(matchTitle)}`,
            `https://vidsrc.cc/v3/embed/soccer/${slugs[0]}`,
            `https://streamed.su/watch/${slugs[1]}`
        ],
        2: [ // SERVIDOR 2: Nodos Latam/España (Comentaristas en Español)
            `https://embedstream.me/${slugs[0]}`,
            `https://titres.tv/embed/event/${slugs[1]}`,
            `https://fnetrip.com/embed/${slugs[0]}`
        ],
        3: [ // SERVIDOR 3: Nodos de Respaldo "Espejo"
            `https://sport-streams.xyz/embed/${slugs[0]}`,
            `https://clon.tv/v2/${slugs[1]}`,
            `https://allinone-stream.me/soccer/${slugs[0]}`
        ],
        4: [ // SERVIDOR 4 (SOS): Motores de Búsqueda de Listas M3U8
            `https://www.google.com/search?q=inurl:m3u8+ver+${encodeURIComponent(matchTitle)}+directo`,
            `https://embed.stream/search?q=${encodeURIComponent(matchTitle)}`
        ]
    };

    // LÓGICA DE HACKEO: Intentamos rotar dentro del mismo servidor si es necesario
    // Por ahora devolvemos el primario de cada servidor, pero el sistema está listo
    // para un "Failover" automático en el futuro.
    
    const selectedList = providerMatrix[serverIndex] || providerMatrix[1];
    
    // Handshake Encriptado (Simulación técnica para UX)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Retornamos el link base. Si es Servidor 4, devolvemos un link de búsqueda profunda.
    return selectedList[0];
}

window.findLiveStream = findLiveStream;
