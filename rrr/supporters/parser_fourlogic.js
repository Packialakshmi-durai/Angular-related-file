var config = require('./config');
var Client = require('node-rest-client').Client;
var client = new Client();
const JsonFind = require('json-find');
var moment = require('moment');

function callfourFunction(doc, Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year, meter_id) {

    return new Promise(async function (resolve, reject) {

        try {

            if (Node1.D4 != undefined && Node1.D4 != '') {

                dataproc_det.D4 = "Found"

                var meter_ip = null
                meter_ip = Node1.D4._INTERVALPERIOD;
                var DayProfile = doc.findValues('DAYPROFILE').DAYPROFILE

                if (Node1.D4._INTERVALPERIOD == 15) {
                    div = 4;
                }
                else if (Node1.D4._INTERVALPERIOD == 30) {
                    div = 2;
                }
                else {
                    div = 1;
                }

                if (DayProfile != undefined) {
                    if (DayProfile.length != undefined) {
                        // --------------- for 1 month 30 days logic ---------------
                        if (Node1.D4.DAYPROFILE.length != undefined) {

                            dataproc_det.D4 = "Found"

                            d4_cnt = Node1.D4.DAYPROFILE.length

                            await d4_calc(DayProfile, Node1.D4.DAYPROFILE, dataproc_det, d4_cnt - 1, ipAddr, AccessToken, hierarchy_code, month_year, meter_id, meter_ip, Node1)
                        }
                    }
                }
                dataproc_det.D4 = "Not Found"
                dataproc_det.meter_ip = meter_ip
                resolve(dataproc_det)
            }
            else {
                dataproc_det.D4 = "Not Found"
                dataproc_det.meter_ip = meter_ip
                resolve(dataproc_det)
            }
        }
        catch (e) {
            dataproc_det.D4 = "Error"
            dataproc_det.meter_ip = meter_ip
            resolve(dataproc_det)
        }
    })
}

var d4_calc = async function (DayProfile, d4_dayprofile, dataproc_det, i, ipAddr, AccessToken, hierarchy_code, month_year, meter_id, meter_ip, Node1) {

    var date = JsonFind(DayProfile[i]).checkKey('_DATE')

    if (moment(date, "DD-MM-YYYY", true).isValid()) {

        var vr = null
        var vy = null
        var vb = null
        var v_av = null
        var ir = null
        var iy = null
        var ib = null
        var i_av = null
        var kwh = null
        var kvah = null
        var kwh_ex = null
        var kvah_ex = null
        var d4_finalformat = []

        if (d4_dayprofile[i].IP != undefined) {
            // ------------------ meter ip 1440  ------------------
            if (d4_dayprofile[i].IP.length == undefined && meter_ip == 1440) {

                var datetime_form = date + " 00:00:00"
                var datetime = moment(datetime_form, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')

                // ------------------ multiple param  ------------------
                if (d4_dayprofile[i].IP.PARAMETER.length != undefined) {

                    // ---------------------- vr calc ----------------------
                    for (d4_con = 0; d4_con < config[0][0].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][0].input_code[d4_con].code)) {
                                vr = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                            }
                        }
                    }
                    // ---------------------- vy calc ----------------------
                    for (d4_con = 0; d4_con < config[0][1].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][1].input_code[d4_con].code)) {
                                vy = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                            }
                        }
                    }
                    // ---------------------- vb calc ----------------------
                    for (d4_con = 0; d4_con < config[0][2].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][2].input_code[d4_con].code)) {
                                vb = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                            }
                        }
                    }
                    // ---------------------- v_av calc ----------------------
                    for (d4_con = 0; d4_con < config[0][3].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][3].input_code[d4_con].code)) {
                                v_av = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                            }
                        }
                    }
                    // ---------------------- ir calc ----------------------
                    for (d4_con = 0; d4_con < config[0][4].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][4].input_code[d4_con].code)) {
                                ir = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                            }
                        }
                    }
                    // ---------------------- iy calc ----------------------
                    for (d4_con = 0; d4_con < config[0][5].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][5].input_code[d4_con].code)) {
                                iy = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                            }
                        }
                    }
                    // ---------------------- ib calc ----------------------
                    for (d4_con = 0; d4_con < config[0][6].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][6].input_code[d4_con].code)) {
                                ib = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                            }
                        }
                    }
                    // ---------------------- i_av calc ----------------------
                    for (d4_con = 0; d4_con < config[0][7].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][7].input_code[d4_con].code)) {
                                i_av = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                            }
                        }
                    }
                    // ---------------------- kwh calc ----------------------
                    for (d4_con = 0; d4_con < config[0][8].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes("P7-4")) {
                                kwh = d4_dayprofile[i].IP.PARAMETER[p]._VALUE / div
                            }
                            else {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][8].input_code[d4_con].code)) {
                                    kwh = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                    }
                    // ---------------------- kvah calc ----------------------
                    for (d4_con = 0; d4_con < config[0][9].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes("P7-6")) {
                                kvah = d4_dayprofile[i].IP.PARAMETER[p]._VALUE / div
                            }
                            else {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][9].input_code[d4_con].code)) {
                                    kvah = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                    }
                    // ---------------------- kwh_ex calc ----------------------
                    for (d4_con = 0; d4_con < config[0][13].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][13].input_code[d4_con].code)) {
                                kwh_ex = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                            }
                        }
                    }
                    // ---------------------- kvah_ex calc ----------------------
                    for (d4_con = 0; d4_con < config[0][14].input_code.length; d4_con++) {
                        for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                            if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][14].input_code[d4_con].code)) {
                                kvah_ex = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                            }
                        }
                    }

                    if (vr == null && vy == null && vb == null && v_av == null && ir == null && iy == null && ib == null && i_av == null && kwh == null && kvah == null && kwh_ex == null && kvah_ex == null) {
                        if (new Date(Node1.D1.G2).getTime() > new Date(datetime).getTime()) {

                            d4_finalformat.push({
                                "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                "date_time": datetime,
                                "month_year": month_year,
                                "hierarchy_code": hierarchy_code,
                                "meterId": meter_id,
                                "meter_ip": meter_ip,
                                "vr": -1,
                                "vy": -1,
                                "vb": -1,
                                "v_av": -1,
                                "ir": -1,
                                "iy": -1,
                                "ib": -1,
                                "i_av": -1,
                                "kwh": -1,
                                "kvah": -1,
                                "kwh_ex": -1,
                                "kvah_ex": -1
                            })
                        }
                    }
                    else {
                        if (vr != null)
                            vr = parseFloat(vr)
                        if (vy != null)
                            vy = parseFloat(vy)
                        if (vb != null)
                            vb = parseFloat(vb)
                        if (v_av != null)
                            v_av = parseFloat(v_av)
                        if (ir != null)
                            ir = parseFloat(ir)
                        if (iy != null)
                            iy = parseFloat(iy)
                        if (ib != null)
                            ib = parseFloat(ib)
                        if (i_av != null)
                            i_av = parseFloat(i_av)
                        if (kwh != null)
                            kwh = parseFloat(kwh)
                        if (kvah != null)
                            kvah = parseFloat(kvah)
                        if (kwh_ex != null)
                            kwh_ex = parseFloat(kwh_ex)
                        if (kvah_ex != null)
                            kvah_ex = parseFloat(kvah_ex)

                        d4_finalformat.push({
                            "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                            "date_time": datetime,
                            "month_year": month_year,
                            "hierarchy_code": hierarchy_code,
                            "meterId": meter_id,
                            "meter_ip": meter_ip,
                            "vr": vr,
                            "vy": vy,
                            "vb": vb,
                            "v_av": v_av,
                            "ir": ir,
                            "iy": iy,
                            "ib": ib,
                            "i_av": i_av,
                            "kwh": kwh,
                            "kvah": kvah,
                            "kwh_ex": kwh_ex,
                            "kvah_ex": kvah_ex
                        })
                    }
                }
                // ------------------ single param  ------------------
                else if (d4_dayprofile[i].IP.PARAMETER.length == undefined) {

                    // ---------------------- kwh calc ----------------------
                    for (d4_con = 0; d4_con < config[0][8].input_code.length; d4_con++) {
                        if (d4_dayprofile[i].IP.PARAMETER._PARAMCODE.includes("P7-4")) {
                            kwh = d4_dayprofile[i].IP.PARAMETER._VALUE / div
                        }
                        else {
                            if (d4_dayprofile[i].IP.PARAMETER._PARAMCODE.includes(config[0][8].input_code[d4_con].code)) {
                                kwh = d4_dayprofile[i].IP.PARAMETER._VALUE
                            }
                        }
                    }
                    // ---------------------- kvah calc ----------------------
                    for (d4_con = 0; d4_con < config[0][9].input_code.length; d4_con++) {
                        if (d4_dayprofile[i].IP.PARAMETER._PARAMCODE.includes("P7-6")) {
                            kvah = d4_dayprofile[i].IP.PARAMETER._VALUE / div
                        }
                        else {
                            if (d4_dayprofile[i].IP.PARAMETER._PARAMCODE.includes(config[0][9].input_code[d4_con].code)) {
                                kvah = d4_dayprofile[i].IP.PARAMETER._VALUE
                            }
                        }
                    }

                    if (vr == null && vy == null && vb == null && v_av == null && ir == null && iy == null && ib == null && i_av == null && kwh == null && kvah == null && kwh_ex == null && kvah_ex == null) {
                        if (new Date(Node1.D1.G2).getTime() > new Date(datetime).getTime()) {

                            d4_finalformat.push({
                                "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                "date_time": datetime,
                                "month_year": month_year,
                                "hierarchy_code": hierarchy_code,
                                "meterId": meter_id,
                                "meter_ip": meter_ip,
                                "vr": -1,
                                "vy": -1,
                                "vb": -1,
                                "v_av": -1,
                                "ir": -1,
                                "iy": -1,
                                "ib": -1,
                                "i_av": -1,
                                "kwh": -1,
                                "kvah": -1,
                                "kwh_ex": -1,
                                "kvah_ex": -1
                            })
                        }
                    }
                    else {
                        if (vr != null)
                            vr = parseFloat(vr)
                        if (vy != null)
                            vy = parseFloat(vy)
                        if (vb != null)
                            vb = parseFloat(vb)
                        if (v_av != null)
                            v_av = parseFloat(v_av)
                        if (ir != null)
                            ir = parseFloat(ir)
                        if (iy != null)
                            iy = parseFloat(iy)
                        if (ib != null)
                            ib = parseFloat(ib)
                        if (i_av != null)
                            i_av = parseFloat(i_av)
                        if (kwh != null)
                            kwh = parseFloat(kwh)
                        if (kvah != null)
                            kvah = parseFloat(kvah)
                        if (kwh_ex != null)
                            kwh_ex = parseFloat(kwh_ex)
                        if (kvah_ex != null)
                            kvah_ex = parseFloat(kvah_ex)

                        d4_finalformat.push({
                            "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                            "date_time": datetime,
                            "month_year": month_year,
                            "hierarchy_code": hierarchy_code,
                            "meterId": meter_id,
                            "meter_ip": meter_ip,
                            "vr": vr,
                            "vy": vy,
                            "vb": vb,
                            "v_av": v_av,
                            "ir": ir,
                            "iy": iy,
                            "ib": ib,
                            "i_av": i_av,
                            "kwh": kwh,
                            "kvah": kvah,
                            "kwh_ex": kwh_ex,
                            "kvah_ex": kvah_ex
                        })
                    }
                }
            }
            // ------------------ meter ip 15 or 30 with multiple ip interval for date ------------------
            else if (d4_dayprofile[i].IP.length != undefined && (meter_ip == 30 || meter_ip == 15)) {
                // -------------- for 1 day 48 or 96 slots logic --------------
                for (var j = 0; j < d4_dayprofile[i].IP.length; j++) {

                    if (meter_ip == 30 || meter_ip == 15) {

                        if (j == 0) {
                            if (d4_dayprofile[i].IP[0]._INTERVAL == 48 || d4_dayprofile[i].IP[0]._INTERVAL == 96) {

                                var time = timecalc(meter_ip, d4_dayprofile[i].IP[0]._INTERVAL)
                                var datetime_form = date + " " + time
                                var datetime = moment(datetime_form, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')
                            }
                            else {
                                var time = timecalc(meter_ip, d4_dayprofile[i].IP[j]._INTERVAL)
                                var datetime_form = date + " " + time
                                var datetime = moment(datetime_form, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')
                            }
                        }
                        else if (j == d4_dayprofile[i].IP.length - 1) {
                            if (d4_dayprofile[i].IP[d4_dayprofile[i].IP.length - 1]._INTERVAL == 48 || d4_dayprofile[i].IP[d4_dayprofile[i].IP.length - 1]._INTERVAL == 96) {

                                var time = timecalc(meter_ip, d4_dayprofile[i].IP[d4_dayprofile[i].IP.length - 1]._INTERVAL)
                                var datetime_form = moment(date, 'DD-MM-YYYY').add(1, 'days').format('DD-MM-YYYY') + " " + time
                                var datetime = moment(datetime_form, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')
                            }
                            else {
                                var time = timecalc(meter_ip, d4_dayprofile[i].IP[j]._INTERVAL)
                                var datetime_form = date + " " + time
                                var datetime = moment(datetime_form, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')
                            }
                        }
                        else {
                            var time = timecalc(meter_ip, d4_dayprofile[i].IP[j]._INTERVAL)
                            var datetime_form = date + " " + time
                            var datetime = moment(datetime_form, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')
                        }
                    }

                    if (d4_dayprofile[i].IP[j].PARAMETER != undefined) {
                        // --------------------- for 1 ip interval with multiple param ---------------------
                        if (d4_dayprofile[i].IP[j].PARAMETER.length != undefined) {
                            // ---------------------- vr calc ----------------------
                            for (d4_con = 0; d4_con < config[0][0].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][0].input_code[d4_con].code)) {
                                        vr = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                    }
                                }
                            }
                            // ---------------------- vy calc ----------------------
                            for (d4_con = 0; d4_con < config[0][1].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][1].input_code[d4_con].code)) {
                                        vy = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                    }
                                }
                            }
                            // ---------------------- vb calc ----------------------
                            for (d4_con = 0; d4_con < config[0][2].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][2].input_code[d4_con].code)) {
                                        vb = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                    }
                                }
                            }
                            // ---------------------- v_av calc ----------------------
                            for (d4_con = 0; d4_con < config[0][3].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][3].input_code[d4_con].code)) {
                                        v_av = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                    }
                                }
                            }
                            // ---------------------- ir calc ----------------------
                            for (d4_con = 0; d4_con < config[0][4].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][4].input_code[d4_con].code)) {
                                        ir = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                    }
                                }
                            }
                            // ---------------------- iy calc ----------------------
                            for (d4_con = 0; d4_con < config[0][5].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][5].input_code[d4_con].code)) {
                                        iy = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                    }
                                }
                            }
                            // ---------------------- ib calc ----------------------
                            for (d4_con = 0; d4_con < config[0][6].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][6].input_code[d4_con].code)) {
                                        ib = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                    }
                                }
                            }
                            // ---------------------- i_av calc ----------------------
                            for (d4_con = 0; d4_con < config[0][7].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][7].input_code[d4_con].code)) {
                                        i_av = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                    }
                                }
                            }
                            // ---------------------- kwh calc ----------------------
                            for (d4_con = 0; d4_con < config[0][8].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes("P7-4")) {
                                        if (d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE == 0) {

                                            var iflag = JsonFind(d4_dayprofile[i].IP[j]).checkKey('IFLAG')

                                            if (iflag.length != undefined) {
                                                for (var f = 0; f < iflag.length; f++) {
                                                    if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                        kwh = -1
                                                    }
                                                }
                                            }
                                            else {
                                                if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                    kwh = -1
                                                }
                                            }
                                        }
                                        else {
                                            kwh = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE / div
                                        }
                                    }
                                    else {
                                        if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][8].input_code[d4_con].code)) {
                                            if (d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE == 0) {

                                                var iflag = JsonFind(d4_dayprofile[i].IP[j]).checkKey('IFLAG')

                                                if (iflag.length != undefined) {
                                                    for (var f = 0; f < iflag.length; f++) {
                                                        if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                            kwh = -1
                                                        }
                                                    }
                                                }
                                                else {
                                                    if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                        kwh = -1
                                                    }
                                                }
                                            }
                                            else {
                                                kwh = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                            }
                                        }
                                    }
                                }
                            }
                            // ---------------------- kvah calc ----------------------
                            for (d4_con = 0; d4_con < config[0][9].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes("P7-6")) {
                                        if (d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE == 0) {

                                            var iflag = JsonFind(d4_dayprofile[i].IP[j]).checkKey('IFLAG')

                                            if (iflag.length != undefined) {
                                                for (var f = 0; f < iflag.length; f++) {
                                                    if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                        kvah = -1
                                                    }
                                                }
                                            }
                                            else {
                                                if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                    kvah = -1
                                                }
                                            }
                                        }
                                        else {
                                            kvah = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE / div
                                        }
                                    }
                                    else {
                                        if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][9].input_code[d4_con].code)) {
                                            if (d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE == 0) {

                                                var iflag = JsonFind(d4_dayprofile[i].IP[j]).checkKey('IFLAG')

                                                if (iflag.length != undefined) {
                                                    for (var f = 0; f < iflag.length; f++) {
                                                        if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                            kvah = -1
                                                        }
                                                    }
                                                }
                                                else {
                                                    if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                        kvah = -1
                                                    }
                                                }
                                            }
                                            else {
                                                kvah = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                            }
                                        }
                                    }
                                }
                            }
                            // ---------------------- kwh_ex calc ----------------------
                            for (d4_con = 0; d4_con < config[0][13].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][13].input_code[d4_con].code)) {
                                        kwh_ex = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                    }
                                }
                            }
                            // ---------------------- kvah_ex calc ----------------------
                            for (d4_con = 0; d4_con < config[0][14].input_code.length; d4_con++) {
                                for (var p = 0; p < d4_dayprofile[i].IP[j].PARAMETER.length; p++) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER[p]._PARAMCODE.includes(config[0][14].input_code[d4_con].code)) {
                                        kvah_ex = d4_dayprofile[i].IP[j].PARAMETER[p]._VALUE
                                    }
                                }
                            }

                            if (vr == null && vy == null && vb == null && v_av == null && ir == null && iy == null && ib == null && i_av == null && kwh == null && kvah == null && kwh_ex == null && kvah_ex == null) {
                                if (new Date(Node1.D1.G2).getTime() > new Date(datetime).getTime()) {

                                    d4_finalformat.push({
                                        "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                        "date_time": datetime,
                                        "month_year": month_year,
                                        "hierarchy_code": hierarchy_code,
                                        "meterId": meter_id,
                                        "meter_ip": meter_ip,
                                        "vr": -1,
                                        "vy": -1,
                                        "vb": -1,
                                        "v_av": -1,
                                        "ir": -1,
                                        "iy": -1,
                                        "ib": -1,
                                        "i_av": -1,
                                        "kwh": -1,
                                        "kvah": -1,
                                        "kwh_ex": -1,
                                        "kvah_ex": -1
                                    })
                                }
                            }
                            else {
                                if (vr != null)
                                    vr = parseFloat(vr)
                                if (vy != null)
                                    vy = parseFloat(vy)
                                if (vb != null)
                                    vb = parseFloat(vb)
                                if (v_av != null)
                                    v_av = parseFloat(v_av)
                                if (ir != null)
                                    ir = parseFloat(ir)
                                if (iy != null)
                                    iy = parseFloat(iy)
                                if (ib != null)
                                    ib = parseFloat(ib)
                                if (i_av != null)
                                    i_av = parseFloat(i_av)
                                if (kwh != null)
                                    kwh = parseFloat(kwh)
                                if (kvah != null)
                                    kvah = parseFloat(kvah)
                                if (kwh_ex != null)
                                    kwh_ex = parseFloat(kwh_ex)
                                if (kvah_ex != null)
                                    kvah_ex = parseFloat(kvah_ex)

                                d4_finalformat.push({
                                    "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                    "date_time": datetime,
                                    "month_year": month_year,
                                    "hierarchy_code": hierarchy_code,
                                    "meterId": meter_id,
                                    "meter_ip": meter_ip,
                                    "vr": vr,
                                    "vy": vy,
                                    "vb": vb,
                                    "v_av": v_av,
                                    "ir": ir,
                                    "iy": iy,
                                    "ib": ib,
                                    "i_av": i_av,
                                    "kwh": kwh,
                                    "kvah": kvah,
                                    "kwh_ex": kwh_ex,
                                    "kvah_ex": kvah_ex
                                })
                            }
                        }
                        // --------------------- for 1 ip interval with single param ---------------------
                        else if (d4_dayprofile[i].IP[j].PARAMETER.length == undefined) {
                            // ---------------------- kwh calc ----------------------
                            for (d4_con = 0; d4_con < config[0][8].input_code.length; d4_con++) {
                                if (d4_dayprofile[i].IP[j].PARAMETER._PARAMCODE.includes("P7-4")) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER._VALUE == 0) {

                                        var iflag = JsonFind(d4_dayprofile[i].IP[j]).checkKey('IFLAG')

                                        if (iflag.length != undefined) {
                                            for (var f = 0; f < iflag.length; f++) {
                                                if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                    kwh = -1
                                                }
                                            }
                                        }
                                        else {
                                            if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                kwh = -1
                                            }
                                        }
                                    }
                                    else {
                                        kwh = d4_dayprofile[i].IP[j].PARAMETER._VALUE / div
                                    }
                                }
                                else {
                                    if (d4_dayprofile[i].IP[j].PARAMETER._PARAMCODE.includes(config[0][8].input_code[d4_con].code)) {
                                        if (d4_dayprofile[i].IP[j].PARAMETER._VALUE == 0) {

                                            var iflag = JsonFind(d4_dayprofile[i].IP[j]).checkKey('IFLAG')

                                            if (iflag.length != undefined) {
                                                for (var f = 0; f < iflag.length; f++) {
                                                    if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                        kwh = -1
                                                    }
                                                }
                                            }
                                            else {
                                                if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                    kwh = -1
                                                }
                                            }
                                        }
                                        else {
                                            kwh = d4_dayprofile[i].IP[j].PARAMETER._VALUE
                                        }
                                    }
                                }
                            }

                            // ---------------------- kvah calc ----------------------
                            for (d4_con = 0; d4_con < config[0][9].input_code.length; d4_con++) {
                                if (d4_dayprofile[i].IP[j].PARAMETER._PARAMCODE.includes("P7-6")) {
                                    if (d4_dayprofile[i].IP[j].PARAMETER._VALUE == 0) {

                                        var iflag = JsonFind(d4_dayprofile[i].IP[j]).checkKey('IFLAG')

                                        if (iflag.length != undefined) {
                                            for (var f = 0; f < iflag.length; f++) {
                                                if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                    kvah = -1
                                                }
                                            }
                                        }
                                        else {
                                            if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                kvah = -1
                                            }
                                        }
                                    }
                                    else {
                                        kvah = d4_dayprofile[i].IP[j].PARAMETER._VALUE / div
                                    }
                                }
                                else {
                                    if (d4_dayprofile[i].IP[j].PARAMETER._PARAMCODE.includes(config[0][9].input_code[d4_con].code)) {
                                        if (d4_dayprofile[i].IP[j].PARAMETER._VALUE == 0) {

                                            var iflag = JsonFind(d4_dayprofile[i].IP[j]).checkKey('IFLAG')

                                            if (iflag.length != undefined) {
                                                for (var f = 0; f < iflag.length; f++) {
                                                    if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                        kvah = -1
                                                    }
                                                }
                                            }
                                            else {
                                                if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                    kvah = -1
                                                }
                                            }
                                        }
                                        else {
                                            kvah = d4_dayprofile[i].IP[j].PARAMETER._VALUE
                                        }
                                    }
                                }
                            }

                            if (vr == null && vy == null && vb == null && v_av == null && ir == null && iy == null && ib == null && i_av == null && kwh == null && kvah == null && kwh_ex == null && kvah_ex == null) {
                                if (new Date(Node1.D1.G2).getTime() > new Date(datetime).getTime()) {

                                    d4_finalformat.push({
                                        "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                        "date_time": datetime,
                                        "month_year": month_year,
                                        "hierarchy_code": hierarchy_code,
                                        "meterId": meter_id,
                                        "meter_ip": meter_ip,
                                        "vr": -1,
                                        "vy": -1,
                                        "vb": -1,
                                        "v_av": -1,
                                        "ir": -1,
                                        "iy": -1,
                                        "ib": -1,
                                        "i_av": -1,
                                        "kwh": -1,
                                        "kvah": -1,
                                        "kwh_ex": -1,
                                        "kvah_ex": -1
                                    })
                                }
                            }
                            else {
                                if (vr != null)
                                    vr = parseFloat(vr)
                                if (vy != null)
                                    vy = parseFloat(vy)
                                if (vb != null)
                                    vb = parseFloat(vb)
                                if (v_av != null)
                                    v_av = parseFloat(v_av)
                                if (ir != null)
                                    ir = parseFloat(ir)
                                if (iy != null)
                                    iy = parseFloat(iy)
                                if (ib != null)
                                    ib = parseFloat(ib)
                                if (i_av != null)
                                    i_av = parseFloat(i_av)
                                if (kwh != null)
                                    kwh = parseFloat(kwh)
                                if (kvah != null)
                                    kvah = parseFloat(kvah)
                                if (kwh_ex != null)
                                    kwh_ex = parseFloat(kwh_ex)
                                if (kvah_ex != null)
                                    kvah_ex = parseFloat(kvah_ex)

                                d4_finalformat.push({
                                    "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                    "date_time": datetime,
                                    "month_year": month_year,
                                    "hierarchy_code": hierarchy_code,
                                    "meterId": meter_id,
                                    "meter_ip": meter_ip,
                                    "vr": vr,
                                    "vy": vy,
                                    "vb": vb,
                                    "v_av": v_av,
                                    "ir": ir,
                                    "iy": iy,
                                    "ib": ib,
                                    "i_av": i_av,
                                    "kwh": kwh,
                                    "kvah": kvah,
                                    "kwh_ex": kwh_ex,
                                    "kvah_ex": kvah_ex
                                })
                            }
                        }
                    }
                    else {
                        if (new Date(Node1.D1.G2).getTime() > new Date(datetime).getTime()) {

                            d4_finalformat.push({
                                "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                "date_time": datetime,
                                "month_year": month_year,
                                "hierarchy_code": hierarchy_code,
                                "meterId": meter_id,
                                "meter_ip": meter_ip,
                                "vr": -1,
                                "vy": -1,
                                "vb": -1,
                                "v_av": -1,
                                "ir": -1,
                                "iy": -1,
                                "ib": -1,
                                "i_av": -1,
                                "kwh": -1,
                                "kvah": -1,
                                "kwh_ex": -1,
                                "kvah_ex": -1
                            })
                        }
                    }
                }
            }
            // ------------------ meter ip 15 or 30 with single ip interval for date ------------------
            else if (d4_dayprofile[i].IP.length == undefined && (meter_ip == 30 || meter_ip == 15)) {

                if (meter_ip == 30 || meter_ip == 15) {

                    var time = timecalc(meter_ip, d4_dayprofile[i].IP._INTERVAL)
                    var datetime_form = moment(date, 'DD-MM-YYYY').add(1, 'days').format('DD-MM-YYYY') + " " + time
                    var datetime = moment(datetime_form, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')
                }

                if (d4_dayprofile[i].IP.PARAMETER != undefined) {
                    // --------------------- for 1 ip interval with multiple param ---------------------
                    if (d4_dayprofile[i].IP.PARAMETER.length != undefined) {

                        // ---------------------- vr calc ----------------------
                        for (d4_con = 0; d4_con < config[0][0].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][0].input_code[d4_con].code)) {
                                    vr = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                        // ---------------------- vy calc ----------------------
                        for (d4_con = 0; d4_con < config[0][1].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][1].input_code[d4_con].code)) {
                                    vy = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                        // ---------------------- vb calc ----------------------
                        for (d4_con = 0; d4_con < config[0][2].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][2].input_code[d4_con].code)) {
                                    vb = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                        // ---------------------- v_av calc ----------------------
                        for (d4_con = 0; d4_con < config[0][3].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][3].input_code[d4_con].code)) {
                                    v_av = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                        // ---------------------- ir calc ----------------------
                        for (d4_con = 0; d4_con < config[0][4].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][4].input_code[d4_con].code)) {
                                    ir = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                        // ---------------------- iy calc ----------------------
                        for (d4_con = 0; d4_con < config[0][5].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][5].input_code[d4_con].code)) {
                                    iy = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                        // ---------------------- ib calc ----------------------
                        for (d4_con = 0; d4_con < config[0][6].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][6].input_code[d4_con].code)) {
                                    ib = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                        // ---------------------- i_av calc ----------------------
                        for (d4_con = 0; d4_con < config[0][7].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][7].input_code[d4_con].code)) {
                                    i_av = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                        // ---------------------- kwh calc ----------------------
                        for (d4_con = 0; d4_con < config[0][8].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes("P7-4")) {
                                    if (d4_dayprofile[i].IP.PARAMETER[p]._VALUE == 0) {

                                        var iflag = JsonFind(d4_dayprofile[i].IP).checkKey('IFLAG')

                                        if (iflag.length != undefined) {
                                            for (var f = 0; f < iflag.length; f++) {
                                                if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                    kwh = -1
                                                }
                                            }
                                        }
                                        else {
                                            if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                kwh = -1
                                            }
                                        }
                                    }
                                    else {
                                        kwh = d4_dayprofile[i].IP.PARAMETER[p]._VALUE / div
                                    }
                                }
                                else {
                                    if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][8].input_code[d4_con].code)) {
                                        if (d4_dayprofile[i].IP.PARAMETER[p]._VALUE == 0) {

                                            var iflag = JsonFind(d4_dayprofile[i].IP).checkKey('IFLAG')

                                            if (iflag.length != undefined) {
                                                for (var f = 0; f < iflag.length; f++) {
                                                    if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                        kwh = -1
                                                    }
                                                }
                                            }
                                            else {
                                                if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                    kwh = -1
                                                }
                                            }
                                        }
                                        else {
                                            kwh = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                        }
                                    }
                                }
                            }
                        }
                        // ---------------------- kvah calc ----------------------
                        for (d4_con = 0; d4_con < config[0][9].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes("P7-6")) {
                                    if (d4_dayprofile[i].IP.PARAMETER[p]._VALUE == 0) {

                                        var iflag = JsonFind(d4_dayprofile[i].IP).checkKey('IFLAG')

                                        if (iflag.length != undefined) {
                                            for (var f = 0; f < iflag.length; f++) {
                                                if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                    kvah = -1
                                                }
                                            }
                                        }
                                        else {
                                            if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                kvah = -1
                                            }
                                        }
                                    }
                                    else {
                                        kvah = d4_dayprofile[i].IP.PARAMETER[p]._VALUE / div
                                    }
                                }
                                else {
                                    if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][9].input_code[d4_con].code)) {
                                        if (d4_dayprofile[i].IP.PARAMETER[p]._VALUE == 0) {

                                            var iflag = JsonFind(d4_dayprofile[i].IP).checkKey('IFLAG')

                                            if (iflag.length != undefined) {
                                                for (var f = 0; f < iflag.length; f++) {
                                                    if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                        kvah = -1
                                                    }
                                                }
                                            }
                                            else {
                                                if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                    kvah = -1
                                                }
                                            }
                                        }
                                        else {
                                            kvah = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                        }
                                    }
                                }
                            }
                        }
                        // ---------------------- kwh_ex calc ----------------------
                        for (d4_con = 0; d4_con < config[0][13].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][13].input_code[d4_con].code)) {
                                    kwh_ex = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }
                        // ---------------------- kvah_ex calc ----------------------
                        for (d4_con = 0; d4_con < config[0][14].input_code.length; d4_con++) {
                            for (var p = 0; p < d4_dayprofile[i].IP.PARAMETER.length; p++) {
                                if (d4_dayprofile[i].IP.PARAMETER[p]._PARAMCODE.includes(config[0][14].input_code[d4_con].code)) {
                                    kvah_ex = d4_dayprofile[i].IP.PARAMETER[p]._VALUE
                                }
                            }
                        }

                        if (vr == null && vy == null && vb == null && v_av == null && ir == null && iy == null && ib == null && i_av == null && kwh == null && kvah == null && kwh_ex == null && kvah_ex == null) {
                            if (new Date(Node1.D1.G2).getTime() > new Date(datetime).getTime()) {

                                d4_finalformat.push({
                                    "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                    "date_time": datetime,
                                    "month_year": month_year,
                                    "hierarchy_code": hierarchy_code,
                                    "meterId": meter_id,
                                    "meter_ip": meter_ip,
                                    "vr": -1,
                                    "vy": -1,
                                    "vb": -1,
                                    "v_av": -1,
                                    "ir": -1,
                                    "iy": -1,
                                    "ib": -1,
                                    "i_av": -1,
                                    "kwh": -1,
                                    "kvah": -1,
                                    "kwh_ex": -1,
                                    "kvah_ex": -1
                                })
                            }
                        }
                        else {
                            if (vr != null)
                                vr = parseFloat(vr)
                            if (vy != null)
                                vy = parseFloat(vy)
                            if (vb != null)
                                vb = parseFloat(vb)
                            if (v_av != null)
                                v_av = parseFloat(v_av)
                            if (ir != null)
                                ir = parseFloat(ir)
                            if (iy != null)
                                iy = parseFloat(iy)
                            if (ib != null)
                                ib = parseFloat(ib)
                            if (i_av != null)
                                i_av = parseFloat(i_av)
                            if (kwh != null)
                                kwh = parseFloat(kwh)
                            if (kvah != null)
                                kvah = parseFloat(kvah)
                            if (kwh_ex != null)
                                kwh_ex = parseFloat(kwh_ex)
                            if (kvah_ex != null)
                                kvah_ex = parseFloat(kvah_ex)

                            d4_finalformat.push({
                                "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                "date_time": datetime,
                                "month_year": month_year,
                                "hierarchy_code": hierarchy_code,
                                "meterId": meter_id,
                                "meter_ip": meter_ip,
                                "vr": vr,
                                "vy": vy,
                                "vb": vb,
                                "v_av": v_av,
                                "ir": ir,
                                "iy": iy,
                                "ib": ib,
                                "i_av": i_av,
                                "kwh": kwh,
                                "kvah": kvah,
                                "kwh_ex": kwh_ex,
                                "kvah_ex": kvah_ex
                            })
                        }
                    }
                    // --------------------- for 1 ip interval with single param ---------------------
                    else if (d4_dayprofile[i].IP.PARAMETER.length == undefined) {

                        // ---------------------- kwh calc ----------------------
                        for (d4_con = 0; d4_con < config[0][8].input_code.length; d4_con++) {
                            if (d4_dayprofile[i].IP.PARAMETER._PARAMCODE.includes("P7-4")) {
                                if (d4_dayprofile[i].IP.PARAMETER._VALUE == 0) {

                                    var iflag = JsonFind(d4_dayprofile[i].IP).checkKey('IFLAG')

                                    if (iflag.length != undefined) {
                                        for (var f = 0; f < iflag.length; f++) {
                                            if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                kwh = -1
                                            }
                                        }
                                    }
                                    else {
                                        if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                            kwh = -1
                                        }
                                    }
                                }
                                else {
                                    kwh = d4_dayprofile[i].IP.PARAMETER._VALUE / div
                                }
                            }
                            else {
                                if (d4_dayprofile[i].IP.PARAMETER._PARAMCODE.includes(config[0][8].input_code[d4_con].code)) {
                                    if (d4_dayprofile[i].IP.PARAMETER._VALUE == 0) {

                                        var iflag = JsonFind(d4_dayprofile[i].IP).checkKey('IFLAG')

                                        if (iflag.length != undefined) {
                                            for (var f = 0; f < iflag.length; f++) {
                                                if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                    kwh = -1
                                                }
                                            }
                                        }
                                        else {
                                            if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                kwh = -1
                                            }
                                        }
                                    }
                                    else {
                                        kwh = d4_dayprofile[i].IP.PARAMETER._VALUE
                                    }
                                }
                            }
                        }

                        // ---------------------- kvah calc ----------------------
                        for (d4_con = 0; d4_con < config[0][9].input_code.length; d4_con++) {
                            if (d4_dayprofile[i].IP.PARAMETER._PARAMCODE.includes("P7-6")) {
                                if (d4_dayprofile[i].IP.PARAMETER._VALUE == 0) {

                                    var iflag = JsonFind(d4_dayprofile[i].IP).checkKey('IFLAG')

                                    if (iflag.length != undefined) {
                                        for (var f = 0; f < iflag.length; f++) {
                                            if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                kvah = -1
                                            }
                                        }
                                    }
                                    else {
                                        if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                            kvah = -1
                                        }
                                    }
                                }
                                else {
                                    kvah = d4_dayprofile[i].IP.PARAMETER._VALUE / div
                                }
                            }
                            else {
                                if (d4_dayprofile[i].IP.PARAMETER._PARAMCODE.includes(config[0][9].input_code[d4_con].code)) {
                                    if (d4_dayprofile[i].IP.PARAMETER._VALUE == 0) {

                                        var iflag = JsonFind(d4_dayprofile[i].IP).checkKey('IFLAG')

                                        if (iflag.length != undefined) {
                                            for (var f = 0; f < iflag.length; f++) {
                                                if (iflag[f]._CODE == "101" && iflag[f]._VALUE == "1") {
                                                    kvah = -1
                                                }
                                            }
                                        }
                                        else {
                                            if (iflag._CODE == "101" && iflag._VALUE == "1") {
                                                kwh = -1
                                            }
                                        }
                                    }
                                    else {
                                        kvah = d4_dayprofile[i].IP.PARAMETER._VALUE
                                    }
                                }
                            }
                        }

                        if (vr == null && vy == null && vb == null && v_av == null && ir == null && iy == null && ib == null && i_av == null && kwh == null && kvah == null && kwh_ex == null && kvah_ex == null) {
                            if (new Date(Node1.D1.G2).getTime() > new Date(datetime).getTime()) {

                                d4_finalformat.push({
                                    "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                    "date_time": datetime,
                                    "month_year": month_year,
                                    "hierarchy_code": hierarchy_code,
                                    "meterId": meter_id,
                                    "meter_ip": meter_ip,
                                    "vr": -1,
                                    "vy": -1,
                                    "vb": -1,
                                    "v_av": -1,
                                    "ir": -1,
                                    "iy": -1,
                                    "ib": -1,
                                    "i_av": -1,
                                    "kwh": -1,
                                    "kvah": -1,
                                    "kwh_ex": -1,
                                    "kvah_ex": -1
                                })
                            }
                        }
                        else {
                            if (vr != null)
                                vr = parseFloat(vr)
                            if (vy != null)
                                vy = parseFloat(vy)
                            if (vb != null)
                                vb = parseFloat(vb)
                            if (v_av != null)
                                v_av = parseFloat(v_av)
                            if (ir != null)
                                ir = parseFloat(ir)
                            if (iy != null)
                                iy = parseFloat(iy)
                            if (ib != null)
                                ib = parseFloat(ib)
                            if (i_av != null)
                                i_av = parseFloat(i_av)
                            if (kwh != null)
                                kwh = parseFloat(kwh)
                            if (kvah != null)
                                kvah = parseFloat(kvah)
                            if (kwh_ex != null)
                                kwh_ex = parseFloat(kwh_ex)
                            if (kvah_ex != null)
                                kvah_ex = parseFloat(kvah_ex)

                            d4_finalformat.push({
                                "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                                "date_time": datetime,
                                "month_year": month_year,
                                "hierarchy_code": hierarchy_code,
                                "meterId": meter_id,
                                "meter_ip": meter_ip,
                                "vr": vr,
                                "vy": vy,
                                "vb": vb,
                                "v_av": v_av,
                                "ir": ir,
                                "iy": iy,
                                "ib": ib,
                                "i_av": i_av,
                                "kwh": kwh,
                                "kvah": kvah,
                                "kwh_ex": kwh_ex,
                                "kvah_ex": kvah_ex
                            })
                        }
                    }
                }
                else {
                    if (new Date(Node1.D1.G2).getTime() > new Date(datetime).getTime()) {

                        d4_finalformat.push({
                            "date_obj": moment(datetime, "DD-MM-YYYY HH:mm:ss").toDate(),
                            "date_time": datetime,
                            "month_year": month_year,
                            "hierarchy_code": hierarchy_code,
                            "meterId": meter_id,
                            "meter_ip": meter_ip,
                            "vr": -1,
                            "vy": -1,
                            "vb": -1,
                            "v_av": -1,
                            "ir": -1,
                            "iy": -1,
                            "ib": -1,
                            "i_av": -1,
                            "kwh": -1,
                            "kvah": -1,
                            "kwh_ex": -1,
                            "kvah_ex": -1
                        })
                    }
                }
            }
        }
        if (d4_finalformat.length != 0) {

            pushApi(d4_finalformat, AccessToken, ipAddr, i).then(function (res) {

                if (res - 1 >= 0) {
                    d4_calc(DayProfile, d4_dayprofile, dataproc_det, res - 1, ipAddr, AccessToken, hierarchy_code, month_year, meter_id, meter_ip, Node1)
                }
            })
        }
    }
    else {
        if (i - 1 >= 0) {
            d4_calc(DayProfile, d4_dayprofile, dataproc_det, i - 1, ipAddr, AccessToken, hierarchy_code, month_year, meter_id, meter_ip, Node1)
        }
    }
}

var pushApi = function (d4_finalformat, AccessToken, ipAddr, i) {

    return new Promise(function (resolve, reject) {

        var args = {
            data: d4_finalformat,
            headers: {
                "Content-Type": "application/json"
            }
        };

        client.post(ipAddr + "/api/d4s?access_token=" + AccessToken, args, function (data, res) {
            resolve(i)
        });
    })
}

var timecalc = function (meter_ip, interval) {

    if (meter_ip == 30) {

        var time_mapping = {
            '1': '00:30:00', '2': '01:00:00', '3': '01:30:00', '4': '02:00:00', '5': '02:30:00',
            '6': '03:00:00', '7': '03:30:00', '8': '04:00:00', '9': '04:30:00', '10': '05:00:00',
            '11': '05:30:00', '12': '06:00:00', '13': '06:30:00', '14': '07:00:00', '15': '07:30:00',
            '16': '08:00:00', '17': '08:30:00', '18': '09:00:00', '19': '09:30:00', '20': '10:00:00',
            '21': '10:30:00', '22': '11:00:00', '23': '11:30:00', '24': '12:00:00', '25': '12:30:00',
            '26': '13:00:00', '27': '13:30:00', '28': '14:00:00', '29': '14:30:00', '30': '15:00:00',
            '31': '15:30:00', '32': '16:00:00', '33': '16:30:00', '34': '17:00:00', '35': '17:30:00',
            '36': '18:00:00', '37': '18:30:00', '38': '19:00:00', '39': '19:30:00', '40': '20:00:00',
            '41': '20:30:00', '42': '21:00:00', '43': '21:30:00', '44': '22:00:00', '45': '22:30:00',
            '46': '23:00:00', '47': '23:30:00', '48': '00:00:00'
        }
    }

    if (meter_ip == 15) {

        var time_mapping = {
            '1': '00:15:00', '2': '00:30:00', '3': ' 00:45:00', '4': '01:00:00', '5': '01:15:00',
            '6': '01:30:00', '7': '01:45:00', '8': '02:00:00', '9': '02:15:00', '10': '02:30:00',
            '11': '02:45:00', '12': '03:00:00', '13': '03:15:00', '14': '03:30:00', '15': '03:45:00',
            '16': '04:00:00', '17': '04:15:00', '18': '04:30:00', '19': '04:45:00', '20': '05:00:00',
            '21': '05:15:00', '22': '05:30:00', '23': '05:45:00', '24': '06:00:00', '25': '06:15:00',
            '26': '06:30:00', '27': '06:45:00', '28': '07:00:00', '29': '07:15:00', '30': '07:30:00',
            '31': '07:45:00', '32': '08:00:00', '33': '08:15:00', '34': '08:30:00', '35': '08:45:00',
            '36': '09:00:00', '37': '09:15:00', '38': '09:30:00', '39': '09:45:00', '40': '10:00:00',
            '41': '10:15:00', '42': '10:30:00', '43': '10:45:00', '44': '11:00:00', '45': '11:15:00',
            '46': '11:30:00', '47': '11:45:00', '48': '12:00:00', '49': '12:15:00', '50': '12:30:00',
            '51': '12:45:00', '52': '13:00:00', '53': '13:15:00', '54': '13:30:00', '55': '13:45:00',
            '56': '14:00:00', '57': '14:15:00', '58': '14:30:00', '59': '14:45:00', '60': '15:00:00',
            '61': '15:15:00', '62': '15:30:00', '63': '15:45:00', '64': '16:00:00', '65': '16:15:00',
            '66': '16:30:00', '67': '16:45:00', '68': '17:00:00', '69': '17:15:00', '70': '17:30:00',
            '71': '17:45:00', '72': '18:00:00', '73': '18:15:00', '74': '18:30:00', '75': '18:45:00',
            '76': '19:00:00', '77': '19:15:00', '78': '19:30:00', '79': '19:45:00', '80': '20:00:00',
            '81': '20:15:00', '82': '20:30:00', '83': '20:45:00', '84': '21:00:00', '85': '21:15:00',
            '86': '21:30:00', '87': '21:45:00', '88': '22:00:00', '89': '22:15:00', '90': '22:30:00',
            '91': '22:45:00', '92': '23:00:00', '93': '23:15:00', '94': '23:30:00', '95': '23:45:00',
            '96': '00:00:00'
        }
    }

    var time_mapping_string = JSON.stringify(time_mapping);
    var time_map = JSON.parse(time_mapping_string);

    var time_conv = time_map[interval]

    return time_conv
}

module.exports = { callfourFunction: callfourFunction }