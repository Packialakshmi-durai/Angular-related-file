#!/bin/bash
#Site1="powerzen.com:4040"
Site1="192.168.4.87:4060"
Surl0="http://$Site1/api/Reviewers/login"
Surl1="http://$Site1/api/fileprocesses"
Surl2="http://$Site1/api/dataprocesses"
Spath=" /home/rd/Desktop"                                    #Project Folder
ScmdG="curl --silent -X GET --header Accept:application/json"                           #Get curl cmd
ScmdP="curl --silent -X POST --header Content-Type:application/json --header Accept:application/json"       #Post curl cmd

#get the token
Sget_tkn=$($ScmdP -d '{"email":"admin@sands.in","password":"admin"}' --globoff "$Surl0")
echo $Sget_tkn


Stkn=$(echo $Sget_tkn | jq '.id')
echo $("${Stkn//\"/}")
Stkn_id=$(echo "${Stkn//\"/}")
echo  "id:"$Stkn_id

while true
do
sleep 1
# Sstart=`date`
### Get response from Site1
SResponse=$(curl --silent --write-out %{http_code} --silent --output /dev/null --globoff "$Surl1?filter[where][webreport]=new&filter[where][event]=complete&filter[limit]=1&access_token=$Stkn_id")
echo $SResponse

if [ "$SResponse" = "200" ]
then
  #echo "Site is Up"
  
  SResponse1=$($ScmdG --globoff "$Surl1?filter[where][webreport]=new&filter[where][event]=complete&filter[limit]=1&access_token=$Stkn_id")
  echo $SResponse1
  Svr=""
  Sdn=""
  Sla=""
  Slap=""
  Sid=""

  Svr=$(echo $SResponse1)
  if [[ $Svr != "[]" ]];
  then
    Sprs_flg=1
    #echo "data Found."
    Syr1=$(echo $SResponse1 | jq '.[] | .month_year')
    Syr=$(echo "${Syr1//\"/}")
    prjct="HR"
    echo $prjct
    /usr/bin/env python $Spath/mdmas_web_report/main.py $Syr $prjct

  fi


fi
done