import requests
import json
import pandas as pd
import datetime
port = "http://192.168.4.87:4050"
month = "04-2019"

access_token = {}
access_token_response = requests.post(port+"/api/Reviewers/login/", data={"email": "admin@sands.in", "password": "admin"}).json()
access_id = access_token_response.get('id')
s=datetime.datetime.now()
print("new")
dataprocess_results_new = requests.get(port+"/api/eventdetails?filter[where][month_year]=04-2019&filter[where][sands_code]=MH_01_15_03_04_05_03407279_004&[access_token]=" + access_id).json()
e=datetime.datetime.now()
print(dataprocess_results_new)

timetaken=e-s
print("--------------------------------------------")
print(timetaken)
