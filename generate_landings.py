import os

# --- CONFIGURACIÓN ---
OUTPUT_DIR = "landings"
TEMPLATE_FILE = "match-preview.html"
MATCHES = [
    "real-madrid-vs-barcelona", "manchester-city-vs-liverpool", "psg-vs-marseille",
    "boca-juniors-vs-river-plate", "milan-vs-inter", "bayern-vs-dortmund",
    "colombia-vs-argentina", "brasil-vs-uruguay", "mexico-vs-usa"
    # Puedes añadir miles aquí...
]

def generate():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    with open(TEMPLATE_FILE, "r", encoding="utf-8") as f:
        template_content = f.read()
        
    for match in MATCHES:
        filename = f"{match}.html"
        # Personalizar el contenido (ej: cambiar el título en el meta)
        content = template_content.replace("SportFlow AI | Motor de Análisis", f"{match.replace('-', ' ').upper()} EN VIVO | SportFlow AI")
        
        with open(os.path.join(OUTPUT_DIR, filename), "w", encoding="utf-8") as out:
            out.write(content)
            
    print(f"¡Éxito! Se generaron {len(MATCHES)} páginas en la carpeta '{OUTPUT_DIR}'.")

if __name__ == "__main__":
    generate()
