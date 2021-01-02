var Client = require('node-rest-client').Client;
var client = new Client();
const XLSX = require('xlsx');
var fromScientific = require('number-fromscientific')
var fs = require('fs')

var ip = process.argv.slice(2)[0];
var port = process.argv.slice(2)[1];

var ipAddr = "http://" + ip + ":" + port

var err_cnt = 0

var MainFunction = async function (AccessToken) {

    var err_log = {}

    await excel_read(AccessToken, err_log).then(async function (excel_res) {

        try {

            master_id = excel_res["master_id"]

            if (excel_res["is_json"] == "true") { //check content has true

                var data = "";
                var result = ""
                var excel_location = ""
                var duplicateMeterArray = ""

                data = excel_res["result1"]
                excel_location = excel_res["excel_path"]
                duplicateMeterArray = excel_res["duplicateMeters"]
                result = data

                await collectdata(AccessToken, result, excel_res).then(async function (cons_res) {//collecting master table data
                    await consumer_meter(AccessToken, result, excel_res, err_log, excel_location, duplicateMeterArray).then(async function (cons_res) {//consumer,meter push
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

//read excel file
var excel_read = async function (AccessToken, err_log) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/masterprocesses?filter[where][process_status]=new&access_token=" + AccessToken, async function (masterxl_response, err) {

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

                    err_log.error_code = "Error100B"
                    err_log.error_occured_date = new Date()
                    err_log.error_type = "Master_Error"
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

                        for (var key = 0; key < master_config.length; key++) {
                            if (!keys.includes(master_config[key])) {
                                missed_key.push(master_config[key])
                            }
                        }

                        for (var arr = 0; arr < result1.length; arr++) {

                            if (!meternonDuplicate.includes(result1[arr]["meter_no"])) {
                                meternonDuplicate.push(result1[arr]["meter_no"])
                            }
                            else {
                                meterDuplicate.push(result1[arr]["meter_no"])
                            }
                        }

                        if (head_name == 0 & missed_key.length == 0) {

                            var content = {}
                            content.is_json = "true"
                            content.result1 = result1
                            content.master_id = master_id
                            content.excel_path = path
                            content.duplicateMeters = meterDuplicate

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
                            if (head_name > 0) {
                                err_log.error_code = "Error100F"
                                err_log.error_occured_date = new Date()
                                err_log.error_type = "Master_Error"
                                err_log.file_path = path
                                err_log.error_desc = "-"
                                err_log.error_remark = "Column names should not be empty"
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
                        err_log.error_code = "Error100D"
                        err_log.error_occured_date = new Date()
                        err_log.error_type = "Master_Error"
                        err_log.file_path = path
                        err_log.error_desc = "-"
                        err_log.error_remark = "Empty sheet are not allowed"

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
                    err_log.error_code = "Error100C"
                    err_log.error_occured_date = new Date()
                    err_log.error_type = "Master_Error"
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
                err_log.error_code = "Error100A"
                err_log.error_occured_date = new Date()
                err_log.error_type = "Master_Error"
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

var collectdata = async function (AccessToken, result, excel_res) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/subdivisions?filter[where][_id]=" + excel_res["subdivisionId"] + "&access_token=" + AccessToken, function (sub_response, err) {
            excel_res.subname = sub_response[0].subname
            excel_res.subid = sub_response[0].subid

            client.get(ipAddr + "/api/divisions?filter[where][_id]=" + sub_response[0].divisionId + "&access_token=" + AccessToken, function (div_response, err) {
                excel_res.division_name = div_response[0].division_name
                excel_res.division_id = div_response[0].division_id

                client.get(ipAddr + "/api/circles?filter[where][_id]=" + div_response[0].circleId + "&access_token=" + AccessToken, function (circle_response, err) {
                    excel_res.circle_name = circle_response[0].circle_name
                    excel_res.circle_id = circle_response[0].circle_id

                    client.get(ipAddr + "/api/regions?filter[where][_id]=" + circle_response[0].regionId + "&access_token=" + AccessToken, function (reg_response, err) {
                        excel_res.region = reg_response[0].region
                        excel_res.region_id = reg_response[0].region_id

                        client.get(ipAddr + "/api/discoms?filter[where][_id]=" + reg_response[0].discomId + "&access_token=" + AccessToken, function (discom_response, err) {
                            excel_res.discom_name = discom_response[0].discom_name
                            excel_res.discom_id = discom_response[0].discom_id

                            client.get(ipAddr + "/api/states?filter[where][_id]=" + discom_response[0].stateId + "&access_token=" + AccessToken, function (state_response, err) {
                                excel_res.state_name = state_response[0].state_name
                                excel_res.state_id = state_response[0].state_id
                                resolve()
                            })
                        })
                    })
                })
            })
        })
    })
}

var consumer_meter = async function (AccessToken, result, excel_res, err_log, excel_location, duplicateMeterArray) {

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
            var format_makeCode = String(excel_res["make_code"]).padStart(3, 0)

            await consumer_fun(excel_res, format_consumerNo, format_meterNo, format_makeCode, AccessToken, cons_i, result[cons_i], err_log, excel_location, duplicateMeterArray).then(async function (cons_i) {
                if ((cons_i + 1) == result.length) {
                    await meter(AccessToken, result, excel_res["master_id"], excel_res, duplicateMeterArray).then(async function (meter_res) {
                        resolve()
                    });
                }
                else {
                    resolve()
                }
            });
        }
    })
}

var consumer_fun = async function (excel_res, format_consumerNo, format_meterNo, format_makeCode, AccessToken, cons_i, cons_result, err_log, excel_location, duplicateMeterArray) {

    return new Promise(async function (resolve, reject) {

        var consumer_det = {}
        var error_status = ""
        var errorCode = ""

        consumer_det = {
            "consumer_no": format_consumerNo,
            "consumer_name": cons_result["consumer_name"],
            "consumer_add1": cons_result["consumer_add1"],
            "consumer_add2": cons_result["consumer_add2"],
            "consumer_add3": cons_result["consumer_add3"],
            "consumer_add4": cons_result["consumer_add4"],
            "pincode": cons_result["pincode"],
            "acc_no": (cons_result["acc_no"]),
            "binder_no": cons_result["binder_no"],
            "token_no": (cons_result["token_no"]),
            "office_code": cons_result["office_code"],
            "meter_no_generator": cons_result["meter_no_generator"],
            "meter_mf_generator": (cons_result["meter_mf_generator"]),
            "consumer_contact_no": cons_result["consumer_contact_no"],
            "consumer_contact_person": cons_result["consumer_contact_person"],
            "consumer_mail": cons_result["consumer_mail"],
            "ss_code": cons_result["ss_code"],
            "feeder_code": cons_result["feeder_code"],
            "dt_code": cons_result["dt_code"],
            "meter_no": (format_meterNo),
            "make_code": (format_makeCode)
        }

        var args_consumer = {
            data: consumer_det,
            headers: {
                "Content-Type": "application/json"
            }
        }

        //pushing consumer data after all validation complete
        client.get(ipAddr + "/api/consumers?filter[where][meter_no]=" + format_meterNo + "&filter[where][make_code]=" + format_makeCode + "&access_token=" + AccessToken, function (consumer_response, err) {

            if ((format_meterNo != undefined) & (format_consumerNo != undefined) & (cons_result["contract_demand"] != undefined) & (cons_result["meter_status"] != undefined) &
                (cons_result["supply_cat"] != undefined) & (cons_result["bill_mf"] != undefined) &
                (cons_result["industry_type"] != undefined) & (cons_result["meter_ct_ratio"] != undefined) &
                (cons_result["v_rated"] != undefined) & (cons_result["c_rated"] != undefined) &
                (cons_result["mtr_type"] != undefined)) {

                if (consumer_response.length == 0 & format_consumerNo.length == 12 & format_meterNo.length == 8 & (!duplicateMeterArray.includes(cons_result["meter_no"]))) {
                    client.post(ipAddr + "/api/subdivisions/" + excel_res["subdivisionId"] + "/consumers?access_token=" + AccessToken, args_consumer, function (data, response) {
                        console.log("Consumer Push : " + response.statusCode)
                        resolve(cons_i)
                    })
                }
                if (duplicateMeterArray.includes(cons_result["meter_no"])) {

                    if (!errorPushCount.includes(cons_result["meter_no"])) {
                        errorPushCount.push(cons_result["meter_no"])
                        error_status = "Duplicate Meters"
                        errorCode = "Error100H"
                        err_count_function(format_meterNo, err_log, excel_location, AccessToken, error_status, errorCode)
                    }
                    resolve(cons_i)
                }
                if (consumer_response.length == 0 & (format_consumerNo.length > 12)) {
                    error_status = "Consumer number must be less than 12 digit "
                    errorCode = "Error100I"
                    err_count_function(format_meterNo, err_log, excel_location, AccessToken, error_status, errorCode)
                    resolve(cons_i)
                }
                if (consumer_response.length == 0 & (format_meterNo.length > 8)) {
                    error_status = "Meter number must be less than 8 digit"
                    errorCode = "Error100J"
                    err_count_function(format_meterNo, err_log, excel_location, AccessToken, error_status, errorCode)
                    resolve(cons_i)
                }
                if (consumer_response.length > 0 & (!duplicateMeterArray.includes(cons_result["meter_no"]))) {
                    var id = consumer_response[0]["id"]
                    client.post(ipAddr + "/api/consumers/update?where[id]=" + id + "&access_token=" + AccessToken, args_consumer, function (data, response) {
                        console.log("Consumer Update : " + response.statusCode)
                        resolve(cons_i)
                    });
                }
            }
            else {
                error_status = "Mandatory fields are missing"
                errorCode = "Error100G"
                err_count_function(format_meterNo, err_log, excel_location, AccessToken, error_status, errorCode)
                resolve(cons_i)
            }
        })
    })
}

var meter = async function (AccessToken, result, master_id, excel_res, duplicateMeterArray) {

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
            var format_meter_makeCode = String(excel_res["make_code"]).padStart(3, 0)

            await meter_fun(excel_res, format_meter_consumerNo, format_meter_meterNo, format_meter_makeCode, AccessToken, met, result[met], duplicateMeterArray).then(async function (met) {
                if ((met + 1) == result.length) {
                    await updateApi(AccessToken, result, master_id).then(async function (meter_res) {
                        resolve()
                    })
                }
            });
        }
    })
}

var meter_fun = async function (excel_res, format_meter_consumerNo, format_meter_meterNo, format_meter_makeCode, AccessToken, met, meter_result, duplicateMeterArray) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/consumers?filter[where][meter_no]=" + format_meter_meterNo + "&filter[where][consumer_no]=" + format_meter_consumerNo + "&filter[where][make_code]=" + format_meter_makeCode + "&access_token=" + AccessToken, function (consumer_response, err) {

            if (consumer_response.length > 0) {

                var meter_det = {}

                meter_det = {
                    "consumer_name": (meter_result["consumer_name"]),
                    "consumer_no": format_meter_consumerNo,
                    "sanction_load": parseFloat(meter_result["sanction_load"]),
                    "contract_demand": parseFloat(meter_result["contract_demand"]),
                    "supply_cat": meter_result["supply_cat"],
                    "tariff_cat": meter_result["tariff_cat"],
                    "industry_type": meter_result["industry_type"],
                    "ext_pt_ratio": parseInt(meter_result["ext_pt_ratio"]),
                    "ext_ct_ratio": parseInt(meter_result["ext_ct_ratio"]),
                    "v_rated": parseInt(meter_result["v_rated"]),
                    "meter_no": (format_meter_meterNo),
                    "meter_mf": parseFloat(meter_result["meter_mf"]),
                    "make_code": (format_meter_makeCode),
                    "meter_cat": meter_result["meter_cat"],
                    "meter_status": parseInt(meter_result["meter_status"]),
                    "bill_mf": parseFloat(meter_result["bill_mf"]),
                    "meter_location": meter_result["meter_location"],
                    "meter_ct_ratio": parseInt(meter_result["meter_ct_ratio"]),
                    "meter_pt_ratio": parseInt(meter_result["meter_pt_ratio"]),
                    "meter_con_status": meter_result["meter_con_status"],
                    "meter_com_type": meter_result["meter_com_type"],
                    "meter_com_port": meter_result["meter_com_port"],
                    "meter_tech_type": meter_result["meter_tech_type"],
                    "c_rated": parseInt(meter_result["c_rated"]),
                    "meter_install_date": meter_result["meter_install_date"],
                    "modem_install_status": meter_result["modem_install_status"],
                    "meter_no_feeder": meter_result["meter_no_feeder"],
                    "route_seq_no": meter_result["route_seq_no"],
                    "latitude": meter_result["latitude"],
                    "longitude": meter_result["longitude"],
                    "mtr_pri_cur": parseInt(meter_result["meter_pri_cur"]),
                    "mtr_sec_cur": parseInt(meter_result["meter_sec_cur"]),
                    "mtr_type": meter_result["mtr_type"],
                    "hierarchy_code": excel_res["state_id"] + "_" + excel_res["discom_id"] + "_" + excel_res["region_id"] + "_" + excel_res["circle_id"] + "_" + excel_res["division_id"] + "_" + excel_res["subid"] + "_" + format_meter_meterNo + "_" + format_meter_makeCode,
                    "subdivisionId": consumer_response[0]["subdivisionId"],
                    "subname": excel_res["subname"],
                    "divname": excel_res["division_name"],
                    "circlename": excel_res["circle_name"],
                    "old_meter_no": parseInt(meter_result["old_meter_no"]),
                    "old_meter_make_code": meter_result["old_meter_make_code"],
                    "old_meter_mf": parseFloat(meter_result["old_meter_mf"]),
                };

                var args_meter = {
                    data: meter_det,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }

                //pushing meter data after all validation complete
                client.get(ipAddr + "/api/meters?filter[where][meter_no]=" + format_meter_meterNo + "&filter[where][make_code]=" + format_meter_makeCode + "&access_token=" + AccessToken, function (meter_response, err) {

                    if ((meter_response.length == 0) & (format_meter_consumerNo.length == 12) & (format_meter_meterNo.length == 8) & (!duplicateMeterArray.includes(meter_result["meter_no"]))) {

                        client.post(ipAddr + "/api/consumers/" + consumer_response[0]["id"] + "/meters?access_token=" + AccessToken, args_meter, function (data, response) {
                            console.log("Meter Push : " + response.statusCode)
                            resolve(met)
                        })
                    }

                    if (meter_response.length == 0 & (format_meter_consumerNo.length > 12 || format_meter_meterNo.length > 8)) {
                        resolve(met)
                    }

                    if (meter_response.length > 0 & (!duplicateMeterArray.includes(meter_result["meter_no"]))) {

                        var id = meter_response[0]["id"]

                        client.post(ipAddr + "/api/meters/update?[where][id]=" + id + "&access_token=" + AccessToken, args_meter, function (data, response) {
                            console.log("Meter Update : " + response.statusCode)
                            resolve(met)
                        });
                    }
                })
            }
            else {
                resolve(met)
            }
        })
    })
}

async function err_count_function(format_meterNo, err_log, excel_location, AccessToken, error_status, errorCode) {

    err_cnt = err_cnt + 1
    err_log.error_code = errorCode
    err_log.error_occured_date = new Date()
    err_log.error_type = "Master_Error"
    err_log.file_path = excel_location
    err_log.error_desc = format_meterNo
    err_log.error_remark = error_status

    await errlogApi(AccessToken, err_log).then(async function (err_res) {
    })

    return err_cnt
}

var updateApi = async function (AccessToken, result, master_id) {

    return new Promise(async function (resolve, reject) {

        var err_mtr_count = err_cnt

        var args = {
            data: { process_status: "complete", count: result.length, "error_count": err_mtr_count },
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