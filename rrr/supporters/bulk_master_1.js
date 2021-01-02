var master_config = require('./master_config')
var Client = require('node-rest-client').Client;
var client = new Client();
const XLSX = require('xlsx');
var fromScientific = require('number-fromscientific')
var fs = require('fs');

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

                var sc = excel_res["result1"][0]["sc"]
                data = excel_res["result1"]
                excel_location = excel_res["excel_path"]
                duplicateMeterArray = excel_res["duplicateMeters"]

                result = data


                await state(AccessToken, sc, result).then(async function (st_res) {
                    await discom(AccessToken, sc, result).then(async function (dis1_res) {
                        await region(AccessToken, sc, result).then(async function (reg_res) {
                            await circle(AccessToken, sc, result).then(async function (cir_res) {
                                await division(AccessToken, sc, result).then(async function (div_res) {
                                    await subdivision(AccessToken, sc, result).then(async function (subdiv_res) {
                                        await consumer(AccessToken, result, excel_res, err_log, excel_location, sc, duplicateMeterArray).then(async function (cons_res) {
                                        })
                                    })
                                })
                            })
                        })
                    })
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

            var master_id = ""
            var path = ""

            master_id = masterxl_response[0]["id"]
            path = masterxl_response[0]["path"]

            if (fs.existsSync(path)) {

                try {
                    var workbook = XLSX.readFile(path);
                }
                catch (e) {

                    err_log.error_code = "Error100B"
                    err_log.error_occured_date = new Date();
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
                        var keys = Object.keys(result1[0])
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

                        });
                    }
                })
            }
        });
    });
}

var state = async function (AccessToken, sc, result) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/states?filter[where][state_id]=" + sc + "&access_token=" + AccessToken, async function (state_response, err) {

            var stateuniq = result.map((value) => value.sc).filter((value, index, result) => result.indexOf(value) == index);
            if (stateuniq.length > 1) {
                var args = {
                    data: { process_status: "error", count: result.length },
                    headers: {
                        "Content-Type": "application/json"
                    }
                };

                client.post(ipAddr + "/api/masterprocesses/update?where[id]=" + master_id + "&access_token=" + AccessToken, args, function (data, response) {
                    resolve()
                });
            }
            else {
                if (state_response.length > 0) {
                    console.log("state already exist")
                    resolve()
                }
                else {
                    var state_det = [];
                    state_det.push({
                        "state_name": result[0]["state"],
                        "state_id": result[0]["sc"],
                        "concession": (result[0]["concession"]),
                        "billing": (result[0]["billing"])
                    })

                    var args_final = {
                        data: state_det,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }

                    client.post(ipAddr + "/api/states?access_token=" + AccessToken, args_final, function (data, response) {
                        console.log("state push")
                        resolve()
                    });
                }
            }

        });
    })
}

var discom = async function (AccessToken, sc, result) {

    return new Promise(async function (resolve, reject) {

        var uniquediscom = result.map((value) => value.dc).filter((value, index, result) => result.indexOf(value) == index);
        var uniquediscomName = result.map((value) => value.disname).filter((value, index, result) => result.indexOf(value) == index);

        for (var d = 0; d < uniquediscom.length; d++) {

            if (uniquediscom[d] != {} && uniquediscom[d] != undefined) {

                var discom_format = String(uniquediscom[d]).padStart(2, 0)

                await discom_fun(discom_format, AccessToken, d, sc, result, uniquediscom, uniquediscomName).then(async function (dis_res) {
                });
            }
            if (d + 1 == uniquediscom.length) {
                resolve()
            }

        }
    });
}

var discom_fun = async function (discom_format, AccessToken, d, sc, result, uniquediscom, uniquediscomName) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/states?filter[where][state_id]=" + sc + "&access_token=" + AccessToken, async function (state_response, err) {
            if (state_response.length > 0) {

                var state_id = (state_response[0]["id"])

                client.get(ipAddr + "/api/states/" + state_id + "/discoms?filter[where][discom_id]=" + discom_format + "&access_token=" + AccessToken, function (discom_response, err) {

                    if (discom_response.length > 0) {
                        console.log("discom already exist")
                        resolve()
                    }
                    else {
                        var discom_det = []

                        discom_det.push({
                            "discom_name": uniquediscomName[d],
                            "discom_id": (discom_format)
                        })

                        var args_discom = {
                            data: discom_det,
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }
                        client.post(ipAddr + "/api/states/" + state_id + "/discoms?access_token=" + AccessToken, args_discom, function (data, response) {
                            console.log("discom push")
                            resolve()
                        });
                    }
                })
            }
            else {
                resolve()
            }
        })
    });
}

var region = async function (AccessToken, sc, result) {

    return new Promise(async function (resolve, reject) {

        var regiondata = [];

        for (var regData = 0; regData < result.length; regData++) {
            regiondata.push({
                "statecode": result[regData]["sc"],
                "dc": result[regData]["dc"],
                "zone_region": result[regData]["zone_region"],
                "rc": result[regData]["rc"]
            })
        }

        var temp_r = regiondata
        reg_result = [...new Set(temp_r.map(obj => JSON.stringify(obj)))]
            .map(str => JSON.parse(str));

        for (var r = 0; r < reg_result.length; r++) {
            if (reg_result[r] != {}) {
                var reg_format = String(reg_result[r]["rc"]).padStart(2, 0)
                await region_fun(reg_format, AccessToken, r, sc, reg_result).then(async function (reg_res) {
                });
            }
            if (r + 1 == reg_result.length) {
                resolve()
            }
        }

    })
}

var region_fun = async function (reg_format, AccessToken, r, sc, reg_result) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/states?filter[where][state_id]=" + sc + "&access_token=" + AccessToken, async function (state_response, err) {
            if (state_response.length > 0) {
                client.get(ipAddr + "/api/states/" + state_response[0]["id"] + "/discoms?filter[where][discom_id]=" + String(reg_result[r]["dc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (discom_response, err) {
                    if (discom_response.length > 0) {
                        dis_uniq_id = discom_response[0]["id"]
                        client.get(ipAddr + "/api/discoms/" + dis_uniq_id + "/regions?filter[where][region_id]=" + reg_format + "&access_token=" + AccessToken, function (reg_response, err) {

                            if (reg_response.length > 0) {
                                console.log("region already exist")
                                resolve()
                            }
                            else {

                                var region_det = []

                                region_det.push({
                                    "region": reg_result[r]["zone_region"],
                                    "region_id": (reg_format)
                                })

                                var args_region = {
                                    data: region_det,
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                                }

                                client.post(ipAddr + "/api/discoms/" + dis_uniq_id + "/regions?access_token=" + AccessToken, args_region, function (data, response) {
                                    console.log("region push")
                                    resolve()
                                });
                            }
                        })
                    }
                    else {
                        resolve()
                    }
                })
            }
            else {
                resolve()
            }
        })
    });
}
var circle = async function (AccessToken, sc, result) {

    return new Promise(async function (resolve, reject) {

        var circledata = [];
        var cir_result = [];

        for (var cir_data = 0; cir_data < result.length; cir_data++) {
            circledata.push({
                "statecode": result[cir_data]["sc"],
                "dc": result[cir_data]["dc"],
                "rc": result[cir_data]["rc"],
                "cc": result[cir_data]["cc"],
                "cirname": result[cir_data]["cirname"],
            })
        }

        var temp_reg = circledata
        var cir_result = [...new Set(temp_reg.map(obj => JSON.stringify(obj)))]
            .map(str => JSON.parse(str));

        for (var c = 0; c < cir_result.length; c++) {
            if (cir_result[c] != {}) {
                var cir_format = "";
                cir_format = String(cir_result[c]["cc"]).padStart(2, 0)
                await circle_fun(cir_format, AccessToken, c, sc, cir_result).then(async function (cir_res) {
                })
            }
            if (c + 1 == cir_result.length) {
                resolve()
            }
        }
    })
}

var circle_fun = async function (cir_format, AccessToken, c, sc, cir_result) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/states?filter[where][state_id]=" + sc + "&access_token=" + AccessToken, async function (state_response, err) {
            if (state_response.length > 0) {

                client.get(ipAddr + "/api/states/" + state_response[0]["id"] + "/discoms?filter[where][discom_id]=" + String(cir_result[c]["dc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (discom_response, err) {
                    if (discom_response.length > 0) {

                        client.get(ipAddr + "/api/discoms/" + discom_response[0]["id"] + "/regions?filter[where][region_id]=" + String(cir_result[c]["rc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (reg_response, err) {
                            if (reg_response.length > 0) {

                                client.get(ipAddr + "/api/regions/" + reg_response[0]["id"] + "/circles?filter[where][circle_id]=" + cir_format + "&access_token=" + AccessToken, function (cir_response, err) {
                                    if (cir_response.length > 0) {
                                        console.log("circle already exist")
                                        resolve()
                                    }
                                    else {
                                        var circle_det = []

                                        circle_det.push({
                                            "circle_name": cir_result[c]["cirname"],
                                            "circle_id": (cir_format)
                                        })

                                        var args_circle = {
                                            data: circle_det,
                                            headers: {
                                                "Content-Type": "application/json"
                                            }
                                        }

                                        client.post(ipAddr + "/api/regions/" + reg_response[0]["id"] + "/circles?access_token=" + AccessToken, args_circle, function (data, response) {
                                            console.log("circle push")
                                            resolve()
                                        });
                                    }
                                })
                            }
                            else {
                                resolve()
                            }
                        })
                    }
                    else {
                        resolve()
                    }
                })
            }
            else {
                resolve()
            }
        })
    });
}
var division = async function (AccessToken, sc, result) {

    return new Promise(async function (resolve, reject) {

        var divisiondata = [];
        var div_result = [];

        for (var div_data = 0; div_data < result.length; div_data++) {
            divisiondata.push({
                "statecode": result[div_data]["sc"],
                "dc": result[div_data]["dc"],
                "rc": result[div_data]["rc"],
                "cc": result[div_data]["cc"],
                "vc": result[div_data]["vc"],
                "divname": result[div_data]["divname"]
            })
        }

        var temp_div = divisiondata
        var div_result = [...new Set(temp_div.map(obj => JSON.stringify(obj)))]
            .map(str => JSON.parse(str));

        for (var div = 0; div < div_result.length; div++) {
            if (div_result[div] != {} && div_result[div] != undefined) {
                var div_code_format = String(div_result[div]["vc"]).padStart(2, 0)
                await division_fun(div_code_format, AccessToken, sc, div, div_result).then(async function (div_res) {
                });
            }
            if (div + 1 == div_result.length) {
                resolve()
            }
        }
    });
}

var division_fun = async function (div_code_format, AccessToken, sc, div, div_result) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/states?filter[where][state_id]=" + sc + "&access_token=" + AccessToken, async function (state_response, err) {
            if (state_response.length > 0) {

                client.get(ipAddr + "/api/states/" + state_response[0]["id"] + "/discoms?filter[where][discom_id]=" + String(div_result[div]["dc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (discom_response, err) {
                    if (discom_response.length > 0) {

                        client.get(ipAddr + "/api/discoms/" + discom_response[0]["id"] + "/regions?filter[where][region_id]=" + String(div_result[div]["rc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (reg_response, err) {
                            if (reg_response.length > 0) {

                                client.get(ipAddr + "/api/regions/" + reg_response[0]["id"] + "/circles?filter[where][circle_id]=" + String(div_result[div]["cc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (cir_response, err) {
                                    if (cir_response.length > 0) {

                                        client.get(ipAddr + "/api/circles/" + cir_response[0]["id"] + "/divisions?filter[where][division_id]=" + div_code_format + "&access_token=" + AccessToken, function (div_response, err) {

                                            if (div_response.length > 0) {
                                                console.log("division already exist")
                                                resolve()
                                            }
                                            else {
                                                var division_det = []

                                                division_det.push({
                                                    "division_name": div_result[div]["divname"],
                                                    "division_id": (div_code_format)
                                                })

                                                var args_division = {
                                                    data: division_det,
                                                    headers: {
                                                        "Content-Type": "application/json"
                                                    }
                                                }

                                                client.post(ipAddr + "/api/circles/" + cir_response[0]["id"] + "/divisions?access_token=" + AccessToken, args_division, function (data, response) {
                                                    console.log("divison push")
                                                    resolve()
                                                });
                                            }
                                        })
                                    }
                                    else {
                                        resolve()
                                    }
                                })
                            }
                            else {
                                resolve()
                            }
                        })
                    }
                    else {
                        resolve()
                    }
                })
            }
            else {
                resolve()
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
var subdivision = async function (AccessToken, sc, result) {

    return new Promise(async function (resolve, reject) {

        var subdivisiondata = [];
        var subdiv_result = [];

        for (var subdiv_data = 0; subdiv_data < result.length; subdiv_data++) {
            subdivisiondata.push({
                "statecode": result[subdiv_data]["sc"],
                "dc": result[subdiv_data]["dc"],
                "rc": result[subdiv_data]["rc"],
                "cc": result[subdiv_data]["cc"],
                "vc": result[subdiv_data]["vc"],
                "uc": result[subdiv_data]["uc"],
                "subname": result[subdiv_data]["subname"]
            })
        }

        var temp_subdiv = subdivisiondata
        var subdiv_result = [...new Set(temp_subdiv.map(obj => JSON.stringify(obj)))]
            .map(str => JSON.parse(str));

        for (var sdiv = 0; sdiv < subdiv_result.length; sdiv++) {
            if (subdiv_result[sdiv] != {} && subdiv_result[sdiv] != undefined) {
                var subdiv_code_format = String(subdiv_result[sdiv]["uc"]).padStart(2, 0)
                await subdivision_fun(subdiv_code_format, AccessToken, sc, sdiv, subdiv_result).then(async function (subdiv_res) {
                    resolve()
                });
            }
        }
    })
}

var subdivision_fun = async function (subdiv_code_format, AccessToken, sc, sdiv, subdiv_result) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/states?filter[where][state_id]=" + sc + "&access_token=" + AccessToken, async function (state_response, err) {
            if (state_response.length > 0) {

                client.get(ipAddr + "/api/states/" + state_response[0]["id"] + "/discoms?filter[where][discom_id]=" + String(subdiv_result[sdiv]["dc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (discom_response, err) {
                    if (discom_response.length > 0) {

                        client.get(ipAddr + "/api/discoms/" + discom_response[0]["id"] + "/regions?filter[where][region_id]=" + String(subdiv_result[sdiv]["rc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (reg_response, err) {
                            if (reg_response.length > 0) {

                                client.get(ipAddr + "/api/regions/" + reg_response[0]["id"] + "/circles?filter[where][circle_id]=" + String(subdiv_result[sdiv]["cc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (cir_response, err) {
                                    if (cir_response.length > 0) {

                                        client.get(ipAddr + "/api/circles/" + cir_response[0]["id"] + "/divisions?filter[where][division_id]=" + String(subdiv_result[sdiv]["vc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (div_response, err) {
                                            if (div_response.length > 0) {

                                                client.get(ipAddr + "/api/divisions/" + div_response[0]["id"] + "/subdivisions?filter[where][subid]=" + subdiv_code_format + "&access_token=" + AccessToken, function (subdiv_response, err) {
                                                    if (subdiv_response.length > 0) {
                                                        console.log("subdiv already exist")
                                                        resolve()
                                                    }
                                                    else {
                                                        var subdivision_det = []

                                                        subdivision_det.push({
                                                            "subname": subdiv_result[sdiv]["subname"],
                                                            "subid": (subdiv_code_format)
                                                        })

                                                        var args_subdivision = {
                                                            data: subdivision_det,
                                                            headers: {
                                                                "Content-Type": "application/json"
                                                            }
                                                        }

                                                        client.post(ipAddr + "/api/divisions/" + div_response[0]["id"] + "/subdivisions?access_token=" + AccessToken, args_subdivision, function (data, response) {
                                                            console.log("subdiv push")
                                                            resolve()
                                                        });
                                                    }
                                                })
                                            }
                                            else {
                                                resolve()
                                            }
                                        })
                                    }
                                    else {
                                        resolve()
                                    }
                                })
                            }
                            else {
                                resolve()
                            }
                        })
                    }
                    else {
                        resolve()
                    }
                })
            }
            else {
                resolve()
            }
        })
    })
}
var consumer = async function (AccessToken, result, excel_res, err_log, excel_location, sc, duplicateMeterArray) {

    return new Promise(async function (resolve, reject) {

        var consumer_no = "-"
        var errorPushCount = [];

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
            var format_makeCode = String(result[cons_i]["make_code"]).padStart(3, 0)

            await consumer_fun(excel_res, format_consumerNo, format_meterNo, format_makeCode, AccessToken, cons_i, result[cons_i], err_log, excel_location, sc, duplicateMeterArray, errorPushCount).then(async function (cons_i) {

                if ((cons_i + 1) == result.length) {
                    await meter(AccessToken, sc, result, excel_res["master_id"], duplicateMeterArray).then(async function (meter_res) {
                        resolve()
                    });
                }
                else {
                    resolve()
                }
            });
            //}
        }
    })
}

var consumer_fun = async function (excel_res, format_consumerNo, format_meterNo, format_makeCode, AccessToken, cons_i, cons_result, err_log, excel_location, sc, duplicateMeterArray, errorPushCount) {

    return new Promise(async function (resolve, reject) {
        client.get(ipAddr + "/api/states?filter[where][state_id]=" + sc + "&access_token=" + AccessToken, async function (state_response, err) {
            if (state_response.length > 0) {
                client.get(ipAddr + "/api/states/" + state_response[0]["id"] + "/discoms?filter[where][discom_id]=" + String(cons_result["dc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (discom_response, err) {
                    if (discom_response.length > 0) {

                        client.get(ipAddr + "/api/discoms/" + discom_response[0]["id"] + "/regions?filter[where][region_id]=" + String(cons_result["rc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (reg_response, err) {
                            if (reg_response.length > 0) {
                                client.get(ipAddr + "/api/regions/" + reg_response[0]["id"] + "/circles?filter[where][circle_id]=" + String(cons_result["cc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (cir_response, err) {
                                    if (cir_response.length > 0) {

                                        client.get(ipAddr + "/api/circles/" + cir_response[0]["id"] + "/divisions?filter[where][division_id]=" + String(cons_result["vc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (div_response, err) {
                                            if (div_response.length > 0) {

                                                client.get(ipAddr + "/api/divisions/" + div_response[0]["id"] + "/subdivisions?filter[where][subid]=" + String(cons_result["uc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (subdiv_response, err) {
                                                    if (subdiv_response.length > 0) {

                                                        client.get(ipAddr + "/api/subdivisions/" + subdiv_response[0]["id"] + "/consumers?filter[where][consumer_no]=" + format_consumerNo + "&filter[where][meter_no]=" + format_meterNo + "&filter[where][make_code]=" + format_makeCode + "&access_token=" + AccessToken, function (cons_response, err) {
                                                            var consumer_det = []

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
                                                                "make_code": (format_makeCode),
                                                                "consumer_con_sts": cons_result["consumer_con_sts"]
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
                                                                        client.post(ipAddr + "/api/subdivisions/" + subdiv_response[0]["id"] + "/consumers?access_token=" + AccessToken, args_consumer, function (data, response) {
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
                                                    else {
                                                        resolve()
                                                    }
                                                })
                                            }
                                            else {
                                                resolve()
                                            }
                                        })
                                    }
                                    else {
                                        resolve()
                                    }
                                })
                            }
                            else {
                                resolve()
                            }
                        })
                    }
                    else {
                        resolve()
                    }
                })
            }
            else {
                resolve()
            }
        })
    })
}
var meter = async function (AccessToken, sc, result, master_id, duplicateMeterArray) {

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
            var format_meter_makeCode = String(result[met]["make_code"]).padStart(3, 0)

            await meter_fun(format_meter_consumerNo, format_meter_meterNo, format_meter_makeCode, AccessToken, sc, met, result[met], duplicateMeterArray).then(async function (met) {
                if ((met + 1) == result.length) {

                    await updateApi(AccessToken, result, master_id).then(async function (meter_res) {
                        resolve()
                    })
                }
            });
        }
    })
}

var meter_fun = async function (format_meter_consumerNo, format_meter_meterNo, format_meter_makeCode, AccessToken, sc, meter_j, meter_result, duplicateMeterArray) {

    return new Promise(async function (resolve, reject) {

        client.get(ipAddr + "/api/states?filter[where][state_id]=" + sc + "&access_token=" + AccessToken, async function (state_response, err) {
            if (state_response.length > 0) {

                client.get(ipAddr + "/api/states/" + state_response[0]["id"] + "/discoms?filter[where][discom_id]=" + String(meter_result["dc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (discom_response, err) {
                    if (discom_response.length > 0) {

                        client.get(ipAddr + "/api/discoms/" + discom_response[0]["id"] + "/regions?filter[where][region_id]=" + String(meter_result["rc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (reg_response, err) {
                            if (reg_response.length > 0) {

                                client.get(ipAddr + "/api/regions/" + reg_response[0]["id"] + "/circles?filter[where][circle_id]=" + String(meter_result["cc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (cir_response, err) {
                                    if (cir_response.length > 0) {

                                        client.get(ipAddr + "/api/circles/" + cir_response[0]["id"] + "/divisions?filter[where][division_id]=" + String(meter_result["vc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (div_response, err) {
                                            if (div_response.length > 0) {

                                                client.get(ipAddr + "/api/divisions/" + div_response[0]["id"] + "/subdivisions?filter[where][subid]=" + String(meter_result["uc"]).padStart(2, 0) + "&access_token=" + AccessToken, function (subdiv_response, err) {
                                                    if (subdiv_response.length > 0) {

                                                        client.get(ipAddr + "/api/subdivisions/" + subdiv_response[0]["id"] + "/consumers?filter[where][consumer_no]=" + format_meter_consumerNo + "&filter[where][meter_no]=" + format_meter_meterNo + "&filter[where][make_code]=" + format_meter_makeCode + "&access_token=" + AccessToken, function (cons_response, err) {
                                                            if (cons_response.length > 0) {

                                                                var meter_det = []

                                                                meter_det = {
                                                                    "sanction_load": parseFloat(meter_result["sanction_load"]),
                                                                    "contract_demand": parseFloat(meter_result["contract_demand"]),
                                                                    "supply_cat": meter_result["supply_cat"],
                                                                    "tariff_cat": meter_result["tariff_cat"],
                                                                    "industry_type": meter_result["industry_type"],
                                                                    "ext_pt_ratio": parseInt(meter_result["ext_pt_ratio"]),
                                                                    "ext_ct_ratio": parseInt(meter_result["ext_ct_ratio"]),
                                                                    "v_rated": (meter_result["v_rated"]),
                                                                    "hierarchy_code": meter_result["hierarchy_code"],
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
                                                                    "mtr_pri_cur": parseInt(meter_result["mtr_pri_cur"]),
                                                                    "mtr_sec_cur": parseInt(meter_result["mtr_sec_cur"]),
                                                                    "mtr_type": meter_result["mtr_type"],
                                                                    "subname": meter_result["subname"],
                                                                    "divname": meter_result["divname"],
                                                                    "circlename": meter_result["cirname"],
                                                                    "old_meter_no": parseInt(meter_result["old_meter_no"]),
                                                                    "old_meter_make_code": meter_result["old_meter_make_code"],
                                                                    "old_meter_mf": parseFloat(meter_result["old_meter_mf"]),
                                                                    "consumer_name": meter_result["consumer_name"],
                                                                    "consumer_no": meter_result["consumer_no"],
                                                                    "meter_con_sts": meter_result["meter_con_sts"],
                                                                    "subdivisionId": subdiv_response[0]["id"]
                                                                }

                                                                var args_meter = {
                                                                    data: meter_det,
                                                                    headers: {
                                                                        "Content-Type": "application/json"
                                                                    }
                                                                }

                                                                client.get(ipAddr + "/api/meters?filter[where][meter_no]=" + format_meter_meterNo + "&filter[where][make_code]=" + format_meter_makeCode + "&access_token=" + AccessToken, function (meter_response, err) {
                                                                    if ((meter_response.length == 0) & (format_meter_consumerNo.length == 12) & (format_meter_meterNo.length == 8) & (!duplicateMeterArray.includes(meter_result["meter_no"]))) {

                                                                        client.post(ipAddr + "/api/consumers/" + cons_response[0]["id"] + "/meters?access_token=" + AccessToken, args_meter, function (data, response) {
                                                                            console.log("Meter Push : " + response.statusCode)
                                                                            resolve(meter_j)
                                                                        })
                                                                    }

                                                                    if (meter_response.length == 0 & (format_meter_consumerNo.length > 12 || format_meter_meterNo.length > 8)) {

                                                                        resolve(meter_j)
                                                                    }

                                                                    if (meter_response.length > 0 & (!duplicateMeterArray.includes(meter_result["meter_no"]))) {

                                                                        var id = meter_response[0]["id"]

                                                                        client.post(ipAddr + "/api/meters/update?[where][id]=" + id + "&access_token=" + AccessToken, args_meter, function (data, response) {
                                                                            console.log("Meter Update : " + response.statusCode)
                                                                            resolve(meter_j)
                                                                        });
                                                                    }
                                                                })
                                                            }
                                                            else {
                                                                resolve(meter_j)
                                                            }
                                                        })
                                                    }
                                                    else {
                                                        resolve(meter_j)
                                                    }
                                                })
                                            }
                                            else {
                                                resolve(meter_j)
                                            }
                                        })
                                    }
                                    else {
                                        resolve(meter_j)
                                    }
                                })
                            }
                            else {
                                resolve(meter_j)
                            }
                        })
                    }
                    else {
                        resolve(meter_j)
                    }
                })
            }
            else {
                resolve(meter_j)
            }
        })
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