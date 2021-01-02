var Client = require('node-rest-client').Client;
var client = new Client();
const XLSX = require('xlsx');
var fs = require('fs');
var fromScientific = require('number-fromscientific')

var ip = process.argv.slice(2)[0];
var port = process.argv.slice(2)[1];

var ipAddr = "http://" + ip + ":" + port

var err_log = {}

var MainFunction = async function (AccessToken) {

    await excel_read(AccessToken, err_log).then(async function (excel_res) {

        try {

            master_id = excel_res["master_id"]

            if (excel_res["is_json"] == "true") {

                var data = "";
                var result = ""

                data = excel_res["result1"]
                result = data

                await consumer(AccessToken, result, excel_res).then(async function (cons_res) {
                    await meter(AccessToken, result, excel_res["master_id"], excel_res).then(async function (meter_res) {
                    });
                })
            }
        }
        catch (e) {

            var args = {
                data: { process_status: "error", count: result.length },
                headers: {
                    "Content-Type": "application/json"
                }
            };

            client.post(ipAddr + "/api/masterprocesses/update?where[id]=" + master_id + "&access_token=" + AccessToken, args, function (data, response) {
            });
        }
    });
}

var excel_read = async function (AccessToken, err_log) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/masterprocesses?filter[where][process_status]=delete&access_token=" + AccessToken, async function (masterxl_response, err) {

            var make_code = ""
            var master_id = ""
            var subdivisionId = ""
            var path = ""

            master_id = masterxl_response[0]["id"]
            path = masterxl_response[0]["path"]
            make_code = masterxl_response[0]["make_code"]
            subdivisionId = masterxl_response[0]["subdivision_id"]

            if (fs.existsSync(path)) {

                try {
                    var workbook = XLSX.readFile(path);

                }
                catch (e) {

                    err_log.error_code = "Error101B"
                    err_log.error_occured_date = new Date()
                    err_log.error_type = "Master_Delete_Error"
                    err_log.excel_path = path
                    err_log.error_desc = "-"
                    err_log.remark = "File Cannot be Read"

                    var args = {
                        data: { process_status: "error", count: result.length },
                        headers: {
                            "Content-Type": "application/json"
                        }
                    };

                    await errlogApi(AccessToken, err_log).then(async function (err_res) {

                        if (err_res == "errolog_pushed") {

                            client.post(ipAddr + "/api/masterprocesses/update?where[id]=" + master_id + "&access_token=" + AccessToken, args, function (data, response) {
                                process.exit()
                            });
                        }
                    })
                }

                var sheet_name_list = workbook.SheetNames;

                if (sheet_name_list.length == 1) {

                    var result1 = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
                        raw: false
                    });

                    if (result1.length != 0) {

                        var head_name = 0
                        var missed_key = []
                        var meternonDuplicate = []
                        var meterDuplicate = []

                        for (var r = 0; r < (Object.keys(result1[0])).length; r++) {
                            if (Object.keys(result1[0])[r] == "__EMPTY") {
                                head_name += 1
                            }
                        }

                        if (head_name == 0) {

                            var content = {}
                            content.is_json = "true"
                            content.result1 = result1
                            content.master_id = master_id
                            content.excel_path = path

                            var args = {
                                data: { process_status: "process" },
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            };

                            client.post(ipAddr + "/api/masterprocesses/update?where[id]=" + master_id + "&access_token=" + AccessToken, args, function (data, response) {
                                resolve(content)
                            });
                        }
                        else {
                            if (missed_key.length > 0) {
                                err_log.error_code = "Error100E"
                                err_log.error_occured_date = new Date()
                                err_log.error_type = "Master_Error"
                                err_log.file_path = path
                                err_log.error_desc = missed_key
                                err_log.error_remark = "column names are missing"
                            }

                            var args = {
                                data: { process_status: "error", count: result.length },
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            };

                            await errlogApi(AccessToken, err_log).then(async function (err_res) {
                                if (err_res == "errolog_pushed") {

                                    client.post(ipAddr + "/api/masterprocesses/update?where[id]=" + master_id + "&access_token=" + AccessToken, args, function (data, response) {
                                        process.exit()
                                    });
                                }
                            })
                        }
                    }
                    else {
                        err_log.error_code = "Error101D"
                        err_log.error_occured_date = new Date()
                        err_log.error_type = "Master_Delete_Error"
                        err_log.file_path = path
                        err_log.error_desc = "-"
                        err_log.error_remark = "Empty sheets are not allowed"

                        var args = {
                            data: { process_status: "error", count: result.length },
                            headers: {
                                "Content-Type": "application/json"
                            }
                        };

                        await errlogApi(AccessToken, err_log).then(async function (err_res) {
                            if (err_res == "errolog_pushed") {
                                client.post(ipAddr + "/api/masterprocesses/update?where[id]=" + master_id + "&access_token=" + AccessToken, args, function (data, response) {
                                    process.exit()
                                });
                            }
                        })
                    }
                }
                else {
                    err_log.error_code = "Error101C"
                    err_log.error_occured_date = new Date()
                    err_log.error_type = "Master_Delete_Error"
                    err_log.file_path = path
                    err_log.error_desc = "-"
                    err_log.error_remark = "Multiple sheet are not allowed"

                    var args = {
                        data: { process_status: "error", count: result.length },
                        headers: {
                            "Content-Type": "application/json"
                        }
                    };

                    await errlogApi(AccessToken, err_log).then(async function (err_res) {
                        if (err_res == "errolog_pushed") {
                            client.post(ipAddr + "/api/masterprocesses/update?where[id]=" + master_id + "&access_token=" + AccessToken, args, function (data, response) {
                                process.exit()
                            });
                        }
                    })
                }
            }
            else {
                err_log.error_code = "Error101A"
                err_log.error_occured_date = new Date()
                err_log.error_type = "Master_Delete_Error"
                err_log.file_path = path
                err_log.error_desc = "-"
                err_log.error_remark = "File Not Found"

                var args = {
                    data: { process_status: "error", count: result.length },
                    headers: {
                        "Content-Type": "application/json"
                    }
                };

                await errlogApi(AccessToken, err_log).then(async function (err_res) {
                    if (err_res == "errolog_pushed") {
                        client.post(ipAddr + "/api/masterprocesses/update?where[id]=" + master_id + "&access_token=" + AccessToken, args, function (data, response) {
                            process.exit()
                        });
                    }
                })
            }
        });
    });
}

var consumer = async function (AccessToken, result, excel_res) {

    return new Promise(async function (resolve, reject) {

        var consumer_no = "-"
        var token_no = "-"
        var consumer_contact_no = "-"

        for (var cons_i = 0; cons_i < result.length; cons_i++) {

            if (result[cons_i]["consumer_no"] != undefined) {
                if ((result[cons_i]["consumer_no"]).includes("E+") || (result[cons_i]["consumer_no"]).includes("e+")) {
                    consumer_no = fromScientific(result[cons_i]["consumer_no"])
                    var format_consumerNo = String(consumer_no).padStart(12, 0)
                }
                else {
                    consumer_no = result[cons_i]["consumer_no"]
                    var format_consumerNo = String(consumer_no).padStart(12, 0)
                }
            }

            if (result[cons_i]["token_no"] != undefined) {
                if ((result[cons_i]["token_no"]).includes("E+") || (result[cons_i]["token_no"]).includes("e+"))
                    token_no = fromScientific(result[cons_i]["token_no"])
                else
                    token_no = result[cons_i]["token_no"]
            }

            if (result[cons_i]["consumer_contact_no"] != undefined) {
                if ((result[cons_i]["consumer_contact_no"]).includes("E+") || (result[cons_i]["consumer_contact_no"]).includes("e+"))
                    consumer_contact_no = fromScientific(result[cons_i]["consumer_contact_no"])
                else
                    consumer_contact_no = result[cons_i]["consumer_contact_no"]
            }

            var format_meterNo = String(result[cons_i]["meter_no"]).padStart(8, 0)
            if (excel_res["make_code"] != null)
                var format_makeCode = String(excel_res["make_code"]).padStart(3, 0)
            else
                var format_makeCode = String(result[cons_i]["make_code"]).padStart(3, 0)

            if (format_consumerNo.length != 12 ||
                format_meterNo.length != 8 ||
                format_makeCode.length != 3) {

                resolve()
            }
            else {
                await consumer_fun(excel_res, format_consumerNo, format_meterNo, format_makeCode, AccessToken, cons_i, result[cons_i]).then(async function (consumer_res) {
                    resolve()
                });
            }
        }
    })
}

var consumer_fun = async function (excel_res, format_consumerNo, format_meterNo, format_makeCode, AccessToken, cons_i, cons_result) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/consumers?filter[where][meter_no]=" + format_meterNo + "&filter[where][make_code]=" + format_makeCode + "&access_token=" + AccessToken, function (consumer_response, err) {

            if (consumer_response.length > 0) {

                var id = consumer_response[0]["id"]

                client.delete(ipAddr + "/api/consumers/" + id + "?access_token=" + AccessToken, function (data, response) {
                    console.log("Consumer Delete : " + response.statusCode)
                    resolve()
                });
            }
            else {

                resolve()
            }
        })
    })
}

var meter = async function (AccessToken, result, master_id, excel_res) {

    return new Promise(async function (resolve, reject) {

        for (var met = 0; met < result.length; met++) {

            if (result[met]["consumer_no"] != undefined) {
                if ((result[met]["consumer_no"]).includes("E+") || (result[met]["consumer_no"]).includes("e+")) {
                    consumer_no = fromScientific(result[met]["consumer_no"])
                    var format_meter_consumerNo = String(consumer_no).padStart(12, 0)
                }
                else {
                    consumer_no = result[met]["consumer_no"]
                    var format_meter_consumerNo = String(consumer_no).padStart(12, 0)
                }
            }

            var format_meter_meterNo = String(result[met]["meter_no"]).padStart(8, 0)
            if (excel_res["make_code"] != null)
                var format_meter_makeCode = String(excel_res["make_code"]).padStart(3, 0)
            else
                var format_meter_makeCode = String(result[met]["make_code"]).padStart(3, 0)

            if (format_meter_consumerNo.length != 12 ||
                format_meter_meterNo.length != 8 ||
                format_meter_makeCode.length != 3) {
                resolve()
            }
            else {
                await meter_fun(excel_res, format_meter_consumerNo, format_meter_meterNo, format_meter_makeCode, AccessToken, met, result[met]).then(async function (meter_res) {
                    if ((meter_res + 1) == result.length) {

                        await updateApi(AccessToken, result, master_id).then(async function (meter_res) {
                            resolve()
                        });
                    }
                    resolve()
                });
            }
        }
    })
}

var meter_fun = async function (excel_res, format_meter_consumerNo, format_meter_meterNo, format_meter_makeCode, AccessToken, met, meter_result) {

    return new Promise(async function (resolve, reject) {
        console.log("funn")
        client.get(ipAddr + "/api/meters?filter[where][meter_no]=" + format_meter_meterNo + "&filter[where][make_code]=" + format_meter_makeCode + "&access_token=" + AccessToken, function (meter_response, err) {
            console.log(meter_response.length)
            if (meter_response.length > 0) {

                var id = meter_response[0]["id"]

                client.delete(ipAddr + "/api/meters/" + id + "?access_token=" + AccessToken, function (data, response) {
                    console.log("Meter Delete : " + response.statusCode)
                    resolve(met)
                });
            }
            else {
                resolve()
            }
        })
    })
}

var updateApi = async function (AccessToken, result, master_id) {

    return new Promise(async function (resolve, reject) {

        var args = {
            data: { process_status: "deleted", count: result.length },
            headers: {
                "Content-Type": "application/json"
            }
        };

        client.post(ipAddr + "/api/masterprocesses/update?where[id]=" + master_id + "&access_token=" + AccessToken, args, function (data, response) {
        });
        resolve()
    })
}

var errlogApi = async function (AccessToken, err_log) {

    return new Promise(async function (resolve, reject) {

        var err_log_data = []
        err_log_data.push(err_log)

        var args_error = {
            data: err_log_data,
            headers: {
                "Content-Type": "application/json"
            }
        };

        client.post(ipAddr + "/api/errorlogs?access_token=" + AccessToken, args_error, function (err_data, err_response) {
            console.log("Error_log Update : " + err_response.statusCode)
        })
        resolve("errolog_pushed")
    })
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
        MainFunction(logindata.id)
    }
    else {
        console.log(loginerr);
    }
});