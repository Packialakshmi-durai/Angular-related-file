import pymongo
from pymongo import MongoClient
import pandas as pd
import datetime
myclient = pymongo.MongoClient("mongodb://192.168.4.87:27017/")
print(myclient)
mydb = myclient["MDMASMHNK"]
mycol = mydb["eventdetail"]
s=datetime.datetime.now()
myquery = {"month_year": "05-2019","sands_code" : "MH_01_15_03_04_05_03407279_004"}
e=datetime.datetime.now()
mydoc = mycol.find(myquery)
df_all=pd.DataFrame()
for x in mydoc:
  print(x)
  
timetaken=e-s
print("--------------------------------------------")
print(timetaken)
