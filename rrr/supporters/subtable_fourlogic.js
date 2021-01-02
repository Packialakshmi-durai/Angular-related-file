var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');
const JsonFind = require('json-find');

function callfourFunction(AccessToken, i, dataproc_data, ipAddr, dataproc_det, meter_id) {

    return new Promise(async function (resolve, reject) {

        try {

            var meter_rtc = dataproc_data[i]['meter_rtc']
            var hierarchy_code = dataproc_data[i]['hierarchy_code']
            var meter_ip = dataproc_data[i]['meter_ip']

            if (meter_ip != null && meter_ip != undefined) {

                var d4_to_date = moment(meter_rtc, 'DD-MM-YYYY HH:mm:ss').subtract(1, 'days').format('DD-MM-YYYY') + " 23:59:59"
                var d4_to = moment(d4_to_date, "DD-MM-YYYY HH:mm:ss").toISOString()

                if (meter_ip == "1440")
                    var d4_from_date = moment(d4_to_date, 'DD-MM-YYYY HH:mm:ss').subtract(40, 'days').format('DD-MM-YYYY') + " 00:00:00"
                else
                    var d4_from_date = moment(d4_to_date, 'DD-MM-YYYY HH:mm:ss').subtract(40, 'days').format('DD-MM-YYYY') + " 00:" + meter_ip + ":00"

                var d4_from = moment(d4_from_date, "DD-MM-YYYY HH:mm:ss").toISOString()

                await client.get(ipAddr + "/api/d4s?access_token=" + AccessToken + "&filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][and][0][date_obj][gte]=" + d4_from + "&filter[where][and][1][date_obj][lte]=" + d4_to + "&filter[order]=date_obj ASC", async function (d4_data, d4_response, d4_err) {

                    await client.get(ipAddr + "/api/meters?access_token=" + AccessToken + "&filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][meter_status]=1", async function (meter_data, meter_response, meter_err) {

                        var cd = ""
                        var bill_mf = 1

                        if (meter_data.length != 0) {
                            if (meter_data[0]['contract_demand'] != null)
                                cd = parseFloat(meter_data[0]['contract_demand'])
                            if (meter_data[0]['bill_mf'] != null)
                                bill_mf = parseFloat(meter_data[0]['bill_mf'])
                        }

                        if (d4_data.length > 1) {
                            var kwh = []
                            var kvah = []
                            var vr = []
                            var vy = []
                            var vb = []
                            var v_av = []
                            var cr = []
                            var cy = []
                            var cb = []
                            var c_av = []
                            var unique_date = []

                            //Decide the demand factor based on meter_ip
                            if (meter_ip == "30") {

                                var time_mapping = {
                                    '00:00:00': 48, '00:30:00': 1, '01:00:00': 2, '01:30:00': 3, '02:00:00': 4,
                                    '02:30:00': 5, '03:00:00': 6, '03:30:00': 7, '04:00:00': 8, '04:30:00': 9,
                                    '05:00:00': 10, '05:30:00': 11, '06:00:00': 12, '06:30:00': 13, '07:00:00': 14,
                                    '07:30:00': 15, '08:00:00': 16, '08:30:00': 17, '09:00:00': 18, '09:30:00': 19,
                                    '10:00:00': 20, '10:30:00': 21, '11:00:00': 22, '11:30:00': 23, '12:00:00': 24,
                                    '12:30:00': 25, '13:00:00': 26, '13:30:00': 27, '14:00:00': 28, '14:30:00': 29,
                                    '15:00:00': 30, '15:30:00': 31, '16:00:00': 32, '16:30:00': 33, '17:00:00': 34,
                                    '17:30:00': 35, '18:00:00': 36, '18:30:00': 37, '19:00:00': 38, '19:30:00': 39,
                                    '20:00:00': 40, '20:30:00': 41, '21:00:00': 42, '21:30:00': 43, '22:00:00': 44,
                                    '22:30:00': 45, '23:00:00': 46, '23:30:00': 47
                                }

                                var multiply = 2
                            }
                            if (meter_ip == "15") {

                                var time_mapping = {
                                    '00:00:00': 96, '00:15:00': 1, '00:30:00': 2, '00:45:00': 3, '01:00:00': 4,
                                    '01:15:00': 5, '01:30:00': 6, '01:45:00': 7, '02:00:00': 8,
                                    '02:15:00': 9, '02:30:00': 10, '02:45:00': 11, '03:00:00': 12,
                                    '03:15:00': 13, '03:30:00': 14, '03:45:00': 15, '04:00:00': 16,
                                    '04:15:00': 17, '04:30:00': 18, '04:45:00': 19, '05:00:00': 20,
                                    '05:15:00': 21, '05:30:00': 22, '05:45:00': 23, '06:00:00': 24,
                                    '06:15:00': 25, '06:30:00': 26, '06:45:00': 27, '07:00:00': 28,
                                    '07:15:00': 29, '07:30:00': 30, '07:45:00': 31, '08:00:00': 32,
                                    '08:15:00': 33, '08:30:00': 34, '08:45:00': 35, '09:00:00': 36,
                                    '09:15:00': 37, '09:30:00': 38, '09:45:00': 39, '10:00:00': 40,
                                    '10:15:00': 41, '10:30:00': 42, '10:45:00': 43, '11:00:00': 44,
                                    '11:15:00': 45, '11:30:00': 46, '11:45:00': 47, '12:00:00': 48,
                                    '12:15:00': 49, '12:30:00': 50, '12:45:00': 51, '13:00:00': 52,
                                    '13:15:00': 53, '13:30:00': 54, '13:45:00': 55, '14:00:00': 56,
                                    '14:15:00': 57, '14:30:00': 58, '14:45:00': 59, '15:00:00': 60,
                                    '15:15:00': 61, '15:30:00': 62, '15:45:00': 63, '16:00:00': 64,
                                    '16:15:00': 65, '16:30:00': 66, '16:45:00': 67, '17:00:00': 68,
                                    '17:15:00': 69, '17:30:00': 70, '17:45:00': 71, '18:00:00': 72,
                                    '18:15:00': 73, '18:30:00': 74, '18:45:00': 75, '19:00:00': 76,
                                    '19:15:00': 77, '19:30:00': 78, '19:45:00': 79, '20:00:00': 80,
                                    '20:15:00': 81, '20:30:00': 82, '20:45:00': 83, '21:00:00': 84,
                                    '21:15:00': 85, '21:30:00': 86, '21:45:00': 87, '22:00:00': 88,
                                    '22:15:00': 89, '22:30:00': 90, '22:45:00': 91, '23:00:00': 92,
                                    '23:15:00': 93, '23:30:00': 94, '23:45:00': 95
                                }

                                var multiply = 4
                            }
                            if (meter_ip == "1440") {

                                var time_mapping = { '00:00:00': 1 }
                                var division = 24
                            }

                            var time_mapping_string = JSON.stringify(time_mapping);
                            var time_map = JSON.parse(time_mapping_string);

                            for (var r = 0; r < d4_data.length; r++) {
                                var doc = JsonFind(d4_data[r]);
                                unique_date.push(d4_data[r]['date_time'].split(" ")[0])

                                if (doc.checkKey('kwh') != null && doc.checkKey('kwh') != "") {
                                    if (meter_ip == "1440") {
                                        kwh.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('kwh') * bill_mf, doc.checkKey('kwh') * bill_mf, ((doc.checkKey('kwh') * bill_mf) / division), time_map[(doc.date_time).split(" ")[1]]])
                                    }
                                    else {
                                        if ((doc.date_time).split(" ")[1] == "00:00:00") {
                                            kwh.push([moment((doc.date_time).split(" ")[0], "DD-MM-YYYY").subtract(1, 'days').format("DD-MM-YYYY"), "23:59:59", doc.checkKey('kwh') * bill_mf, doc.checkKey('kwh') * bill_mf, ((doc.checkKey('kwh') * bill_mf) * multiply), time_map[(doc.date_time).split(" ")[1]]])
                                        }
                                        else {
                                            kwh.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('kwh') * bill_mf, doc.checkKey('kwh') * bill_mf, ((doc.checkKey('kwh') * bill_mf) * multiply), time_map[(doc.date_time).split(" ")[1]]])
                                        }
                                    }
                                }
                                else {
                                    kwh.push("-")
                                }
                                if (doc.checkKey('kvah') != null && doc.checkKey('kvah') != "") {
                                    if (meter_ip == "1440") {
                                        kvah.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('kvah') * bill_mf, doc.checkKey('kvah') * bill_mf, ((doc.checkKey('kvah') * bill_mf) / division), time_map[(doc.date_time).split(" ")[1]]])
                                    }
                                    else {
                                        if ((doc.date_time).split(" ")[1] == "00:00:00") {
                                            kvah.push([moment((doc.date_time).split(" ")[0], "DD-MM-YYYY").subtract(1, 'days').format("DD-MM-YYYY"), "23:59:59", doc.checkKey('kvah') * bill_mf, doc.checkKey('kvah') * bill_mf, ((doc.checkKey('kvah') * bill_mf) * multiply), time_map[(doc.date_time).split(" ")[1]]])
                                        }
                                        else {
                                            kvah.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('kvah') * bill_mf, doc.checkKey('kvah') * bill_mf, ((doc.checkKey('kvah') * bill_mf) * multiply), time_map[(doc.date_time).split(" ")[1]]])
                                        }
                                    }
                                }
                                else {
                                    kvah.push("-")
                                }
                                if (doc.checkKey('vr') != null && doc.checkKey('vr') != "") {
                                    if (meter_ip == "1440") {
                                        vr.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('vr')])
                                    }
                                    else {
                                        if ((doc.date_time).split(" ")[1] == "00:00:00") {
                                            vr.push([moment((doc.date_time).split(" ")[0], "DD-MM-YYYY").subtract(1, 'days').format("DD-MM-YYYY"), "23:59:59", doc.checkKey('vr')])
                                        }
                                        else {
                                            vr.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('vr')])
                                        }
                                    }
                                }
                                else {
                                    vr.push("-")
                                }
                                if (doc.checkKey('vy') != null && doc.checkKey('vy') != "") {
                                    if (meter_ip == "1440") {
                                        vy.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('vy')])
                                    }
                                    else {
                                        if ((doc.date_time).split(" ")[1] == "00:00:00") {
                                            vy.push([moment((doc.date_time).split(" ")[0], "DD-MM-YYYY").subtract(1, 'days').format("DD-MM-YYYY"), "23:59:59", doc.checkKey('vy')])
                                        }
                                        else {
                                            vy.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('vy')])
                                        }
                                    }
                                }
                                else {
                                    vy.push("-")
                                }
                                if (doc.checkKey('vb') != null && doc.checkKey('vb') != "") {
                                    if (meter_ip == "1440") {
                                        vb.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('vb')])
                                    }
                                    else {
                                        if ((doc.date_time).split(" ")[1] == "00:00:00") {
                                            vb.push([moment((doc.date_time).split(" ")[0], "DD-MM-YYYY").subtract(1, 'days').format("DD-MM-YYYY"), "23:59:59", doc.checkKey('vb')])
                                        }
                                        else {
                                            vb.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('vb')])
                                        }
                                    }
                                }
                                else {
                                    vb.push("-")
                                }
                                if (doc.checkKey('v_av') != null && doc.checkKey('v_av') != "") {
                                    if (meter_ip == "1440") {
                                        v_av.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('v_av')])
                                    }
                                    else {
                                        if ((doc.date_time).split(" ")[1] == "00:00:00") {
                                            v_av.push([moment((doc.date_time).split(" ")[0], "DD-MM-YYYY").subtract(1, 'days').format("DD-MM-YYYY"), "23:59:59", doc.checkKey('v_av')])
                                        }
                                        else {
                                            v_av.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('v_av')])
                                        }
                                    }
                                }
                                else {
                                    v_av.push("-")
                                }
                                if (doc.checkKey('cr') != null && doc.checkKey('cr') != "") {
                                    if (meter_ip == "1440") {
                                        cr.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('cr')])
                                    }
                                    else {
                                        if ((doc.date_time).split(" ")[1] == "00:00:00") {
                                            cr.push([moment((doc.date_time).split(" ")[0], "DD-MM-YYYY").subtract(1, 'days').format("DD-MM-YYYY"), "23:59:59", doc.checkKey('cr')])
                                        }
                                        else {
                                            cr.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('cr')])
                                        }
                                    }
                                }
                                else {
                                    cr.push("-")
                                }
                                if (doc.checkKey('cy') != null && doc.checkKey('cy') != "") {
                                    if (meter_ip == "1440") {
                                        cy.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('cy')])
                                    }
                                    else {
                                        if ((doc.date_time).split(" ")[1] == "00:00:00") {
                                            cy.push([moment((doc.date_time).split(" ")[0], "DD-MM-YYYY").subtract(1, 'days').format("DD-MM-YYYY"), "23:59:59", doc.checkKey('cy')])
                                        }
                                        else {
                                            cy.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('cy')])
                                        }
                                    }
                                }
                                else {
                                    cy.push("-")
                                }
                                if (doc.checkKey('cb') != null && doc.checkKey('cb') != "") {
                                    if (meter_ip == "1440") {
                                        cb.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('cb')])
                                    }
                                    else {
                                        if ((doc.date_time).split(" ")[1] == "00:00:00") {
                                            cb.push([moment((doc.date_time).split(" ")[0], "DD-MM-YYYY").subtract(1, 'days').format("DD-MM-YYYY"), "23:59:59", doc.checkKey('cb')])
                                        }
                                        else {
                                            cb.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('cb')])
                                        }
                                    }
                                }
                                else {
                                    cb.push("-")
                                }
                                if (doc.checkKey('c_av') != null && doc.checkKey('c_av') != "") {
                                    if (meter_ip == "1440") {
                                        c_av.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('c_av')])
                                    }
                                    else {
                                        if ((doc.date_time).split(" ")[1] == "00:00:00") {
                                            c_av.push([moment((doc.date_time).split(" ")[0], "DD-MM-YYYY").subtract(1, 'days').format("DD-MM-YYYY"), "23:59:59", doc.checkKey('c_av')])
                                        }
                                        else {
                                            c_av.push([(doc.date_time).split(" ")[0], (doc.date_time).split(" ")[1], doc.checkKey('c_av')])
                                        }
                                    }
                                }
                                else {
                                    c_av.push("-")
                                }
                            }

                            if (cd != "" && cd != null) {
                                var cd_20 = (20 / 100) * parseFloat(cd)
                                var cd_40 = (40 / 100) * parseFloat(cd)
                                var cd_80 = (80 / 100) * parseFloat(cd)
                                var cd_100 = (100 / 100) * parseFloat(cd)
                            }

                            //Unique dates array is formed 
                            unique_date_df = [... new Set(unique_date)]

                            var cd_cnt_arry = [];
                            var cd_slot_arry = []
                            var cons_sum_kwh_arry = [];
                            var cons_sum_kvah_arry = [];
                            var datewise_max_arry_kw = [];
                            var datewise_min_arry_kw = [];
                            var datewise_max_arry_kva = [];
                            var datewise_min_arry_kva = [];
                            var noload_arry = [];
                            var blackout_arry = [];
                            var noload_slot_arry = [];
                            var blackout_slot_arry = [];
                            var pf_daily_arry = []
                            var cd_l20_cnt_arry = []
                            var cd_g20_40_cnt_arry = []
                            var cd_g40_80_cnt_arry = []
                            var cd_g80_100_cnt_arry = []
                            var pf_l5_cnt_arry = []
                            var pf_5_7_cnt_arry = []
                            var pf_7_9_cnt_arry = []
                            var pf_g9_cnt_arry = []
                            var tot_slot_arry = []
                            var used_slot_arry = []

                            // unique date loop
                            for (var u_date = 0; u_date < unique_date_df.length; u_date++) {

                                var cd_cnt = 0
                                var cd_slot = []
                                var cons_sum_kwh = 0
                                var cons_sum_kvah = 0
                                var datewise_cons_kw = [];
                                var datewise_cons_kva = [];
                                var noload_cnt = 0
                                var blackout_cnt = 0
                                var noload_slot = []
                                var blackout_slot = []
                                var cd_l20_cnt = 0
                                var cd_g20_40_cnt = 0
                                var cd_g40_80_cnt = 0
                                var cd_g80_100_cnt = 0
                                var pf_l5_cnt = 0
                                var pf_5_7_cnt = 0
                                var pf_7_9_cnt = 0
                                var pf_g9_cnt = 0
                                var tot_slot = 0
                                var used_slot = 0

                                // both kwh & kvah available
                                if (kvah.every(v => v == kvah[0]) != true && kwh.every(v => v == kwh[0]) != true) {
                                    // for kwh length
                                    for (var k = 0; k < kwh.length; k++) {
                                        //loop that filters date that matches the unique date above
                                        if (unique_date_df[u_date] == kwh[k][0]) {
                                            //tot_slot
                                            if (kwh[k] != null) {
                                                tot_slot = tot_slot + 1
                                            }
                                            // cd violation slot count                             )
                                            if (parseFloat(kwh[k][4]) > 0 && parseFloat(kwh[k][4]) > cd) {
                                                cd_cnt = cd_cnt + 1
                                                cd_slot.push(kwh[k][5])
                                            }
                                            // datewise sum_kvah
                                            if (parseFloat(kvah[k][2]) > 0) {
                                                cons_sum_kvah = cons_sum_kvah + parseFloat(kvah[k][2])
                                            }
                                            // datewise sum_kwh
                                            if (parseFloat(kwh[k][2]) > 0) {
                                                //used slot
                                                used_slot = used_slot + 1
                                                cons_sum_kwh = cons_sum_kwh + parseFloat(kwh[k][2])
                                            }
                                            // kw max value
                                            if (parseFloat(kwh[k][4]) > 0) {
                                                datewise_cons_kw.push(parseFloat(kwh[k][4]))
                                            }
                                            // kva max value
                                            if (parseFloat(kvah[k][4]) > 0) {
                                                datewise_cons_kva.push(parseFloat(kvah[k][4]))
                                                // cd calculation
                                                if (parseFloat(kvah[k][4]) < cd_20) {
                                                    cd_l20_cnt = cd_l20_cnt + 1
                                                }
                                                if (parseFloat(kvah[k][4]) >= cd_20 && parseFloat(kvah[k][4]) < cd_40) {
                                                    cd_g20_40_cnt = cd_g20_40_cnt + 1
                                                }
                                                if (parseFloat(kvah[k][4]) >= cd_40 && parseFloat(kvah[k][4]) < cd_80) {
                                                    cd_g40_80_cnt = cd_g40_80_cnt + 1
                                                }
                                                if (parseFloat(kvah[k][4]) >= cd_80 && parseFloat(kvah[k][4]) < cd_100) {
                                                    cd_g80_100_cnt = cd_g80_100_cnt + 1
                                                }
                                            }
                                            // pf calculation
                                            if (parseFloat(kwh[k][2]) > 0 && parseFloat(kvah[k][2]) > 0) {
                                                var pf_temp = (parseFloat(kwh[k][2]) / parseFloat(kvah[k][2]))
                                                if (pf_temp < 0.5) {
                                                    pf_l5_cnt = pf_l5_cnt + 1
                                                }
                                                if (pf_temp >= 0.5 && pf_temp < 0.7) {
                                                    pf_5_7_cnt = pf_5_7_cnt + 1
                                                }
                                                if (pf_temp >= 0.7 && pf_temp < 0.9) {
                                                    pf_7_9_cnt = pf_7_9_cnt + 1
                                                }
                                                if (pf_temp >= 0.9) {
                                                    pf_g9_cnt = pf_g9_cnt + 1
                                                }
                                            }
                                            //noload logic
                                            if (vr.every(v => v == vr[0]) != true && vy.every(v => v == vy[0]) != true && vb.every(v => v == vb[0]) != true) {
                                                if (cr.every(v => v == cr[0]) != true && cy.every(v => v == cy[0]) != true && cb.every(v => v == cb[0]) != true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(vr[k][2]) != 0 || parseFloat(vy[k][2]) != 0 || parseFloat(vb[k][2]) != 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                                if (c_av.every(v => v == c_av[0]) != true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(vr[k][2]) != 0 || parseFloat(vy[k][2]) != 0 || parseFloat(vb[k][2]) != 0) && (parseFloat(c_av[k][2]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                                if (cr.every(v => v == cr[0]) == true && cy.every(v => v == cy[0]) == true && cb.every(v => v == cb[0]) == true && c_av.every(v => v == c_av[0]) == true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(vr[k][2]) != 0 || parseFloat(vy[k][2]) != 0 || parseFloat(vb[k][2]) != 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                            }

                                            if (v_av.every(v => v == v_av[0]) != true) {
                                                if (cr.every(v => v == cr[0]) != true && cy.every(v => v == cy[0]) != true && cb.every(v => v == cb[0]) != true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(v_av[k][2]) != 0) && (parseFloat(cr[k][2]) == 0 && parseFloat(cy[k][2]) == 0 && parseFloat(cb[k][2]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                                if (c_av.every(v => v == c_av[0]) != true) {
                                                    if ((parseFloat(kwh[k][4]) == 0) && (parseFloat(v_av[k][1]) != 0) && (parseFloat(c_av[k][1]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                                if (cr.every(v => v == cr[0]) == true && cy.every(v => v == cy[0]) == true && cb.every(v => v == cb[0]) == true && c_av.every(v => v == c_av[0]) == true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(v_av[k][2]) != 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                            }

                                            if (vr.every(v => v == vr[0]) == true && vy.every(v => v == vy[0]) == true && vb.every(v => v == vb[0]) == true && v_av.every(v => v == v_av[0]) == true) {
                                                if (cr.every(v => v == cr[0]) != true && cy.every(v => v == cy[0]) != true && cb.every(v => v == cb[0]) != true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(cr[k][2]) == 0 && parseFloat(cy[k][2]) == 0 && parseFloat(cb[k][2]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                                if (c_av.every(v => v == c_av[0]) != true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (c_av[k][2] == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                            }

                                            if (vr.every(v => v == vr[0]) == true && vy.every(v => v == vy[0]) == true && vb.every(v => v == vb[0]) == true && v_av.every(v => v == v_av[0]) == true && cr.every(v => v == cr[0]) == true && cy.every(v => v == cy[0]) == true && cb.every(v => v == cb[0]) == true && c_av.every(v => v == c_av[0]) == true) {
                                                if (parseFloat(kwh[k][3]) == 0) {
                                                    noload_cnt = noload_cnt + 1
                                                    noload_slot.push(kwh[k][5])
                                                }
                                            }

                                            // monthly blackout slot
                                            if (vr.every(v => v == vr[0]) != true && vy.every(v => v == vy[0]) != true && vb.every(v => v == vb[0]) != true) {
                                                if (((parseFloat(kwh[k][3]) == 0) && (parseFloat(vr[k][2]) == 0 && parseFloat(vb[k][2]) == 0 && parseFloat(vb[k][2]) == 0)) || (parseFloat(kwh[k][3]) < 0)) {
                                                    blackout_cnt = blackout_cnt + 1
                                                    blackout_slot.push(kwh[k][5])
                                                }
                                            }
                                            if (v_av.every(v => v == v_av[0]) != true) {
                                                if (parseFloat(kwh[k][3]) == 0 && parseFloat(v_av[k][2]) == 0) {
                                                    blackout_cnt = blackout_cnt + 1
                                                    blackout_slot.push(kwh[k][5])
                                                }
                                            }
                                            if (vr.every(v => v == vr[0]) == true && vy.every(v => v == vy[0]) == true && vb.every(v => v == vb[0]) == true && v_av.every(v => v == v_av[0]) == true) {
                                                if (parseFloat(kwh[k][3]) < 0) {
                                                    blackout_cnt = blackout_cnt + 1
                                                    blackout_slot.push(kwh[k][5])
                                                }
                                            }
                                        }
                                    }
                                    //form array for storing datewise calculations
                                    tot_slot_arry.push(tot_slot)
                                    used_slot_arry.push(used_slot)
                                    //cd calc
                                    cd_l20_cnt_arry.push(cd_l20_cnt)
                                    cd_g20_40_cnt_arry.push(cd_g20_40_cnt)
                                    cd_g40_80_cnt_arry.push(cd_g40_80_cnt)
                                    cd_g80_100_cnt_arry.push(cd_g80_100_cnt)
                                    //pf calc
                                    pf_l5_cnt_arry.push(pf_l5_cnt)
                                    pf_5_7_cnt_arry.push(pf_5_7_cnt)
                                    pf_7_9_cnt_arry.push(pf_7_9_cnt)
                                    pf_g9_cnt_arry.push(pf_g9_cnt)

                                    cd_cnt_arry.push(cd_cnt)
                                    cd_slot.sort(function (a, b) { return a - b });

                                    const cd_slot_result = cd_slot.reduce((r, n) => {
                                        const lastSubArray = r[r.length - 1];

                                        if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
                                            r.push([]);
                                        }
                                        r[r.length - 1].push(n);
                                        return r;

                                    }, []);

                                    var cd_slotwise = ""
                                    for (var i = 0; i < cd_slot_result.length; i++) {
                                        if (cd_slot_result[i].length > 1) {
                                            cd_slotwise = cd_slotwise + (cd_slot_result[i][0] + "-" + cd_slot_result[i][cd_slot_result[i].length - 1]) + ","
                                        }
                                        else {
                                            cd_slotwise = cd_slotwise + (cd_slot_result[i][0]) + ",";
                                        }
                                    }

                                    cd_slot_arry.push(cd_slotwise.substring(0, cd_slotwise.length - 1))

                                    cons_sum_kwh_arry.push(parseFloat(cons_sum_kwh))
                                    cons_sum_kvah_arry.push(parseFloat(cons_sum_kvah))
                                    if (parseFloat(cons_sum_kvah) != 0 && parseFloat(cons_sum_kwh) != 0) {
                                        pf_daily_arry.push(parseFloat(cons_sum_kwh) / parseFloat(cons_sum_kvah))
                                    }
                                    else {
                                        pf_daily_arry.push("-")
                                    }
                                    if (datewise_cons_kw.length != 0) {
                                        datewise_max_arry_kw.push(parseFloat(Math.max(...datewise_cons_kw)))
                                        datewise_min_arry_kw.push(parseFloat(Math.min(...datewise_cons_kw)))
                                    }
                                    else {
                                        datewise_max_arry_kw.push("-")
                                        datewise_min_arry_kw.push("-")
                                    }
                                    if (datewise_cons_kva.length != 0) {
                                        datewise_max_arry_kva.push(parseFloat(Math.max(...datewise_cons_kva)))
                                        datewise_min_arry_kva.push(parseFloat(Math.min(...datewise_cons_kva)))
                                    }
                                    else {
                                        datewise_max_arry_kva.push("-")
                                        datewise_min_arry_kva.push("-")
                                    }

                                    noload_slot.sort(function (a, b) { return a - b });

                                    const noload_slot_result = noload_slot.reduce((r, n) => {
                                        const lastSubArray = r[r.length - 1];

                                        if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
                                            r.push([]);
                                        }
                                        r[r.length - 1].push(n);
                                        return r;

                                    }, []);

                                    var nl_slot = ""
                                    for (var i = 0; i < noload_slot_result.length; i++) {
                                        if (noload_slot_result[i].length > 1) {
                                            nl_slot = nl_slot + (noload_slot_result[i][0] + "-" + noload_slot_result[i][noload_slot_result[i].length - 1]) + ","
                                        }
                                        else {
                                            nl_slot = nl_slot + (noload_slot_result[i][0]) + ",";
                                        }
                                    }

                                    blackout_slot.sort(function (a, b) { return a - b });

                                    const blackout_slot_result = blackout_slot.reduce((r1, n1) => {
                                        const lastSubArray = r1[r1.length - 1];

                                        if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n1 - 1) {
                                            r1.push([]);
                                        }
                                        r1[r1.length - 1].push(n1);
                                        return r1;

                                    }, []);

                                    var blackout_slot = ""
                                    for (var j = 0; j < blackout_slot_result.length; j++) {
                                        if (blackout_slot_result[j].length > 1) {
                                            blackout_slot = blackout_slot + (blackout_slot_result[j][0] + "-" + blackout_slot_result[j][blackout_slot_result[j].length - 1]) + ","
                                        }
                                        else {
                                            blackout_slot = blackout_slot + (blackout_slot_result[j][0]) + ",";
                                        }
                                    }
                                    // daily noload, blackout calculations
                                    noload_arry.push(noload_cnt)
                                    blackout_arry.push(blackout_cnt)
                                    noload_slot_arry.push(nl_slot.substring(0, nl_slot.length - 1))
                                    blackout_slot_arry.push(blackout_slot.substring(0, blackout_slot.length - 1))
                                }
                                // only kwh available
                                else if (kvah.every(v => v == kvah[0]) == true && kwh.every(v => v == kwh[0]) != true) {
                                    // for kwh length
                                    for (var k = 0; k < kwh.length; k++) {
                                        //loop that filters date that matches the unique date above
                                        if (unique_date_df[u_date] == kwh[k][0]) {
                                            //tot_slot
                                            if (kwh[k] != null) {
                                                tot_slot = tot_slot + 1
                                            }
                                            // cd violation slot count                                  
                                            if (parseFloat(kwh[k][4]) > 0 && parseFloat(kwh[k][4]) > cd) {
                                                cd_cnt = cd_cnt + 1
                                                cd_slot.push(kwh[k][5])
                                            }
                                            // datewise sum_kwh
                                            if (parseFloat(kwh[k][2]) > 0) {
                                                //used slot
                                                used_slot = used_slot + 1
                                                cons_sum_kwh = cons_sum_kwh + parseFloat(kwh[k][2])
                                            }
                                            // kw max value
                                            if (parseFloat(kwh[k][4]) > 0) {
                                                datewise_cons_kw.push(parseFloat(kwh[k][4]))
                                                // cd calculation
                                                if (parseFloat(kwh[k][4]) < cd_20) {
                                                    cd_l20_cnt = cd_l20_cnt + 1
                                                }
                                                if (parseFloat(kwh[k][4]) >= cd_20 && parseFloat(kwh[k][4]) < cd_40) {
                                                    cd_g20_40_cnt = cd_g20_40_cnt + 1
                                                }
                                                if (parseFloat(kwh[k][4]) >= cd_40 && parseFloat(kwh[k][4]) < cd_80) {
                                                    cd_g40_80_cnt = cd_g40_80_cnt + 1
                                                }
                                                if (parseFloat(kwh[k][4]) >= cd_80 && parseFloat(kwh[k][4]) < cd_100) {
                                                    cd_g80_100_cnt = cd_g80_100_cnt + 1
                                                }
                                            }
                                            //noload logic
                                            if (vr.every(v => v == vr[0]) != true && vy.every(v => v == vy[0]) != true && vb.every(v => v == vb[0]) != true) {
                                                if (cr.every(v => v == cr[0]) != true && cy.every(v => v == cy[0]) != true && cb.every(v => v == cb[0]) != true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(vr[k][2]) != 0 || parseFloat(vy[k][2]) != 0 || parseFloat(vb[k][2]) != 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                                if (c_av.every(v => v == c_av[0]) != true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(vr[k][2]) != 0 || parseFloat(vy[k][2]) != 0 || parseFloat(vb[k][2]) != 0) && (parseFloat(c_av[k][2]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                                if (cr.every(v => v == cr[0]) == true && cy.every(v => v == cy[0]) == true && cb.every(v => v == cb[0]) == true && c_av.every(v => v == c_av[0]) == true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(vr[k][2]) != 0 || parseFloat(vy[k][2]) != 0 || parseFloat(vb[k][2]) != 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                            }

                                            if (v_av.every(v => v == v_av[0]) != true) {
                                                if (cr.every(v => v == cr[0]) != true && cy.every(v => v == cy[0]) != true && cb.every(v => v == cb[0]) != true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(v_av[k][2]) != 0) && (parseFloat(cr[k][2]) == 0 && parseFloat(cy[k][2]) == 0 && parseFloat(cb[k][2]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                                if (c_av.every(v => v == c_av[0]) != true) {
                                                    if ((parseFloat(kwh[k][4]) == 0) && (parseFloat(v_av[k][1]) != 0) && (parseFloat(c_av[k][1]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                                if (cr.every(v => v == cr[0]) == true && cy.every(v => v == cy[0]) == true && cb.every(v => v == cb[0]) == true && c_av.every(v => v == c_av[0]) == true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(v_av[k][2]) != 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                            }

                                            if (vr.every(v => v == vr[0]) == true && vy.every(v => v == vy[0]) == true && vb.every(v => v == vb[0]) == true && v_av.every(v => v == v_av[0]) == true) {
                                                if (cr.every(v => v == cr[0]) != true && cy.every(v => v == cy[0]) != true && cb.every(v => v == cb[0]) != true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (parseFloat(cr[k][2]) == 0 && parseFloat(cy[k][2]) == 0 && parseFloat(cb[k][2]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                                if (c_av.every(v => v == c_av[0]) != true) {
                                                    if ((parseFloat(kwh[k][3]) == 0) && (c_av[k][2] == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kwh[k][5])
                                                    }
                                                }
                                            }

                                            if (vr.every(v => v == vr[0]) == true && vy.every(v => v == vy[0]) == true && vb.every(v => v == vb[0]) == true && v_av.every(v => v == v_av[0]) == true && cr.every(v => v == cr[0]) == true && cy.every(v => v == cy[0]) == true && cb.every(v => v == cb[0]) == true && c_av.every(v => v == c_av[0]) == true) {
                                                if (parseFloat(kwh[k][3]) == 0) {
                                                    noload_cnt = noload_cnt + 1
                                                    noload_slot.push(kwh[k][5])
                                                }
                                            }

                                            // monthly blackout slot
                                            if (vr.every(v => v == vr[0]) != true && vy.every(v => v == vy[0]) != true && vb.every(v => v == vb[0]) != true) {
                                                if (((parseFloat(kwh[k][3]) == 0) && (parseFloat(vr[k][2]) == 0 && parseFloat(vb[k][2]) == 0 && parseFloat(vb[k][2]) == 0)) || (parseFloat(kwh[k][3]) < 0)) {
                                                    blackout_cnt = blackout_cnt + 1
                                                    blackout_slot.push(kwh[k][5])
                                                }
                                            }
                                            if (v_av.every(v => v == v_av[0]) != true) {
                                                if (parseFloat(kwh[k][3]) == 0 && parseFloat(v_av[k][2]) == 0) {
                                                    blackout_cnt = blackout_cnt + 1
                                                    blackout_slot.push(kwh[k][5])
                                                }
                                            }
                                            if (vr.every(v => v == vr[0]) == true && vy.every(v => v == vy[0]) == true && vb.every(v => v == vb[0]) == true && v_av.every(v => v == v_av[0]) == true) {
                                                if (parseFloat(kwh[k][3]) < 0) {
                                                    blackout_cnt = blackout_cnt + 1
                                                    blackout_slot.push(kwh[k][5])
                                                }
                                            }
                                        }
                                    }
                                    //form array for storing datewise calculations
                                    tot_slot_arry.push(tot_slot)
                                    used_slot_arry.push(used_slot)
                                    //cd calc
                                    cd_l20_cnt_arry.push(cd_l20_cnt)
                                    cd_g20_40_cnt_arry.push(cd_g20_40_cnt)
                                    cd_g40_80_cnt_arry.push(cd_g40_80_cnt)
                                    cd_g80_100_cnt_arry.push(cd_g80_100_cnt)
                                    //pf calc
                                    pf_l5_cnt_arry.push("-")
                                    pf_5_7_cnt_arry.push("-")
                                    pf_7_9_cnt_arry.push("-")
                                    pf_g9_cnt_arry.push("-")

                                    cd_cnt_arry.push(cd_cnt)
                                    cd_slot.sort(function (a, b) { return a - b });

                                    const cd_slot_result = cd_slot.reduce((r, n) => {
                                        const lastSubArray = r[r.length - 1];

                                        if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
                                            r.push([]);
                                        }
                                        r[r.length - 1].push(n);
                                        return r;

                                    }, []);

                                    var cd_slotwise = ""
                                    for (var i = 0; i < cd_slot_result.length; i++) {
                                        if (cd_slot_result[i].length > 1) {
                                            cd_slotwise = cd_slotwise + (cd_slot_result[i][0] + "-" + cd_slot_result[i][cd_slot_result[i].length - 1]) + ","
                                        }
                                        else {
                                            cd_slotwise = cd_slotwise + (cd_slot_result[i][0]) + ",";
                                        }
                                    }

                                    cd_slot_arry.push(cd_slotwise.substring(0, cd_slotwise.length - 1))

                                    cons_sum_kwh_arry.push(parseFloat(cons_sum_kwh))
                                    cons_sum_kvah_arry.push("-")
                                    pf_daily_arry.push("-")
                                    if (datewise_cons_kw.length != 0) {
                                        datewise_max_arry_kw.push(parseFloat(Math.max(...datewise_cons_kw)))
                                        datewise_min_arry_kw.push(parseFloat(Math.min(...datewise_cons_kw)))
                                    }
                                    else {
                                        datewise_max_arry_kw.push("-")
                                        datewise_min_arry_kw.push("-")
                                    }
                                    datewise_max_arry_kva.push("-")
                                    datewise_min_arry_kva.push("-")

                                    noload_slot.sort(function (a, b) { return a - b });

                                    const noload_slot_result = noload_slot.reduce((r, n) => {
                                        const lastSubArray = r[r.length - 1];

                                        if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
                                            r.push([]);
                                        }
                                        r[r.length - 1].push(n);
                                        return r;

                                    }, []);

                                    var nl_slot = ""
                                    for (var i = 0; i < noload_slot_result.length; i++) {
                                        if (noload_slot_result[i].length > 1) {
                                            nl_slot = nl_slot + (noload_slot_result[i][0] + "-" + noload_slot_result[i][noload_slot_result[i].length - 1]) + ","
                                        }
                                        else {
                                            nl_slot = nl_slot + (noload_slot_result[i][0]) + ",";
                                        }
                                    }

                                    blackout_slot.sort(function (a, b) { return a - b });

                                    const blackout_slot_result = blackout_slot.reduce((r1, n1) => {
                                        const lastSubArray = r1[r1.length - 1];

                                        if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n1 - 1) {
                                            r1.push([]);
                                        }
                                        r1[r1.length - 1].push(n1);
                                        return r1;

                                    }, []);

                                    var blackout_slot = ""
                                    for (var j = 0; j < blackout_slot_result.length; j++) {
                                        if (blackout_slot_result[j].length > 1) {
                                            blackout_slot = blackout_slot + (blackout_slot_result[j][0] + "-" + blackout_slot_result[j][blackout_slot_result[j].length - 1]) + ","
                                        }
                                        else {
                                            blackout_slot = blackout_slot + (blackout_slot_result[j][0]) + ",";
                                        }
                                    }
                                    // daily noload, blackout calculations
                                    noload_arry.push(noload_cnt)
                                    blackout_arry.push(blackout_cnt)
                                    noload_slot_arry.push(nl_slot.substring(0, nl_slot.length - 1))
                                    blackout_slot_arry.push(blackout_slot.substring(0, blackout_slot.length - 1))
                                }
                                // only kvah available   
                                else if (kvah.every(v => v == kvah[0]) != true && kwh.every(v => v == kwh[0]) == true) {
                                    // for kvah length
                                    for (var k = 0; k < kvah.length; k++) {
                                        //loop that filters date that matches the unique date above
                                        if (unique_date_df[u_date] == kvah[k][0]) {
                                            //tot_slot
                                            if (kvah[k] != null) {
                                                tot_slot = tot_slot + 1
                                            }
                                            // cd violation slot count                                  
                                            if (parseFloat(kvah[k][4]) > 0 && parseFloat(kvah[k][4]) > cd) {
                                                cd_cnt = cd_cnt + 1
                                                cd_slot.push(kvah[k][5])
                                            }
                                            // datewise sum_kvah
                                            if (parseFloat(kvah[k][2]) > 0) {
                                                //used slot
                                                used_slot = used_slot + 1
                                                cons_sum_kvah = cons_sum_kvah + parseFloat(kvah[k][2])
                                            }
                                            // kva max value
                                            if (parseFloat(kvah[k][4]) > 0) {
                                                datewise_cons_kva.push(parseFloat(kvah[k][4]))
                                                // cd calculation
                                                if (parseFloat(kvah[k][4]) < cd_20) {
                                                    cd_l20_cnt = cd_l20_cnt + 1
                                                }
                                                if (parseFloat(kvah[k][4]) >= cd_20 && parseFloat(kvah[k][4]) < cd_40) {
                                                    cd_g20_40_cnt = cd_g20_40_cnt + 1
                                                }
                                                if (parseFloat(kvah[k][4]) >= cd_40 && parseFloat(kvah[k][4]) < cd_80) {
                                                    cd_g40_80_cnt = cd_g40_80_cnt + 1
                                                }
                                                if (parseFloat(kvah[k][4]) >= cd_80 && parseFloat(kvah[k][4]) < cd_100) {
                                                    cd_g80_100_cnt = cd_g80_100_cnt + 1
                                                }
                                            }
                                            //noload logic
                                            if (vr.every(v => v == vr[0]) != true && vy.every(v => v == vy[0]) != true && vb.every(v => v == vb[0]) != true) {
                                                if (cr.every(v => v == cr[0]) != true && cy.every(v => v == cy[0]) != true && cb.every(v => v == cb[0]) != true) {
                                                    if ((parseFloat(kvah[k][3]) == 0) && (parseFloat(vr[k][2]) != 0 || parseFloat(vy[k][2]) != 0 || parseFloat(vb[k][2]) != 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kvah[k][5])
                                                    }
                                                }
                                                if (c_av.every(v => v == c_av[0]) != true) {
                                                    if ((parseFloat(kvah[k][3]) == 0) && (parseFloat(vr[k][2]) != 0 || parseFloat(vy[k][2]) != 0 || parseFloat(vb[k][2]) != 0) && (parseFloat(c_av[k][2]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kvah[k][5])
                                                    }
                                                }
                                                if (cr.every(v => v == cr[0]) == true && cy.every(v => v == cy[0]) == true && cb.every(v => v == cb[0]) == true && c_av.every(v => v == c_av[0]) == true) {
                                                    if ((parseFloat(kvah[k][3]) == 0) && (parseFloat(vr[k][2]) != 0 || parseFloat(vy[k][2]) != 0 || parseFloat(vb[k][2]) != 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kvah[k][5])
                                                    }
                                                }
                                            }

                                            if (v_av.every(v => v == v_av[0]) != true) {
                                                if (cr.every(v => v == cr[0]) != true && cy.every(v => v == cy[0]) != true && cb.every(v => v == cb[0]) != true) {
                                                    if ((parseFloat(kvah[k][3]) == 0) && (parseFloat(v_av[k][2]) != 0) && (parseFloat(cr[k][2]) == 0 && parseFloat(cy[k][2]) == 0 && parseFloat(cb[k][2]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kvah[k][5])
                                                    }
                                                }
                                                if (c_av.every(v => v == c_av[0]) != true) {
                                                    if ((parseFloat(kvah[k][4]) == 0) && (parseFloat(v_av[k][1]) != 0) && (parseFloat(c_av[k][1]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kvah[k][5])
                                                    }
                                                }
                                                if (cr.every(v => v == cr[0]) == true && cy.every(v => v == cy[0]) == true && cb.every(v => v == cb[0]) == true && c_av.every(v => v == c_av[0]) == true) {
                                                    if ((parseFloat(kvah[k][3]) == 0) && (parseFloat(v_av[k][2]) != 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kvah[k][5])
                                                    }
                                                }
                                            }

                                            if (vr.every(v => v == vr[0]) == true && vy.every(v => v == vy[0]) == true && vb.every(v => v == vb[0]) == true && v_av.every(v => v == v_av[0]) == true) {
                                                if (cr.every(v => v == cr[0]) != true && cy.every(v => v == cy[0]) != true && cb.every(v => v == cb[0]) != true) {
                                                    if ((parseFloat(kvah[k][3]) == 0) && (parseFloat(cr[k][2]) == 0 && parseFloat(cy[k][2]) == 0 && parseFloat(cb[k][2]) == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kvah[k][5])
                                                    }
                                                }
                                                if (c_av.every(v => v == c_av[0]) != true) {
                                                    if ((parseFloat(kvah[k][3]) == 0) && (c_av[k][2] == 0)) {
                                                        noload_cnt = noload_cnt + 1
                                                        noload_slot.push(kvah[k][5])
                                                    }
                                                }
                                            }

                                            if (vr.every(v => v == vr[0]) == true && vy.every(v => v == vy[0]) == true && vb.every(v => v == vb[0]) == true && v_av.every(v => v == v_av[0]) == true && cr.every(v => v == cr[0]) == true && cy.every(v => v == cy[0]) == true && cb.every(v => v == cb[0]) == true && c_av.every(v => v == c_av[0]) == true) {
                                                if (parseFloat(kvah[k][3]) == 0) {
                                                    noload_cnt = noload_cnt + 1
                                                    noload_slot.push(kvah[k][5])
                                                }
                                            }

                                            // monthly blackout slot
                                            if (vr.every(v => v == vr[0]) != true && vy.every(v => v == vy[0]) != true && vb.every(v => v == vb[0]) != true) {
                                                if (((parseFloat(kvah[k][3]) == 0) && (parseFloat(vr[k][2]) == 0 && parseFloat(vb[k][2]) == 0 && parseFloat(vb[k][2]) == 0)) || (parseFloat(kvah[k][3]) < 0)) {
                                                    blackout_cnt = blackout_cnt + 1
                                                    blackout_slot.push(kvah[k][5])
                                                }
                                            }
                                            if (v_av.every(v => v == v_av[0]) != true) {
                                                if (parseFloat(kvah[k][3]) == 0 && parseFloat(v_av[k][2]) == 0) {
                                                    blackout_cnt = blackout_cnt + 1
                                                    blackout_slot.push(kvah[k][5])
                                                }
                                            }
                                            if (vr.every(v => v == vr[0]) == true && vy.every(v => v == vy[0]) == true && vb.every(v => v == vb[0]) == true && v_av.every(v => v == v_av[0]) == true) {
                                                if (parseFloat(kvah[k][3]) < 0) {
                                                    blackout_cnt = blackout_cnt + 1
                                                    blackout_slot.push(kvah[k][5])
                                                }
                                            }
                                        }
                                    }
                                    //form array for storing datewise calculations
                                    tot_slot_arry.push(tot_slot)
                                    used_slot_arry.push(used_slot)
                                    //cd calc
                                    cd_l20_cnt_arry.push(cd_l20_cnt)
                                    cd_g20_40_cnt_arry.push(cd_g20_40_cnt)
                                    cd_g40_80_cnt_arry.push(cd_g40_80_cnt)
                                    cd_g80_100_cnt_arry.push(cd_g80_100_cnt)
                                    //pf calc
                                    pf_l5_cnt_arry.push("-")
                                    pf_5_7_cnt_arry.push("-")
                                    pf_7_9_cnt_arry.push("-")
                                    pf_g9_cnt_arry.push("-")

                                    cd_cnt_arry.push(cd_cnt)
                                    cd_slot.sort(function (a, b) { return a - b });

                                    const cd_slot_result = cd_slot.reduce((r, n) => {
                                        const lastSubArray = r[r.length - 1];

                                        if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
                                            r.push([]);
                                        }
                                        r[r.length - 1].push(n);
                                        return r;

                                    }, []);

                                    var cd_slotwise = ""
                                    for (var i = 0; i < cd_slot_result.length; i++) {
                                        if (cd_slot_result[i].length > 1) {
                                            cd_slotwise = cd_slotwise + (cd_slot_result[i][0] + "-" + cd_slot_result[i][cd_slot_result[i].length - 1]) + ","
                                        }
                                        else {
                                            cd_slotwise = cd_slotwise + (cd_slot_result[i][0]) + ",";
                                        }
                                    }

                                    cd_slot_arry.push(cd_slotwise.substring(0, cd_slotwise.length - 1))

                                    cons_sum_kvah_arry.push(parseFloat(cons_sum_kvah))
                                    cons_sum_kwh_arry.push("-")
                                    pf_daily_arry.push("-")
                                    if (datewise_cons_kva.length != 0) {
                                        datewise_max_arry_kva.push(parseFloat(Math.max(...datewise_cons_kva)))
                                        datewise_min_arry_kva.push(parseFloat(Math.min(...datewise_cons_kva)))
                                    }
                                    else {
                                        datewise_max_arry_kva.push("-")
                                        datewise_min_arry_kva.push("-")
                                    }
                                    datewise_max_arry_kw.push("-")
                                    datewise_min_arry_kw.push("-")

                                    noload_slot.sort(function (a, b) { return a - b });

                                    const noload_slot_result = noload_slot.reduce((r, n) => {
                                        const lastSubArray = r[r.length - 1];

                                        if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
                                            r.push([]);
                                        }
                                        r[r.length - 1].push(n);
                                        return r;

                                    }, []);

                                    var nl_slot = ""
                                    for (var i = 0; i < noload_slot_result.length; i++) {
                                        if (noload_slot_result[i].length > 1) {
                                            nl_slot = nl_slot + (noload_slot_result[i][0] + "-" + noload_slot_result[i][noload_slot_result[i].length - 1]) + ","
                                        }
                                        else {
                                            nl_slot = nl_slot + (noload_slot_result[i][0]) + ",";
                                        }
                                    }

                                    blackout_slot.sort(function (a, b) { return a - b });

                                    const blackout_slot_result = blackout_slot.reduce((r1, n1) => {
                                        const lastSubArray = r1[r1.length - 1];

                                        if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n1 - 1) {
                                            r1.push([]);
                                        }
                                        r1[r1.length - 1].push(n1);
                                        return r1;

                                    }, []);

                                    var blackout_slot = ""
                                    for (var j = 0; j < blackout_slot_result.length; j++) {
                                        if (blackout_slot_result[j].length > 1) {
                                            blackout_slot = blackout_slot + (blackout_slot_result[j][0] + "-" + blackout_slot_result[j][blackout_slot_result[j].length - 1]) + ","
                                        }
                                        else {
                                            blackout_slot = blackout_slot + (blackout_slot_result[j][0]) + ",";
                                        }
                                    }
                                    // daily noload, blackout calculations
                                    noload_arry.push(noload_cnt)
                                    blackout_arry.push(blackout_cnt)
                                    noload_slot_arry.push(nl_slot.substring(0, nl_slot.length - 1))
                                    blackout_slot_arry.push(blackout_slot.substring(0, blackout_slot.length - 1))
                                }
                            }

                            var fnl_d4_body = []

                            for (var i = 0; i < unique_date_df.length; i++) {

                                fnl_d4_body.push({
                                    "date_obj": moment(unique_date_df[i], "DD-MM-YYYY").toDate(),
                                    "hierarchy_code": hierarchy_code,
                                    "meterId": meter_id,
                                    "date": unique_date_df[i],
                                    "kwh": cons_sum_kwh_arry[i],
                                    "kvah": cons_sum_kvah_arry[i],
                                    "max_kw": datewise_max_arry_kw[i],
                                    "max_kva": datewise_max_arry_kva[i],
                                    "min_kw": datewise_min_arry_kw[i],
                                    "min_kva": datewise_min_arry_kva[i],
                                    "pf": pf_daily_arry[i],
                                    "nl_slot": noload_slot_arry[i],
                                    "nl": noload_arry[i],
                                    "bo_slot": blackout_slot_arry[i],
                                    "bo": blackout_arry[i],
                                    "cd_slot": cd_slot_arry[i],
                                    "cd_cnt": cd_cnt_arry[i],
                                    "demand_l20_cd": cd_l20_cnt_arry[i],
                                    "demand_g20_40_cd": cd_g20_40_cnt_arry[i],
                                    "demand_g40_80_cd": cd_g40_80_cnt_arry[i],
                                    "demand_g80_100_cd": cd_g80_100_cnt_arry[i],
                                    "pf_l5": pf_l5_cnt_arry[i],
                                    "pf_5_7": pf_5_7_cnt_arry[i],
                                    "pf_7_9": pf_7_9_cnt_arry[i],
                                    "pf_g9": pf_g9_cnt_arry[i],
                                    "tot_slots": tot_slot_arry[i],
                                    "used_slots": used_slot_arry[i]
                                })
                            }
                            var args = {
                                data: fnl_d4_body,
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            };
                            push_d4(AccessToken, args, ipAddr, fnl_d4_body)
                            dataproc_det.daily = "Found"
                            resolve(dataproc_det)
                        }
                        else {
                            dataproc_det.daily = "Not Found"
                            resolve(dataproc_det)
                        }
                    })
                })
            }
            else {
                dataproc_det.daily = "Not Found"
                resolve(dataproc_det)
            }
        }
        catch (e) {
            dataproc_det.daily = "Error"
            resolve(dataproc_det)
        }
    })
}

var push_d4 = async function (AccessToken, args, ipAddr, fnl_d4_body) {

    await client.post(ipAddr + "/api/dailies?access_token=" + AccessToken, args, function (data, res) {
    });
}

module.exports = { callfourFunction: callfourFunction };