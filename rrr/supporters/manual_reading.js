var Client = require('node-rest-client').Client;
var client = new Client();
var XLSX = require('xlsx');
var moment = require('moment');

var ip = process.argv.slice(2)[0];
var port = process.argv.slice(2)[1];

var ipAddr = "http://" + ip + ":" + port

var status_count = 0

var util_read = function (AccessToken) {

    client.get(ipAddr + "/api/utils?access_token=" + AccessToken, async function (util_data, util_response, util_err) {

        var path = util_data[0]['home_path']

        file_read(AccessToken, path)
    })
}

var file_read = function (AccessToken, path) {

    client.get(ipAddr + "/api/manualreadings?access_token=" + AccessToken + "&filter[where][status]=new", function (folder_data, folder_response, folder_err) {

        if (folder_data.length != 0) {

            try {

                var args = {
                    data: {
                        status: "process"
                    },
                    headers: {
                        "Content-Type": "application/json"
                    }
                }

                client.post(ipAddr + "/api/manualreadings/update?where[id]=" + folder_data[0]['id'] + "&access_token=" + AccessToken, args, function (process_data, process_data_response, process_data_err) {

                    var launchedAt = moment(folder_data[0]['launchedAt']).format('YYYY-MM-DD_HH:mm:ss')

                    var workbook = XLSX.readFile(path + "/" + folder_data[0]['path'] + "/" + "Manual_" + launchedAt + ".xlsx");
                    var sheet_name_list = workbook.SheetNames;

                    if (sheet_name_list.length == 1) {
                        var data_resp = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list], {
                            raw: false
                        });

                        var count = data_resp.length

                        MainFunc(data_resp, folder_data[0]['id'], AccessToken, count - 1)
                    }
                    else {
                        var errorlog_format = []

                        errorlog_format.push({
                            "file_path": path + "/" + folder_data[0]['path'] + "/" + "Manual_" + launchedAt + ".xlsx",
                            "error_occured_date": new Date(),
                            "launchedAt": folder_data[0]['launchedAt'],
                            "error_code": "Error104A",
                            "error_type": "Manual_Reading_Error",
                            "error_desc": "Multiple Sheets are available",
                            "error_remark": "Keep only one sheet"
                        })

                        errorlog(errorlog_format, AccessToken)

                        update_api(folder_data[0]['id'], AccessToken)
                    }
                })
            }
            catch (e) {
                var errorlog_format = []

                errorlog_format.push({
                    "file_path": path + "/" + folder_data[0]['path'] + "/" + "Manual_" + launchedAt + ".xlsx",
                    "error_occured_date": new Date(),
                    "launchedAt": folder_data[0]['launchedAt'],
                    "error_code": "Error104B",
                    "error_type": "Manual_Reading_Error",
                    "error_desc": "Inappropriate File Location",
                    "error_remark": "Check the File Location"
                })
                errorlog(errorlog_format, AccessToken)

                update_api(folder_data[0]['id'], AccessToken)
            }
        }
    });
}

var MainFunc = function (data_resp, id, AccessToken, i) {

    try {

        console.log(i)

        var BillingArray = [];
        var MongoFormat = [];

        var billdatetime = moment(data_resp[i]['billdate(dd/mm/yyyy hh:mm:ss)'], "D/M/YYYY H:m:s").format()
        var month_year = moment(data_resp[i]['billdate(dd/mm/yyyy hh:mm:ss)'], "D/M/YYYY H:m:s").format("MM-YYYY")

        if (data_resp[i].kwh != undefined) {

            BillingArray.push({
                "param": "kwh_im",
                "value": data_resp[i].kwh
            });
        }
        if (data_resp[i].kvah != undefined) {

            BillingArray.push({
                "param": "kvah_im",
                "value": data_resp[i].kvah
            });
        }
        if (data_resp[i].kw != undefined) {

            BillingArray.push({
                "param": "kw_im",
                "value": data_resp[i].kw
            });
        }
        if (data_resp[i].kva != undefined) {

            BillingArray.push({
                "param": "kva_im",
                "value": data_resp[i].kva
            });
        }

        MongoFormat.push({
            "hierarchy_code": data_resp[i].hierarchy_code,
            "meterId": "NA",
            "month_year": month_year,
            "bill_date_time": billdatetime,
            "Reset_type": "manual",
            "D3": BillingArray
        });

        var args = {
            data: MongoFormat,
            headers: {
                "Content-Type": "application/json"
            }
        };

        update_billing(args, AccessToken, i, id).then(function (res) {

            if (res - 1 >= 0) {
                MainFunc(data_resp, id, AccessToken, res - 1)
            }
        })
    }
    catch (e) {
        update_api(id, AccessToken)
    }
}

var update_billing = function (args, AccessToken, i, id) {

    return new Promise(function (resolve, reject) {

        client.post(ipAddr + "/api/d3s?access_token=" + AccessToken, args, function (data, res) {

            status_count += 1

            console.log("Billing Update : " + res.statusCode)
            console.log("------------------------------------------")

            resolve(i)

            if (i == 0) {

                var args = {
                    data: {
                        status: "complete",
                        success_count: status_count
                    },
                    headers: {
                        "Content-Type": "application/json"
                    }
                }

                client.post(ipAddr + "/api/manualreadings/update?where[id]=" + id + "&access_token=" + AccessToken, args, function (folder_data, folder_response, folder_err) {
                    console.log("Manual Reading Completed : " + folder_response.statusCode)
                });
            }
        });
    });
}

var update_api = function (id, AccessToken) {

    var args = {
        data: {
            status: "error"
        },
        headers: {
            "Content-Type": "application/json"
        }
    }

    client.post(ipAddr + "/api/manualreadings/update?where[id]=" + id + "&access_token=" + AccessToken, args, function (error_data, error_response, error_err) {
        console.log("Error Update : " + error_response.statusCode)
    });
}

var errorlog = function (errorlog_format, AccessToken) {

    var args = {
        data: errorlog_format,
        headers: {
            "Content-Type": "application/json"
        }
    };

    client.post(ipAddr + "/api/errorlogs?access_token=" + AccessToken, args, function (data, res) {
        console.log("Errorlog Update : " + res.statusCode)
    });
}

var loginargs = {

    data: {
        email: "admin@sands.in",
        password: "admin"
    },
    headers: {
        "Content-Type": "application/json"
    }
}

client.post(ipAddr + "/api/Reviewers/login", loginargs, function (logindata, loginresponse, loginerr) {

    if (!loginerr) {
        util_read(logindata.id);
    }
});