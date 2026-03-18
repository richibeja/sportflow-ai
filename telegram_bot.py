import requests
import time
import os

# --- CONFIGURACIÓN (Usa Variables de Entorno para GitHub) ---
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "TU_BOT_TOKEN_AQUÍ")
CHAT_ID = os.getenv("CHAT_ID", "TU_CHAT_ID_O_CANAL_AQUÍ") 
WEB_URL = "https://sportflow-ai-snowy.vercel.app/"

def send_telegram_message(message):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
        "disable_web_page_preview": False
    }
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("¡Mensaje enviado con éxito a Telegram!")
        else:
            print(f"Error al enviar: {response.text}")
    except Exception as e:
        print(f"Error de conexión: {e}")

def get_matches_from_ticker():
    # Lee el archivo que ya actualizamos con el otro bot
    ticker_path = "d:/deportes/ticker_partidos.txt"
    if os.path.exists(ticker_path):
        with open(ticker_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            # Limpiamos un poco el texto del ticker para Telegram
            matches = content.replace("⚽ PRÓXIMOS PARTIDOS: ", "").split(" | ")
            return matches
    return []

def main():
    print("🚀 Iniciando Motor de Notificaciones Telegram...")
    matches = get_matches_from_ticker()
    
    if not matches:
        print("No hay partidos para anunciar hoy.")
        return

    # Mensaje de cabecera
    header = "<b>⚽ ¡LOS PARTIDOS DE HOY ESTÁN LISTOS!</b>\n\n"
    body = ""
    for match in matches:
        if "t.me" not in match: # Ignorar el spam de telegram del propio ticker
            body += f"🔹 {match}\n"
    
    footer = f"\n🔴 <b>MIRA LA SEÑAL HD AQUÍ:</b>\n{WEB_URL}"
    
    final_message = header + body + footer
    
    # Enviar el mensaje
    send_telegram_message(final_message)

if __name__ == "__main__":
    # Si quieres que se envíe solo una vez cuando lo corras:
    main()
    
    # Opcional: Podrías ponerle un bucle si quisieras que avise cada X horas
    # Pero lo ideal es correrlo manual o meterlo en el mismo GitHub Action
