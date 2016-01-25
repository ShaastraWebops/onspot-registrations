import csv
import requests
with open('shaastra.csv', 'rb') as csvfile:
    shaas = csv.reader(csvfile, delimiter=',')
    ct = 1
    for row in shaas:
        if row[0]=='NO':
            continue
        res = requests.post("http://shaastra.org:8001/api/users/festid", data={"festID":row[-2]})
        if res.status_code == 200:
            profile = res.json()
            print profile['festID']
            profile['barcodeID']=row[-1]
            # print profile
            r = requests.post("http://shaastra.org:8001/api/users/updateEverything", json={"userUpdate":profile})
            if r.status_code == 200:
                print "Done "+str(ct)
                ct+=1
            else:
                print r.status_code
        else:
            print res.status_code
