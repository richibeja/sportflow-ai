# 📋 Guía de Mantenimiento Diario - SportFlow AI

¡Hola Richard! Aquí tienes los pasos clave para que tu plataforma esté siempre al 100% todos los días:

## 1. ⚽ Actualización del Ticker (Resultados)
**¡Buenas noticias!** Ya no tienes que hacer nada manual. 
- El bot en GitHub se ejecuta **cada 30 MINUTOS** solo.
- Si por alguna razón quieres forzar una actualización manual en OBS, simplemente corre:
  ```powershell
  python update_ticker.py --once
  ```

## 2. 🔗 Nuevos Ads o SmartLinks
Si Adsterra te da un nuevo link que convierte mejor:
1. Abre `elite-ads.html`.
2. Busca el botón con ID `elite-trigger`.
3. Cambia el `href="TU_NUEVO_LINK"`.
4. No olvides actualizar también `ACCESO_ADSTERRA.md` para llevar el control.

## 3. 🚀 Despliegue de Cambios
Cada vez que hagas un cambio en los archivos (HTML, CSS o JS), recuerda ejecutar el script de despliegue para que se vea en la web:
```powershell
./deploy.ps1
```

## 🛡️ Recordatorio de Seguridad (Facebook/TikTok)
- **Cero links directos**: Usa siempre la página de `handshake.html` o el blog de previas.
- **Interacción previa**: Antes de publicar en grupos, dale "amor" (likes/comentarios) a otros posts para que Facebook no te detecte como bot.
- **Datos móviles**: Si vas a publicar masivamente, hazlo desde tu celular con el Wi-Fi apagado.

---
*SportFlow AI v5.24 - Richard Deportes Elite Edition*
