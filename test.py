import requests
from bs4 import BeautifulSoup

def extract_chess_results(url):
    response = requests.get(url)
    response.raise_for_status()  

    soup = BeautifulSoup(response.content, 'html.parser')
    
    tournament_details = {
        'name': soup.find('h2').get_text().strip(),
        'details': [detail.get_text().strip() for detail in soup.find_all('h3')],
    }


    table = soup.find('table', {'class': 'CRs1'})
    

    players = []
    for row in table.find_all('tr'):
        columns = [td.get_text().strip() for td in row.find_all('td')]
        if len(columns) >= 5:
            player = {
                'Rank': columns[0],
                'Name': columns[2],
                'FED': columns[3],
                'Points': columns[4],
                'Rating': columns[5]
                'F'

            }
            players.append(player)
    
    return {
        'tournament_details': tournament_details,
        'players': players
    }


url = "https://chess-results.com/tnr793016.aspx?lan=1&art=1&turdet=YES&flag=30"
data = extract_chess_results(url)
print(data)