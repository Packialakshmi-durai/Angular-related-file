var config = require('./config');
var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');
const JsonFind = require('json-find');

function calltwoFunction(Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year) {

    return new Promise(async function (resolve, reject) {

        try {

            if (Node1.D2 != undefined && Node1.D2 != '') {

                var inst = JsonFind(Node1.D2).checkKey('INSTPARAM')

                if (inst != undefined) {

                    dataproc_det.D2 = "Found"

                    var vr = null
                    var vy = null
                    var vb = null
                    var ir = null
                    var iy = null
                    var ib = null
                    var i_ra = null
                    var i_ya = null
                    var i_ba = null
                    var i_rr = null
                    var i_yr = null
                    var i_br = null
                    var v_ps = null
                    var i_ps = null
                    var v_r_ang = null
                    var v_y_ang = null
                    var v_b_ang = null
                    var p_r_kw = null
                    var p_y_kw = null
                    var p_b_kw = null
                    var p_kw = null
                    var p_r_kvar = null
                    var p_y_kvar = null
                    var p_b_kvar = null
                    var p_kvar = null
                    var p_r_kva = null
                    var p_y_kva = null
                    var p_b_kva = null
                    var p_kva = null
                    var pf_r = null
                    var pf_y = null
                    var pf_b = null
                    var pf = null
                    var kwh_im = null
                    var kwh_ex = null
                    var kvah_im = null
                    var kvah_ex = null
                    var freq = null
                    var md_kw = null
                    var md_kva = null
                    var md_kw_date = null
                    var md_kva_date = null
                    var kvarh_lag = null
                    var kvarh_lead = null
                    var p_fail_dur = null
                    var i_n = null

                    // ---------------------- vr calc ----------------------
                    for (d2_con = 0; d2_con < config[1][0].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][0].input_code[d2_con].code)) {
                                vr = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- vy calc ----------------------
                    for (d2_con = 0; d2_con < config[1][1].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][1].input_code[d2_con].code)) {
                                vy = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- vb calc ----------------------
                    for (d2_con = 0; d2_con < config[1][2].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][2].input_code[d2_con].code)) {
                                vb = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- ir calc ----------------------
                    for (d2_con = 0; d2_con < config[1][3].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][3].input_code[d2_con].code)) {
                                ir = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- iy calc ----------------------
                    for (d2_con = 0; d2_con < config[1][4].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][4].input_code[d2_con].code)) {
                                iy = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- ib calc ----------------------
                    for (d2_con = 0; d2_con < config[1][5].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][5].input_code[d2_con].code)) {
                                ib = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- i_ra calc ----------------------
                    for (d2_con = 0; d2_con < config[1][6].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][6].input_code[d2_con].code)) {
                                i_ra = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- i_ya calc ----------------------
                    for (d2_con = 0; d2_con < config[1][7].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][7].input_code[d2_con].code)) {
                                i_ya = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- i_ba calc ----------------------
                    for (d2_con = 0; d2_con < config[1][8].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][8].input_code[d2_con].code)) {
                                i_ba = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- i_rr calc ----------------------
                    for (d2_con = 0; d2_con < config[1][9].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][9].input_code[d2_con].code)) {
                                i_rr = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- i_yr calc ----------------------
                    for (d2_con = 0; d2_con < config[1][10].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][10].input_code[d2_con].code)) {
                                i_yr = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- i_br calc ----------------------
                    for (d2_con = 0; d2_con < config[1][11].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][11].input_code[d2_con].code)) {
                                i_br = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- v_ps calc ----------------------
                    for (d2_con = 0; d2_con < config[1][12].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][12].input_code[d2_con].code)) {
                                v_ps = inst[i]._VALUE
                            }
                        }
                    }

                    // ---------------------- i_ps calc ----------------------
                    for (d2_con = 0; d2_con < config[1][13].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][13].input_code[d2_con].code)) {
                                i_ps = inst[i]._VALUE
                            }
                        }
                    }

                    // ---------------------- v_r_ang calc ----------------------
                    for (d2_con = 0; d2_con < config[1][14].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][14].input_code[d2_con].code)) {
                                v_r_ang = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- v_y_ang calc ----------------------
                    for (d2_con = 0; d2_con < config[1][15].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][15].input_code[d2_con].code)) {
                                v_y_ang = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- v_b_ang calc ----------------------
                    for (d2_con = 0; d2_con < config[1][16].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][16].input_code[d2_con].code)) {
                                v_b_ang = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_r_kw calc ----------------------
                    for (d2_con = 0; d2_con < config[1][17].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][17].input_code[d2_con].code)) {
                                p_r_kw = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_y_kw calc ----------------------
                    for (d2_con = 0; d2_con < config[1][18].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][18].input_code[d2_con].code)) {
                                p_y_kw = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_b_kw calc ----------------------
                    for (d2_con = 0; d2_con < config[1][19].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][19].input_code[d2_con].code)) {
                                p_b_kw = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_kw calc ----------------------
                    for (d2_con = 0; d2_con < config[1][20].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][20].input_code[d2_con].code)) {
                                p_kw = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_r_kvar calc ----------------------
                    for (d2_con = 0; d2_con < config[1][21].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][21].input_code[d2_con].code)) {
                                p_r_kvar = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_y_kvar calc ----------------------
                    for (d2_con = 0; d2_con < config[1][22].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][22].input_code[d2_con].code)) {
                                p_y_kvar = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_b_kvar calc ----------------------
                    for (d2_con = 0; d2_con < config[1][23].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][23].input_code[d2_con].code)) {
                                p_b_kvar = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_kvar calc ----------------------
                    for (d2_con = 0; d2_con < config[1][24].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][24].input_code[d2_con].code)) {
                                p_kvar = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_r_kva calc ----------------------
                    for (d2_con = 0; d2_con < config[1][25].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][25].input_code[d2_con].code)) {
                                p_r_kva = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_y_kva calc ----------------------
                    for (d2_con = 0; d2_con < config[1][26].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][26].input_code[d2_con].code)) {
                                p_y_kva = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_b_kva calc ----------------------
                    for (d2_con = 0; d2_con < config[1][27].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][27].input_code[d2_con].code)) {
                                p_b_kva = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_kva calc ----------------------
                    for (d2_con = 0; d2_con < config[1][28].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][28].input_code[d2_con].code)) {
                                p_kva = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- pf_r calc ----------------------
                    for (d2_con = 0; d2_con < config[1][29].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][29].input_code[d2_con].code)) {
                                pf_r = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- pf_y calc ----------------------
                    for (d2_con = 0; d2_con < config[1][30].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][30].input_code[d2_con].code)) {
                                pf_y = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- pf_b calc ----------------------
                    for (d2_con = 0; d2_con < config[1][31].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][31].input_code[d2_con].code)) {
                                pf_b = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- pf calc ----------------------
                    for (d2_con = 0; d2_con < config[1][32].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][32].input_code[d2_con].code)) {
                                pf = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- kwh_im calc ----------------------
                    for (d2_con = 0; d2_con < config[1][33].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][33].input_code[d2_con].code)) {
                                kwh_im = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- kwh_ex calc ----------------------
                    for (d2_con = 0; d2_con < config[1][34].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][34].input_code[d2_con].code)) {
                                kwh_ex = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- kvah_im calc ----------------------
                    for (d2_con = 0; d2_con < config[1][35].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][35].input_code[d2_con].code)) {
                                kvah_im = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- kvah_ex calc ----------------------
                    for (d2_con = 0; d2_con < config[1][36].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][36].input_code[d2_con].code)) {
                                kvah_ex = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- freq calc ----------------------
                    for (d2_con = 0; d2_con < config[1][37].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][37].input_code[d2_con].code)) {
                                freq = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- md_kw calc ----------------------
                    for (d2_con = 0; d2_con < config[1][38].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][38].input_code[d2_con].code)) {
                                md_kw = parseFloat(inst[i]._VALUE)
                                md_kw_date = inst[i]._DATETIME
                            }
                        }
                    }

                    // ---------------------- md_kva calc ----------------------
                    for (d2_con = 0; d2_con < config[1][39].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][39].input_code[d2_con].code)) {
                                md_kva = parseFloat(inst[i]._VALUE)
                                md_kva_date = inst[i]._DATETIME
                            }
                        }
                    }

                    // ---------------------- kvarh_lag calc ----------------------
                    for (d2_con = 0; d2_con < config[1][40].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][40].input_code[d2_con].code)) {
                                kvarh_lag = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- kvarh_lead calc ----------------------
                    for (d2_con = 0; d2_con < config[1][41].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][41].input_code[d2_con].code)) {
                                kvarh_lead = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- p_fail_dur calc ----------------------
                    for (d2_con = 0; d2_con < config[1][42].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][42].input_code[d2_con].code)) {
                                p_fail_dur = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- i_n calc ----------------------
                    for (d2_con = 0; d2_con < config[1][43].input_code.length; d2_con++) {
                        for (var i = 0; i < inst.length; i++) {
                            if (inst[i]._CODE.includes(config[1][43].input_code[d2_con].code)) {
                                i_n = parseFloat(inst[i]._VALUE)
                            }
                        }
                    }

                    // ---------------------- v_av calc ----------------------
                    if (vr != null) {

                        for (d2_con = 0; d2_con < config[1][44].input_code.length; d2_con++) {
                            for (var i = 0; i < inst.length; i++) {
                                if (inst[i]._CODE.includes(config[1][44].input_code[d2_con].code)) {
                                    vr = parseFloat(inst[i]._VALUE)
                                }
                            }
                        }
                    }

                    // ---------------------- i_av calc ----------------------
                    if (ir != null) {

                        for (d2_con = 0; d2_con < config[1][45].input_code.length; d2_con++) {
                            for (var i = 0; i < inst.length; i++) {
                                if (inst[i]._CODE.includes(config[1][45].input_code[d2_con].code)) {
                                    ir = parseFloat(inst[i]._VALUE)
                                }
                            }
                        }
                    }

                    var finalformat = []

                    finalformat.push({
                        "vr": vr,
                        "vy": vy,
                        "vb": vb,
                        "ir": ir,
                        "iy": iy,
                        "ib": ib,
                        "i_ra": i_ra,
                        "i_ya": i_ya,
                        "i_ba": i_ba,
                        "i_rr": i_rr,
                        "i_yr": i_yr,
                        "i_br": i_br,
                        "v_ps": v_ps,
                        "i_ps": i_ps,
                        "v_r_ang": v_r_ang,
                        "v_y_ang": v_y_ang,
                        "v_b_ang": v_b_ang,
                        "p_r_kw": p_r_kw,
                        "p_y_kw": p_y_kw,
                        "p_b_kw": p_b_kw,
                        "p_kw": p_kw,
                        "p_r_kvar": p_r_kvar,
                        "p_y_kvar": p_y_kvar,
                        "p_b_kvar": p_b_kvar,
                        "p_kvar": p_kvar,
                        "p_r_kva": p_r_kva,
                        "p_y_kva": p_y_kva,
                        "p_b_kva": p_b_kva,
                        "p_kva": p_kva,
                        "pf_r": pf_r,
                        "pf_y": pf_y,
                        "pf_b": pf_b,
                        "pf": pf,
                        "kwh_im": kwh_im,
                        "kwh_ex": kwh_ex,
                        "kvah_im": kvah_im,
                        "kvah_ex": kvah_ex,
                        "freq": freq,
                        "md_kw": md_kw,
                        "md_kva": md_kva,
                        "md_kw_date": md_kw_date,
                        "md_kva_date": md_kva_date,
                        "kvarh_lag": kvarh_lag,
                        "kvarh_lead": kvarh_lead,
                        "p_fail_dur": p_fail_dur,
                        "i_n": i_n
                    })

                    if (finalformat.length != undefined) {

                        var d2_finalformat = []

                        d2_finalformat.push({
                            "date_obj": moment(Node1.D1.G2, "DD-MM-YYYY HH:mm:ss").toDate(),
                            "month_year": month_year,
                            "hierarchy_code": hierarchy_code,
                            "D2": finalformat
                        })

                        var args = {
                            data: d2_finalformat,
                            headers: {
                                "Content-Type": "application/json"
                            }
                        };

                        client.post(ipAddr + "/api/d2s?access_token=" + AccessToken, args, function (data, res) {
                        });
                    }
                }
                resolve(dataproc_det)
            }
            else {
                dataproc_det.D2 = "Not Found"
                resolve(dataproc_det)
            }
        }
        catch (e) {
            dataproc_det.D2 = "Error"
            resolve(dataproc_det)
        }
    })
}

module.exports = { calltwoFunction: calltwoFunction }