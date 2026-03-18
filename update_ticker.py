import requests
import time
import os

leagues = [
    {'id': 'arg.1', 'name': 'Liga Arg'},
    {'id': 'uefa.champions', 'name': 'Champions'},
    {'id': 'esp.1', 'name': 'La Liga'},
    {'id': 'eng.1', 'name': 'Premier'},
    {'id': 'mex.1', 'name': 'Liga MX'},
    {'id': 'col.1', 'name': 'Liga Col'}
]


# Función principal del ticker

def fetch_matches():
    all_ticker_text = "⚽ PRÓXIMOS PARTIDOS: "
    matches_found = []
    
    for league in leagues:
        try:
            url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{league['id']}/scoreboard"
            response = requests.get(url, timeout=10)
            data = response.json()
            
            for event in data.get('events', []):
                home_team = event['competitions'][0]['competitors'][0]['team']['shortDisplayName']
                away_team = event['competitions'][0]['competitors'][1]['team']['shortDisplayName']
                status = event['status']['type']['shortDetail']
                
                matches_found.append(f"{home_team} vs {away_team} ({status})")
        except Exception as e:
            print(f"Error fetching {league['name']}: {e}")

    if not matches_found:
        all_ticker_text += "No hay partidos programados por ahora. | ÚNETE AL VIP PARA MÁS."
    else:
        all_ticker_text += " | ".join(matches_found)
    
    all_ticker_text += " | 🔥 SÍGUENOS EN TELEGRAM PARA FIJAS VIP: t.me/+eDNK1QZVe-c5MjM5 🚀"
    return all_ticker_text, matches_found

def main():
    import sys
    ticker_file = "ticker_partidos.txt"
    once_only = "--once" in sys.argv or os.environ.get("ONCE_ONLY") == "true"
    
    while True:
        ticker_content = fetch_matches()[0]
        
        # Guardar en el archivo para el ticker visual de OBS
        with open(ticker_file, "w", encoding="utf-8") as f:
            f.write(ticker_content)
        
        print(f"[{time.strftime('%H:%M:%S')}] Ticker actualizado.")
        
        if once_only:
            break
            
        time.sleep(120)

if __name__ == "__main__":
    main()
