import requests
import json
import pandas as pd



url = "https://www.thebluealliance.com/api/v3/events/2025"
payload = {}
headers = {
            "X-TBA-Auth-Key": "Tnuge6o2FKoppKZ7DZaeFgbnyXRFivvrI6FPwao5XhhcPzkCOT2K525UTbqKr13o	"
        }

with open("events.txt") as f:
    events = f.read().splitlines()
    
# print(events)
data = []

for i in range(5):
    url2 = f"https://www.thebluealliance.com/api/v3/event/{events[i]}/matches"
    response = requests.request("GET", url, headers=headers, data=payload)
    matches = json.loads(response.text)
    data.append(matches)
    
    