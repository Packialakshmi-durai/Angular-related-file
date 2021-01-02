var config = require('./config');
var eventmapping = require('./mapping');
var Client = require('node-rest-client').Client;
var client = new Client();
const JsonFind = require('json-find');
var unique = require("array-unique").immutable;
var sortBy = require('array-sort-by');
var moment = require('moment');
var groupBy = require('json-groupby');

function callfiveFunction(doc, Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year, meter_id) {

    return new Promise(async function (resolve, reject) {

        try {

            if (Node1.D5 != undefined && Node1.D5 != '') {

                var D5Data = [];
                var arrstatus = [];
                var EventData = [];
                var SpiltedArray = [];
                var Overalldata = [];
                var dataRemoved_last = []
                var dataRemoved = []
                var TotalValue = []
                var d5_finalformat = []

                var Event = doc.checkKey('EVENT')

                if (Event) {

                    dataproc_det.D5 = "Found"

                    for (var i = 0; i < Event.length; i++) {

                        var vr_str = null
                        var dur_vr_str = null
                        var vy_str = null
                        var dur_vy_str = null
                        var vb_str = null
                        var dur_vb_str = null
                        var ir_str = null
                        var dur_ir_str = null
                        var iy_str = null
                        var dur_iy_str = null
                        var ib_str = null
                        var dur_ib_str = null
                        var kwh_str = null
                        var dur_kwh_str = null
                        var kvah_str = null
                        var dur_kvah_str = null
                        var pf_r_str = null
                        var dur_pf_r_str = null
                        var pf_y_str = null
                        var dur_pf_y_str = null
                        var pf_b_str = null
                        var dur_pf_b_str = null

                        if (Event[i]._TIME != undefined) {
                            if (JsonFind(Event[i]).findValues('_TIME')._TIME != '') {
                                if (isNaN(parseFloat(JsonFind(Event[i]).checkKey('_STATUS'))) != true) {
                                    arrstatus.push(JsonFind(Event[i]).checkKey('_CODE')) //push CODE in arrstatus array 
                                    var Snapshot = JsonFind(Event[i]).checkKey('SNAPSHOT') || JsonFind(Event[i]).checkKey('snapshot') || JsonFind(Event[i]).checkKey('Snapshot'); //get snapshot
                                    if (Snapshot) {
                                        //vr
                                        for (var d5jCon = 0; d5jCon < config[0][0].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {

                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][0].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        vr_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        //vy
                                        for (var d5jCon = 0; d5jCon < config[0][1].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {
                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][1].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        vy_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        //vb
                                        for (var d5jCon = 0; d5jCon < config[0][2].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {
                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][2].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        vb_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        //ir
                                        for (var d5jCon = 0; d5jCon < config[0][4].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {
                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][4].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        ir_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        //iy
                                        for (var d5jCon = 0; d5jCon < config[0][5].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {
                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][5].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        iy_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        //ib
                                        for (var d5jCon = 0; d5jCon < config[0][6].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {
                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][6].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        ib_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        //kwh
                                        for (var d5jCon = 0; d5jCon < config[0][8].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {
                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][8].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        kwh_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        //kvah
                                        for (var d5jCon = 0; d5jCon < config[0][9].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {
                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][9].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        kvah_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        //pfr
                                        for (var d5jCon = 0; d5jCon < config[0][10].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {
                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][10].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        pf_r_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        //pfy
                                        for (var d5jCon = 0; d5jCon < config[0][11].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {
                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][11].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        pf_y_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        //pfb
                                        for (var d5jCon = 0; d5jCon < config[0][12].input_code.length; d5jCon++) {
                                            for (var jcon in Snapshot) {
                                                if (Snapshot[jcon]._PARAMCODE.includes(config[0][12].input_code[d5jCon].code)) {
                                                    if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                        pf_b_str = parseFloat(Snapshot[jcon]._VALUE)
                                                    }
                                                }
                                            }
                                        }
                                        if ((Math.sign(parseInt(JsonFind(Event[i]).checkKey('_CODE'))) != -1) && (parseInt(JsonFind(Event[i]).checkKey('_CODE')) != 0) && (parseInt(JsonFind(Event[i]).checkKey('_CODE')) != 76) && (parseFloat(JsonFind(Event[i]).checkKey('_STATUS')) != -1)) {
                                            var obj = {}
                                            obj = {
                                                "code": parseInt(JsonFind(Event[i]).checkKey('_CODE')), "status": parseFloat(JsonFind(Event[i]).checkKey('_STATUS')), "datatime": _DateConvertionEvent(JsonFind(Event[i]).findValues('_TIME')._TIME)
                                            }
                                            if (parseInt(JsonFind(Event[i]).checkKey('_STATUS')) == 0) {
                                                obj.occ_vr = vr_str
                                                obj.occ_vy = vy_str
                                                obj.occ_vb = vb_str
                                                obj.occ_ir = ir_str
                                                obj.occ_iy = iy_str
                                                obj.occ_ib = ib_str
                                                obj.occ_kwh = kwh_str
                                                obj.value = kwh_str
                                                obj.occ_kvah = kvah_str
                                                obj.occ_pf_r = pf_r_str
                                                obj.occ_pf_y = pf_y_str
                                                obj.occ_pf_b = pf_b_str
                                            }
                                            else {
                                                obj.res_vr = vr_str
                                                obj.res_vy = vy_str
                                                obj.res_vb = vb_str
                                                obj.res_ir = ir_str
                                                obj.res_iy = iy_str
                                                obj.res_ib = ib_str
                                                obj.res_kwh = kwh_str
                                                obj.value = kwh_str
                                                obj.res_kvah = kvah_str
                                                obj.res_pf_r = pf_r_str
                                                obj.res_pf_y = pf_y_str
                                                obj.res_pf_b = pf_b_str
                                            }
                                            EventData.push(obj)
                                        }
                                    }
                                    else {
                                        if ((Math.sign(parseInt(JsonFind(Event[i]).checkKey('_CODE'))) != -1) && (parseInt(JsonFind(Event[i]).checkKey('_CODE')) != 0) && (parseInt(JsonFind(Event[i]).checkKey('_CODE')) != 76) && (parseFloat(JsonFind(Event[i]).checkKey('_STATUS')) != -1)) {
                                            EventData.push({
                                                "code": parseInt(JsonFind(Event[i]).checkKey('_CODE')),
                                                "status": parseFloat(JsonFind(Event[i]).checkKey('_STATUS')),
                                                "datatime": _DateConvertionEvent(JsonFind(Event[i]).findValues('_TIME')._TIME),
                                                "occ_vr": null,
                                                "occ_vy": null,
                                                "occ_vb": null,
                                                "occ_ir": null,
                                                "occ_iy": null,
                                                "occ_ib": null,
                                                "occ_pf_r": null,
                                                "occ_pf_y": null,
                                                "occ_pf_b": null,
                                                "occ_kwh": null,
                                                "occ_kvah": null,
                                                "res_vr": null,
                                                "res_vy": null,
                                                "res_vb": null,
                                                "res_ir": null,
                                                "res_iy": null,
                                                "res_ib": null,
                                                "res_kwh": null,
                                                "res_kvah": null,
                                                "res_pf_r": null,
                                                "res_pf_y": null,
                                                "res_pf_b": null,
                                                "value": null
                                            })
                                        }
                                    }
                                }
                            }
                            else {
                                if (JsonFind(Event[i]).findValues('_DURATION')._DURATION != undefined) {
                                    var timePeriod = JsonFind(Event[i]).findValues('_DURATION')._DURATION.split(/:/);
                                    if (isNaN(parseInt(JsonFind(Event[i]).checkKey('_STATUS'))) != true) {
                                        arrstatus.push(JsonFind(Event[i]).checkKey('_CODE'))
                                        var Snapshot = JsonFind(Event[i]).checkKey('SNAPSHOT') || JsonFind(Event[i]).checkKey('snapshot');
                                        if (Snapshot) {
                                            var addDay = moment(_DateConvertionEvent(JsonFind(Event[i - 1]).findValues('_TIME')._TIME)).add(timePeriod[0], 'days');
                                            var addhour = moment(addDay).add(timePeriod[1], 'hours');
                                            var addmins = moment(addhour).add(timePeriod[2], 'minutes');
                                            var addSec = moment(addmins).add(timePeriod[3], 'seconds');

                                            if (new Date(addSec) > _DateConvertionEvent(Node1.D1.G2)) {
                                                var ExpDate = moment(_DateConvertionEvent(JsonFind(Event[i - 1]).findValues('_TIME')._TIME)).add(timePeriod[1], 'hours') //(convert date to milliseconds using _DateConvertionEvent)
                                                var ExpMin = moment(ExpDate).add(timePeriod[2], 'minutes')
                                                var addSec = moment(ExpMin).add(timePeriod[2], 'seconds')
                                            }
                                            //dur vr
                                            for (var d5jCon = 0; d5jCon < config[0][0].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][0].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_vr_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            // dur vy
                                            for (var d5jCon = 0; d5jCon < config[0][1].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][1].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_vy_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            //dur vb
                                            for (var d5jCon = 0; d5jCon < config[0][2].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][2].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_vb_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            //dur ir
                                            for (var d5jCon = 0; d5jCon < config[0][4].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][4].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_ir_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            //dur iy
                                            for (var d5jCon = 0; d5jCon < config[0][5].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][5].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_iy_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            //dur ib
                                            for (var d5jCon = 0; d5jCon < config[0][6].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][6].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_ib_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            //dur kwh
                                            for (var d5jCon = 0; d5jCon < config[0][8].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][8].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_kwh_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            //dur kvah
                                            for (var d5jCon = 0; d5jCon < config[0][9].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][9].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_kvah_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            //dur pf_r
                                            for (var d5jCon = 0; d5jCon < config[0][10].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][10].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_pf_r_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            //dur pf_y
                                            for (var d5jCon = 0; d5jCon < config[0][11].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][11].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_pf_y_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            //dur pf_b
                                            for (var d5jCon = 0; d5jCon < config[0][12].input_code.length; d5jCon++) {
                                                for (var jcon in Snapshot) {
                                                    if (Snapshot[jcon]._PARAMCODE.includes(config[0][12].input_code[d5jCon].code)) {
                                                        if (isNaN(parseFloat(Snapshot[jcon]._VALUE)) != true) {
                                                            dur_pf_b_str = parseFloat(Snapshot[jcon]._VALUE)
                                                        }
                                                    }
                                                }
                                            }
                                            if ((Math.sign(parseInt(JsonFind(Event[i]).checkKey('_CODE'))) != -1) && (parseInt(JsonFind(Event[i]).checkKey('_CODE')) != 0) && (parseInt(JsonFind(Event[i]).checkKey('_CODE')) != 76) && (parseFloat(JsonFind(Event[i]).checkKey('_STATUS')) != -1)) {
                                                var obj = {}
                                                obj = {
                                                    "code": parseInt(JsonFind(Event[i]).checkKey('_CODE')),
                                                    "status": parseFloat(JsonFind(Event[i]).checkKey('_STATUS')),
                                                    "datatime": new Date(addSec),
                                                }
                                                if (parseInt(JsonFind(Event[i]).checkKey('_STATUS')) == 0) {
                                                    obj.occ_vr = dur_vr_str
                                                    obj.occ_vy = dur_vy_str
                                                    obj.occ_vb = dur_vb_str
                                                    obj.occ_ir = dur_ir_str
                                                    obj.occ_iy = dur_iy_str
                                                    obj.occ_ib = dur_ib_str
                                                    obj.occ_ib = dur_kwh_str
                                                    obj.value = dur_kwh_str
                                                    obj.occ_kvah = dur_kvah_str
                                                    obj.occ_pf_r = dur_pf_r_str
                                                    obj.occ_pf_y = dur_pf_y_str
                                                    obj.occ_pf_b = dur_pf_b_str
                                                }
                                                else {
                                                    obj.res_vr = dur_vr_str
                                                    obj.res_vy = dur_vy_str
                                                    obj.res_vb = dur_vb_str
                                                    obj.res_ir = dur_ir_str
                                                    obj.res_iy = dur_iy_str
                                                    obj.res_ib = dur_ib_str
                                                    obj.res_kwh = dur_kwh_str
                                                    obj.value = dur_kwh_str
                                                    obj.res_kvah = dur_kvah_str
                                                    obj.res_pf_r = dur_pf_r_str
                                                    obj.res_pf_y = dur_pf_y_str
                                                    obj.res_pf_b = dur_pf_b_str
                                                }
                                            }
                                            EventData.push(obj)
                                        }
                                        else {
                                            if ((Math.sign(parseInt(JsonFind(Event[i]).checkKey('_CODE'))) != -1) && (parseInt(JsonFind(Event[i]).checkKey('_CODE')) != 0) && (parseInt(JsonFind(Event[i]).checkKey('_CODE')) != 76) && (parseFloat(JsonFind(Event[i]).checkKey('_STATUS')) != -1)) {
                                                var addDay = moment(_DateConvertionEvent(JsonFind(Event[i - 1]).findValues('_TIME')._TIME)).add(timePeriod[0], 'days');
                                                var addhour = moment(addDay).add(timePeriod[1], 'hours');
                                                var addmins = moment(addhour).add(timePeriod[2], 'minutes');
                                                EventData.push({
                                                    "code": parseInt(JsonFind(Event[i]).checkKey('_CODE')),
                                                    "status": parseFloat(JsonFind(Event[i]).checkKey('_STATUS')),
                                                    "datatime": new Date(addmins),
                                                    "occ_vr": null,
                                                    "occ_vy": null,
                                                    "occ_vb": null,
                                                    "occ_ir": null,
                                                    "occ_iy": null,
                                                    "occ_ib": null,
                                                    "occ_kwh": null,
                                                    "occ_kvah": null,
                                                    "occ_pf_r": null,
                                                    "occ_pf_y": null,
                                                    "occ_pf_b": null,
                                                    "res_vr": null,
                                                    "res_vy": null,
                                                    "res_vb": null,
                                                    "res_ir": null,
                                                    "res_iy": null,
                                                    "res_ib": null,
                                                    "res_kwh": null,
                                                    "res_kvah": null,
                                                    "res_pf_r": null,
                                                    "res_pf_y": null,
                                                    "res_pf_b": null,
                                                    "value": null
                                                })
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    dataproc_det.D5 = "Not Found"
                }

                D5Data = unique(arrstatus) // get unique of Event code
                var newEventData = EventData

                for (var iloop = 0; iloop < D5Data.length; iloop++) {
                    var uniqueEvent = duplicateRemove(newEventData) //removing duplicate in array of objects
                    var finalSplit = _dataSplit(D5Data[iloop], uniqueEvent)
                    var sortedData = sortBy(finalSplit, item => new Date(item.datatime)) //sort based on date

                    for (var il = 0; il < sortedData.length; il++) {
                        if (sortedData[0].status == 0) { //case 0 *(occured restored)
                            if (sortedData[parseInt(il) + 1] != undefined && sortedData[parseInt(il) + 1].status == 1) { //case 0 1(occured restrored)
                                var consumption = sortedData[parseInt(il) + 1].value - sortedData[parseInt(il)].value; //consumption=occured value-restored value
                                if (isNaN(consumption)) {
                                    consumption = 0.00
                                }
                                var date2 = moment(sortedData[parseInt(il) + 1].datatime)
                                var date1 = moment(sortedData[parseInt(il)].datatime)
                                var days = date2.diff(date1);
                                if (Math.sign(consumption.toFixed(2)) != -1 && isNaN(consumption.toFixed(2)) != true) {
                                    Overalldata.push({
                                        "month_year": month_year,
                                        "hierarchy_code": hierarchy_code,
                                        "meterId": meter_id,
                                        "date": moment(sortedData[parseInt(il)].datatime).format(),
                                        "eventcode": sortedData[parseInt(il)].code,
                                        "occured": moment(sortedData[parseInt(il)].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                        "restored": moment(sortedData[parseInt(il) + 1].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                        "duration": convertMS(days),
                                        "consumption_value": consumption.toFixed(2),
                                        "event_name": EventMapping(sortedData[parseInt(il)].code, eventmapping),
                                        "vr_occ": (sortedData[parseInt(il)].occ_vr),
                                        "vy_occ": (sortedData[parseInt(il)].occ_vy),
                                        "vb_occ": (sortedData[parseInt(il)].occ_vb),
                                        "ir_occ": (sortedData[parseInt(il)].occ_ir),
                                        "iy_occ": (sortedData[parseInt(il)].occ_iy),
                                        "ib_occ": (sortedData[parseInt(il)].occ_ib),
                                        "pf_r_occ": (sortedData[parseInt(il)].occ_pf_r),
                                        "pf_y_occ": (sortedData[parseInt(il)].occ_pf_y),
                                        "pf_b_occ": (sortedData[parseInt(il)].occ_pf_b),
                                        "kwh_occ": (sortedData[parseInt(il)].occ_kwh),
                                        "kvah_occ": (sortedData[parseInt(il)].occ_kvah),
                                        "vr_res": (sortedData[parseInt(il) + 1].res_vr),
                                        "vy_res": (sortedData[parseInt(il) + 1].res_vy),
                                        "vb_res": (sortedData[parseInt(il) + 1].res_vb),
                                        "ir_res": (sortedData[parseInt(il) + 1].res_ir),
                                        "iy_res": (sortedData[parseInt(il) + 1].res_iy),
                                        "ib_res": (sortedData[parseInt(il) + 1].res_ib),
                                        "pf_r_res": (sortedData[parseInt(il) + 1].res_pf_r),
                                        "pf_y_res": (sortedData[parseInt(il) + 1].res_pf_y),
                                        "pf_b_res": (sortedData[parseInt(il) + 1].res_pf_b),
                                        "kwh_res": (sortedData[parseInt(il) + 1].res_kwh),
                                        "kvah_res": (sortedData[parseInt(il) + 1].res_kvah)
                                    })
                                }
                                il++
                            }
                            else { //case 0 0(started with two consecutive zeros with different eventcode means not restored case)
                                var date2 = moment(_DateConvertionEvent(Node1.D1.G2))
                                var date1 = moment(sortedData[parseInt(il)].datatime)
                                var days = date2.diff(date1);
                                if (sortedData[il].status == 1) {
                                    Overalldata.push({
                                        "month_year": month_year,
                                        "hierarchy_code": hierarchy_code,
                                        "meterId": meter_id,
                                        "date": moment(sortedData[parseInt(il)].datatime).format(),
                                        "eventcode": sortedData[parseInt(il)].code,
                                        "occured": moment(sortedData[parseInt(il)].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                        "restored": moment(sortedData[parseInt(il)].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                        "duration": "0 days 0:0:0",
                                        "consumption_value": "Forced",
                                        "event_name": EventMapping(sortedData[parseInt(il)].code, eventmapping),
                                        "vr_occ": null,
                                        "vy_occ": null,
                                        "vb_occ": null,
                                        "ir_occ": null,
                                        "iy_occ": null,
                                        "ib_occ": null,
                                        "pf_r_occ": null,
                                        "pf_y_occ": null,
                                        "pf_b_occ": null,
                                        "kwh_occ": null,
                                        "kvah_occ": null,
                                        "vr_res": (sortedData[parseInt(il)].res_vr),
                                        "vy_res": (sortedData[parseInt(il)].res_vy),
                                        "vb_res": (sortedData[parseInt(il)].res_vb),
                                        "ir_res": (sortedData[parseInt(il)].res_ir),
                                        "iy_res": (sortedData[parseInt(il)].res_iy),
                                        "ib_res": (sortedData[parseInt(il)].res_ib),
                                        "pf_r_res": (sortedData[parseInt(il)].res_pf_r),
                                        "pf_y_res": (sortedData[parseInt(il)].res_pf_y),
                                        "pf_b_res": (sortedData[parseInt(il)].res_pf_b),
                                        "kwh_res": (sortedData[parseInt(il)].res_kwh),
                                        "kvah_res": (sortedData[parseInt(il)].res_kvah)
                                    })
                                }
                                else {
                                    Overalldata.push({
                                        "month_year": month_year,
                                        "hierarchy_code": hierarchy_code,
                                        "meterId": meter_id,
                                        "date": moment(sortedData[parseInt(il)].datatime).format(),
                                        "eventcode": sortedData[parseInt(il)].code,
                                        "occured": moment(sortedData[parseInt(il)].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                        "restored": "-",
                                        "duration": convertMS(days),
                                        "consumption_value": "Not Restored",
                                        "event_name": EventMapping(sortedData[parseInt(il)].code, eventmapping),
                                        "vr_occ": (sortedData[parseInt(il)].occ_vr),
                                        "vy_occ": (sortedData[parseInt(il)].occ_vy),
                                        "vb_occ": (sortedData[parseInt(il)].occ_vb),
                                        "ir_occ": (sortedData[parseInt(il)].occ_ir),
                                        "iy_occ": (sortedData[parseInt(il)].occ_iy),
                                        "ib_occ": (sortedData[parseInt(il)].occ_ib),
                                        "pf_r_occ": (sortedData[parseInt(il)].occ_pf_r),
                                        "pf_y_occ": (sortedData[parseInt(il)].occ_pf_y),
                                        "pf_b_occ": (sortedData[parseInt(il)].occ_pf_b),
                                        "kwh_occ": (sortedData[parseInt(il)].occ_kwh),
                                        "kvah_occ": (sortedData[parseInt(il)].occ_kvah),
                                        "vr_res": null,
                                        "vy_res": null,
                                        "vb_res": null,
                                        "ir_res": null,
                                        "iy_res": null,
                                        "ib_res": null,
                                        "pf_r_res": null,
                                        "pf_y_res": null,
                                        "pf_b_res": null,
                                        "kwh_res": null,
                                        "kvah_res": null
                                    })
                                }
                            }
                        }
                        else { //case 1(starting with restoration case means consumption_value=Forced,duration=restored time-restored time)
                            if (il == 0) { //checking case 1  in first position of loop
                                var date2 = moment(sortedData[parseInt(0)].datatime)
                                var date1 = moment(sortedData[parseInt(0)].datatime)
                                var days = date2.diff(date1);
                                Overalldata.push({
                                    "month_year": month_year,
                                    "hierarchy_code": hierarchy_code,
                                    "meterId": meter_id,
                                    "date": moment(sortedData[parseInt(0)].datatime).format(),
                                    "eventcode": sortedData[parseInt(0)].code,
                                    "occured": moment(sortedData[parseInt(0)].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                    "restored": moment(sortedData[parseInt(0)].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                    "duration": convertMS(days),
                                    "consumption_value": "Forced",
                                    "event_name": EventMapping(sortedData[parseInt(0)].code, eventmapping),
                                    "vr_occ": null,
                                    "vy_occ": null,
                                    "vb_occ": null,
                                    "ir_occ": null,
                                    "iy_occ": null,
                                    "ib_occ": null,
                                    "pf_r_occ": null,
                                    "pf_y_occ": null,
                                    "pf_b_occ": null,
                                    "kwh_occ": null,
                                    "kvah_occ": null,
                                    "vr_res": (sortedData[parseInt(il)].res_vr),
                                    "vy_res": (sortedData[parseInt(il)].res_vy),
                                    "vb_res": (sortedData[parseInt(il)].res_vb),
                                    "ir_res": (sortedData[parseInt(il)].res_ir),
                                    "iy_res": (sortedData[parseInt(il)].res_iy),
                                    "ib_res": (sortedData[parseInt(il)].res_ib),
                                    "pf_r_res": (sortedData[parseInt(il)].res_pf_r),
                                    "pf_y_res": (sortedData[parseInt(il)].res_pf_y),
                                    "pf_b_res": (sortedData[parseInt(il)].res_pf_b),
                                    "kwh_res": (sortedData[parseInt(il)].res_kwh),
                                    "kvah_res": (sortedData[parseInt(il)].res_kvah)
                                })
                            }
                            else {
                                if (sortedData[parseInt(il) + 1] != undefined && sortedData[parseInt(il) + 1].status == 1) {
                                    var consumption = sortedData[parseInt(il) + 1].value - sortedData[parseInt(il)].value;
                                    if (isNaN(consumption)) {
                                        consumption = 0.00
                                    }
                                    var date2 = moment(sortedData[parseInt(il) + 1].datatime)
                                    var date1 = moment(sortedData[parseInt(il)].datatime)
                                    var days = date2.diff(date1);
                                    if (Math.sign(consumption.toFixed(2)) != -1 && isNaN(consumption.toFixed(2)) != true) {
                                        Overalldata.push({
                                            "month_year": month_year,
                                            "hierarchy_code": hierarchy_code,
                                            "meterId": meter_id,
                                            "date": moment(sortedData[parseInt(il)].datatime).format(),
                                            "eventcode": sortedData[parseInt(il)].code,
                                            "occured": moment(sortedData[parseInt(il)].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                            "restored": moment(sortedData[parseInt(il) + 1].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                            "duration": convertMS(days),
                                            "consumption_value": consumption.toFixed(2),
                                            "event_name": EventMapping(sortedData[parseInt(il)].code, eventmapping),
                                            "vr_occ": (sortedData[parseInt(il)].occ_vr),
                                            "vy_occ": (sortedData[parseInt(il)].occ_vy),
                                            "vb_occ": (sortedData[parseInt(il)].occ_vb),
                                            "ir_occ": (sortedData[parseInt(il)].occ_ir),
                                            "iy_occ": (sortedData[parseInt(il)].occ_iy),
                                            "ib_occ": (sortedData[parseInt(il)].occ_ib),
                                            "pf_r_occ": (sortedData[parseInt(il)].occ_pf_r),
                                            "pf_y_occ": (sortedData[parseInt(il)].occ_pf_y),
                                            "pf_b_occ": (sortedData[parseInt(il)].occ_pf_b),
                                            "kwh_occ": (sortedData[parseInt(il)].occ_kwh),
                                            "kvah_occ": (sortedData[parseInt(il)].occ_kvah),
                                            "vr_res": (sortedData[parseInt(il) + 1].res_vr),
                                            "vy_res": (sortedData[parseInt(il) + 1].res_vy),
                                            "vb_res": (sortedData[parseInt(il) + 1].res_vb),
                                            "ir_res": (sortedData[parseInt(il) + 1].res_ir),
                                            "iy_res": (sortedData[parseInt(il) + 1].res_iy),
                                            "ib_res": (sortedData[parseInt(il) + 1].res_ib),
                                            "pf_r_res": (sortedData[parseInt(il) + 1].res_pf_r),
                                            "pf_y_res": (sortedData[parseInt(il) + 1].res_pf_y),
                                            "pf_b_res": (sortedData[parseInt(il) + 1].res_pf_b),
                                            "kwh_res": (sortedData[parseInt(il) + 1].res_kwh),
                                            "kvah_res": (sortedData[parseInt(il) + 1].res_kvah)
                                        })
                                    }
                                    il++
                                }
                                else {
                                    var date2 = moment(_DateConvertionEvent(Node1.D1.G2))
                                    var date1 = moment(sortedData[parseInt(il)].datatime)
                                    var days = date2.diff(date1);
                                    if (sortedData[il].status == 1) {
                                        Overalldata.push({
                                            "month_year": month_year,
                                            "hierarchy_code": hierarchy_code,
                                            "meterId": meter_id,
                                            "date": moment(sortedData[parseInt(il)].datatime).format(),
                                            "eventcode": sortedData[parseInt(il)].code,
                                            "occured": moment(sortedData[parseInt(il)].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                            "restored": moment(sortedData[parseInt(il)].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                            "duration": "0 days 0:0:0",
                                            "consumption_value": "Forced",
                                            "event_name": EventMapping(sortedData[parseInt(il)].code, eventmapping),
                                            "vr_occ": null,
                                            "vy_occ": null,
                                            "vb_occ": null,
                                            "ir_occ": null,
                                            "iy_occ": null,
                                            "ib_occ": null,
                                            "pf_r_occ": null,
                                            "pf_y_occ": null,
                                            "pf_b_occ": null,
                                            "kwh_occ": null,
                                            "kvah_occ": null,
                                            "vr_res": (sortedData[parseInt(il)].res_vr),
                                            "vy_res": (sortedData[parseInt(il)].res_vy),
                                            "vb_res": (sortedData[parseInt(il)].res_vb),
                                            "ir_res": (sortedData[parseInt(il)].res_ir),
                                            "iy_res": (sortedData[parseInt(il)].res_iy),
                                            "ib_res": (sortedData[parseInt(il)].res_ib),
                                            "pf_r_res": (sortedData[parseInt(il)].res_pf_r),
                                            "pf_y_res": (sortedData[parseInt(il)].res_pf_y),
                                            "pf_b_res": (sortedData[parseInt(il)].res_pf_b),
                                            "kwh_res": (sortedData[parseInt(il)].res_kwh),
                                            "kvah_res": (sortedData[parseInt(il)].res_kvah)
                                        })
                                    }
                                    else {
                                        if (Math.sign(convertMS(days) != -1)) {
                                            Overalldata.push({
                                                "month_year": month_year,
                                                "hierarchy_code": hierarchy_code,
                                                "meterId": meter_id,
                                                "date": moment(sortedData[parseInt(il)].datatime).format(),
                                                "eventcode": sortedData[parseInt(il)].code,
                                                "occured": moment(sortedData[parseInt(il)].datatime).format('DD-MM-YYYY HH:mm:ss'),
                                                "restored": "-",
                                                "duration": convertMS(days),
                                                "consumption_value": "Not Restored",
                                                "event_name": EventMapping(sortedData[parseInt(il)].code, eventmapping),
                                                "vr_occ": (sortedData[parseInt(il)].occ_vr),
                                                "vy_occ": (sortedData[parseInt(il)].occ_vy),
                                                "vb_occ": (sortedData[parseInt(il)].occ_vb),
                                                "ir_occ": (sortedData[parseInt(il)].occ_ir),
                                                "iy_occ": (sortedData[parseInt(il)].occ_iy),
                                                "ib_occ": (sortedData[parseInt(il)].occ_ib),
                                                "pf_r_occ": (sortedData[parseInt(il)].occ_pf_r),
                                                "pf_y_occ": (sortedData[parseInt(il)].occ_pf_y),
                                                "pf_b_occ": (sortedData[parseInt(il)].occ_pf_b),
                                                "kwh_occ": (sortedData[parseInt(il)].occ_kwh),
                                                "kvah_occ": (sortedData[parseInt(il)].occ_kvah),
                                                "vr_res": null,
                                                "vy_res": null,
                                                "vb_res": null,
                                                "ir_res": null,
                                                "iy_res": null,
                                                "ib_res": null,
                                                "pf_r_res": null,
                                                "pf_y_res": null,
                                                "pf_b_res": null,
                                                "kwh_res": null,
                                                "kvah_res": null
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                var uniqueEventName = Overalldata.map((value) => value.event_name).filter((value, index, Overalldata) => Overalldata.indexOf(value) == index);

                for (var uniqueName = 0; uniqueName < uniqueEventName.length; uniqueName++) {
                    var Overalldata_clear = ""
                    Overalldata_clear1 = groupBy(Overalldata, ['event_name'])[uniqueEventName[uniqueName]]
                    Overalldata_clear = sortBy(Overalldata_clear1, item => new Date(item.date))
                    unique_length = Overalldata_clear.length - 1
                    last_element = (Overalldata_clear[unique_length])

                    if (Overalldata_clear.length > 1) {
                        var occuredVal = Overalldata_clear[unique_length]['occured']
                        var restoredVal = Overalldata_clear[unique_length]['restored']
                        var eventcodeVal = Overalldata_clear[unique_length]['eventcode']
                        var consumptionVal = Overalldata_clear[unique_length]['consumption_value']
                        var dataRemoved = [];
                        for (var overall = 0; overall < Overalldata_clear.length; overall++) {
                            if ((Overalldata_clear[overall]['consumption_value'] != consumptionVal) || ((Overalldata_clear[overall]['occured'] != occuredVal) && (Overalldata_clear[overall]['restored'] != restoredVal))) {
                                dataRemoved.push(Overalldata_clear[overall])
                            }
                        }
                        for (var rem = 0; rem < dataRemoved.length; rem++) {
                            if (dataRemoved[rem]['consumption_value'] != "Not Restored") {
                                dataRemoved_last.push(dataRemoved[rem])
                            }
                        }
                    }
                    TotalValue = (JSON.parse(JSON.stringify(last_element)))
                    dataRemoved_last.push(TotalValue)
                }
                d5_finalformat = dataRemoved_last
                var sample = [];
                var incrementer = 100;
                if (d5_finalformat.length < incrementer) {
                    arraydatapush(d5_finalformat, ipAddr, Node1, AccessToken)
                }
                else {
                    for (var i = 0; i < d5_finalformat.length; i = i + incrementer) {
                        sample = [];
                        if (i < d5_finalformat.length && d5_finalformat.length > i + incrementer) {
                            for (var j = i; j < (i + incrementer); j++) {
                                sample.push(d5_finalformat[j])
                            }
                            arraydatapush(sample, ipAddr, Node1, AccessToken)
                        }
                    }
                    sample = [];
                    if (i - incrementer < d5_finalformat.length) {
                        for (var j = i - incrementer; j < (d5_finalformat.length - i) + i; j++) {
                            sample.push(d5_finalformat[j])
                        }
                        arraydatapush(sample, ipAddr, Node1, AccessToken)
                    }
                }
                resolve(dataproc_det);
            }
            else {
                dataproc_det.D5 = "Not Found"
                resolve(dataproc_det);
            }
        }
        catch (e) {
            dataproc_det.D5 = "Error"
            resolve(dataproc_det);
        }
    })
}

function arraydatapush(d5_finalformat, ipAddr, Node1, AccessToken) {

    var args = {
        data: d5_finalformat,
        headers: {
            "Content-Type": "application/json"
        }
    };

    client.post(ipAddr + "/api/d5s?access_token=" + AccessToken, args, function (data, res) {
    });
}

function _DateConvertionEvent(DateValueEvent) {

    var dateString = DateValueEvent,
        dateTimeParts = dateString.split(' '),
        timeParts = dateTimeParts[1].split(':'),
        dateParts = dateTimeParts[0].split('-'),
        D5Date;
    if (timeParts[2] == undefined) {
        timeParts[2] = "00"
    }
    if ((dateParts[0].length > 2) || (dateParts[1].length > 2) || (dateParts[2].length < 4) || (dateParts[2].length > 4)) {
        exception = "exception"
    }
    D5Date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
    return D5Date
}

function _dataSplit(D5Dataloop, newEventData) {

    var SpiltedArray = []
    for (var jloop = 0; jloop < newEventData.length; jloop++) {
        if (D5Dataloop == newEventData[jloop].code) {
            SpiltedArray.push(newEventData[jloop])
        }
    }
    return SpiltedArray;
}

function convertMS(milliseconds) {

    var day, hour, minute, seconds;
    seconds = Math.floor(milliseconds / 1000);
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;
    return day + " days " + hour + ":" + minute + ":" + seconds
}

function EventMapping(eventcode, eventmapping) {
    for (var i = 0; i < eventmapping.length; i++) {
        if (eventcode.toString() == (eventmapping[i].code)) {
            return eventmapping[i].name;
        }

    }
}

function duplicateRemove(arr) {

    var result = arr.reduce((unique, o) => {
        if (!unique.some(obj => obj.datatime.getTime() == o.datatime.getTime() && obj.code === o.code && obj.status === o.status)) {
            unique.push(o);
        }
        return unique;
    }, []);

    return result;
}

module.exports = { callfiveFunction: callfiveFunction };