import requests
import os

url = "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://sportflow-ai-snowy.vercel.app/"
target_path = "d:/deportes/qr_interactivo_v2.png"

try:
    print(f"Descargando nuevo QR desde {url}...")
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(target_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=128):
                f.write(chunk)
        print(f"¡Éxito! Nuevo QR guardado en {target_path}")
    else:
        print(f"Error al descargar: Código {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
