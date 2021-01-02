const global = require("./global.js");
var PdfPrinter = require('../src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');

function callreport_tamper(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, filepath, subdiv_name) {

    return new Promise(function (resolve) {

        var dm = month_data

        client.get(ipAddr + "/api/events?access_token=" + AccessToken + "&filter[where][hierarchy_code][like]=" + hierarchy_code + "&filter[where][month_year]=" + month_year, function (event_data, event_response, event_err) {

            try {

                if (event_data.length != 0) {

                    var merged = []
                    var max_len = []
                    var fnl_event_json = []
                    var counter = 0

                    max_len.push({ "data": dm, "len": dm.length })
                    max_len.push({ "data": event_data, "len": event_data.length })

                    max_len.sort(function compare(a, b) {
                        var A = a.len
                        var B = b.len
                        return B - A;
                    });

                    merged = merge_fun([max_len[0].data, max_len[1].data], 'hierarchy_code');

                    for (var i = 0; i < merged.length; i++) {
                        if (merged[i]['P6'] != undefined && merged[i]['event'] != undefined) {
                            fnl_event_json.push(merged[i])
                        }
                    }

                    if (fnl_event_json.length != 0) {

                        fnl_event_json.sort(function (a, b) {
                            if (a.hierarchy_code < b.hierarchy_code) { return -1; }
                            if (a.hierarchy_code > b.hierarchy_code) { return 1; }
                            return 0;
                        })

                        var layout = {
                            hLineWidth: function (i, node) {
                                return 0.7;
                            },
                            vLineWidth: function (i, node) {
                                return 0.7;
                            },
                        }

                        var printer = new PdfPrinter(fonts);
                        var table_format = []
                        var table_rows = []

                        table_format.push({ text: 'Tamper Report', style: 'header' })
                        table_format.push({
                            style: 'tableExample',
                            layout: 'noBorders',
                            table: {
                                widths: ['*', '*', '*', '*'],
                                body: [
                                    [{ text: 'Report Month & Year', style: 'contentHeader' }, month_year, { text: 'Circle Name', style: 'contentHeader' }, fnl_event_json[0]['P1']],
                                    [{ text: 'Division Name', style: 'contentHeader' }, fnl_event_json[0]['P2'], { text: 'Sub Division Name', style: 'contentHeader' }, fnl_event_json[0]['P3']]
                                ]
                            }
                        })

                        table_rows.push([{ text: 'SI No', style: 'tableHeader' },
                        { text: 'Consumer No', style: 'tableHeader' },
                        { text: 'Consumer Name', style: 'tableHeader' }, { text: 'Meter No', style: 'tableHeader' },
                        { text: 'Tamper Events Recorded Upto Current Month No', style: 'tableHeader' },
                        { text: 'Tamper Events Recorded During Current Month No', style: 'tableHeader' },
                        { text: 'Meter Duration for Tamper Events Occured During Current Month', style: 'tableHeader' }])

                        for (var fnl = 0; fnl < fnl_event_json.length; fnl++) {

                            var event_record_upto_crt_mnth = fnl_event_json[fnl]['event'][0][0]["event_record_upto_crt_mnth"]
                            var event_record_crt_mnth = fnl_event_json[fnl]['event'][2][0]["event_record_crt_mnth"]
                            var duration = fnl_event_json[fnl]['event'][3][0]["summary_duration"]

                            if (event_record_upto_crt_mnth.length == 0)
                                event_record_upto_crt_mnth = ""

                            if (event_record_crt_mnth.length == 0)
                                event_record_crt_mnth = ""

                            if (duration.length == 0)
                                duration = ""

                            if (event_record_crt_mnth.length != 0 & duration.length != 0) {

                                counter = counter + 1

                                table_rows.push([{ text: counter, style: 'tableRows' },
                                { text: fnl_event_json[fnl]['P4'], style: 'tableRows' },
                                { text: (fnl_event_json[fnl]["P5"]).substring(0, 25), style: 'tableRows_len' }, { text: fnl_event_json[fnl]['P6'], style: 'tableRows' },
                                { text: (event_record_upto_crt_mnth).toString(), style: 'tableRows' }, { text: event_record_crt_mnth.toString(), style: 'tableRows' },
                                { text: duration.toString(), style: 'tableRows' }])
                            }
                        }

                        table_format.push({
                            style: 'tableExample',
                            layout: layout,
                            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                            table: {
                                headerRows: 1,
                                dontBreakRows: true,
                                body: table_rows
                            }
                        })

                        var docDefinition = {
                            content: table_format,
                            pageOrientation: 'landscape',
                            pageMargins: [20, 40, 20, 40],
                            styles: {
                                header: {
                                    fontSize: 18,
                                    bold: true,
                                    margin: [0, 5, 0, 10],
                                    alignment: 'center'
                                },
                                tableExample: {
                                    margin: [0, 5, 0, 15]
                                },
                                contentHeader: {
                                    bold: true,
                                    fontSize: 12,
                                    color: 'black',
                                    alignment: 'left'
                                },
                                tableHeader: {
                                    bold: true,
                                    fontSize: 10,
                                    color: 'black',
                                    alignment: 'center'
                                },
                                tableRows_len: {
                                    margin: [0, 0, 0, 0],
                                    fontSize: 8,
                                    color: 'black',
                                    alignment: 'left',
                                    bold: true,
                                    noWrap: false
                                },
                                tableRows: {
                                    margin: [0, 0, 0, 0],
                                    fontSize: 8,
                                    color: 'black',
                                    alignment: 'center',
                                    bold: true,
                                    noWrap: false
                                }
                            },
                            defaultStyle: {
                            }
                        };

                        process.chdir(filepath)

                        if (!fs.existsSync(invoked_date)) {
                            fs.mkdirSync(invoked_date);
                            process.chdir(filepath + invoked_date + "/")
                        }
                        else {
                            process.chdir(filepath + invoked_date + "/")
                        }

                        if (!fs.existsSync(subdiv_name)) {
                            fs.mkdirSync(subdiv_name);
                            process.chdir(filepath + invoked_date + "/" + subdiv_name + "/")
                        }
                        else {
                            process.chdir(filepath + invoked_date + "/" + subdiv_name + "/")
                        }

                        var pdfDoc = printer.createPdfKitDocument(docDefinition);
                        pdfDoc.pipe(fs.createWriteStream(filepath + invoked_date + "/" + subdiv_name + "/" + supply_cat + "_Tamper_Report.pdf"));
                        pdfDoc.end();

                        global.status.cnt = global.status.cnt - 1
                        console.log("Tamper Over : " + global.status.cnt)

                        if (global.status.cnt == 0) {
                            updateApi(AccessToken, ipAddr, invoked_date)
                        }
                    }
                    else {
                        global.status.cnt = global.status.cnt - 1
                        console.log("Tamper Over : " + global.status.cnt)

                        if (global.status.cnt == 0) {
                            updateApi(AccessToken, ipAddr, invoked_date)
                        }
                    }
                }
                else {
                    global.status.cnt = global.status.cnt - 1
                    console.log("Tamper Over : " + global.status.cnt)

                    if (global.status.cnt == 0) {
                        updateApi(AccessToken, ipAddr, invoked_date)
                    }
                }
            }
            catch (e) {

                client.get(ipAddr + "/api/pdfprocesses?access_token=" + AccessToken + "&filter[where][invoked_date]=" + invoked_date, function (pdf_data, pdf_response, pdf_err) {

                    var args_pdfproc = {
                        data: {
                            status: "error",
                        },
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }

                    client.post(ipAddr + "/api/pdfprocesses/update?where[id]=" + pdf_data[0].id + "&access_token=" + AccessToken, args_pdfproc, function (pdfproc_update, resp) {
                        console.log("Error Update : " + resp.statusCode)
                    })
                })
            }
        })
    })
}

var updateApi = function (AccessToken, ipAddr, invoked_date) {

    client.get(ipAddr + "/api/pdfprocesses?access_token=" + AccessToken + "&filter[where][invoked_date]=" + invoked_date, function (pdf_data, pdf_response, pdf_err) {

        var args_pdfproc = {
            data: {
                status: "complete",
            },
            headers: {
                "Content-Type": "application/json"
            }
        }

        client.post(ipAddr + "/api/pdfprocesses/update?where[id]=" + pdf_data[0].id + "&access_token=" + AccessToken, args_pdfproc, function (pdfproc_update, resp) {
            console.log("PDF Update : " + resp.statusCode)
        })
    })
}

function merge_fun(array, key) {

    var filtered = [], hash = Object.create(null);

    array.forEach(function (a) {
        a.forEach(function (o) {
            if (!hash[o[key]]) {
                hash[o[key]] = {};
                filtered.push(hash[o[key]]);
            }
            Object.keys(o).forEach(function (k) {
                hash[o[key]][k] = o[k];
            });
        });
    });
    return filtered;
}

module.exports = { callreport_tamper: callreport_tamper };