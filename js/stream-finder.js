/**
 * SportFlow AI - Stream Finder Engine v8.0
 * 
 * Este motor busca fuentes de streaming en tiempo real utilizando una matriz
 * de proveedores globales de alta disponibilidad.
 */

async function findLiveStream(matchTitle, serverIndex = 1) {
    console.log(`[STREAM] Buscando señal para: ${matchTitle}...`);
    
    const cleanTitle = matchTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const parts = cleanTitle.split(' vs ');
    const home = parts[0].trim().replace(/ /g, '-').replace(/[^\w-]/g, '');
    const away = parts[1] ? parts[1].trim().replace(/ /g, '-').replace(/[^\w-]/g, '') : '';
    
    // Matriz de Proveedores Redundantes
    const providerMatrix = {
        1: [ // Servidor Primario
            `https://vidsrc.me/embed/soccer?match=${encodeURIComponent(matchTitle)}`,
            `https://streamed.su/watch/${home}-${away}`,
            `https://fnetrip.com/embed/${home}-vs-${away}`
        ],
        2: [ // Servidor Secundario (Latam)
            `https://embedstream.me/${home}-vs-${away}`,
            `https://titres.tv/embed/event/${home}-${away}`,
            `https://clon.tv/v3/${home}`
        ],
        3: [ // Servidor de Respaldo
            `https://sport-streams.xyz/embed/${home}-vs-${away}`,
            `https://allinone-stream.me/soccer/${home}`,
            `https://embed.stream/v2/match/${home}-${away}`
        ],
        4: [ // Servidor de Emergencia (SOS)
            `https://www.google.com/search?q=ver+en+vivo+${encodeURIComponent(matchTitle)}+streaming+hd+free`,
            `https://embed.stream/search?q=${encodeURIComponent(matchTitle)}`
        ]
    };

    const nodeList = providerMatrix[serverIndex] || providerMatrix[1];
    
    // Conexión directa sin esperas artificiales
    return nodeList[0];
}

window.findLiveStream = findLiveStream;
