var transaction_mapping = require('./d9_mapping');
var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');
const JsonFind = require('json-find');
const lodash = require('lodash');

function callnineFunction(Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year, meter_id) {

    return new Promise(async function (resolve, reject) {

        try {

            if (Node1.D9 != undefined && Node1.D9 != '') {

                var trans = JsonFind(Node1.D9).checkKey('TRANSACTION') || JsonFind(Node1.D9).checkKey('Transaction') || JsonFind(Node1.D9).checkKey('transaction')
                dataproc_det.D9 = "Found"

                var d9_finalformat = []

                for (var i = 0; i < trans.length; i++) {
                    var eventdate = moment(trans[i]['_DATETIME'], 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')
                    var eventcode = parseFloat(trans[i]['_CODE'])
                    var filter_data = lodash.filter(transaction_mapping, x => x.code == (eventcode).toString());
                    if (filter_data.length != 0)
                        var event_name = filter_data[0].name
                    else
                        var event_name = "-"

                    d9_finalformat.push({
                        "date_obj": moment(eventdate, "DD-MM-YYYY HH:mm:ss").toDate(),
                        "month_year": month_year,
                        "hierarchy_code": hierarchy_code,
                        "meterId": meter_id,
                        "event_date": eventdate,
                        "event_code": eventcode,
                        "event_name": event_name
                    })
                }

                if (d9_finalformat != undefined) {

                    var args = {
                        data: d9_finalformat,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    };

                    client.post(ipAddr + "/api/d9s?access_token=" + AccessToken, args, function (data, res) {
                    });
                }
                resolve(dataproc_det)
            }
            else {
                dataproc_det.D9 = "Not Found"
                resolve(dataproc_det)
            }
        }
        catch (e) {
            dataproc_det.D9 = "Error"
            resolve(dataproc_det)
        }
    });
}

module.exports = { callnineFunction: callnineFunction }