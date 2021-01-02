const global = require("./global.js");
var PdfPrinter = require('../src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');
var unique = require('array-unique');

function callreport_summary(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, crnt_dir) {

    return new Promise(function (resolve) {

        client.get(ipAddr + "/api/meters?access_token=" + AccessToken + "&filter[where][supply_cat]=" + supply_cat + "&filter[where][hierarchy_code][like]=" + hierarchy_code + "&filter[where][meter_status]=1", function (meter_data, meter_data_response, meter_data_err) {

            try {

                if (meter_data.length != 0) {

                    var month_uniq_meters = []
                    var meter_uniq = []
                    var month_fnl = []
                    var meter_fnl = []
                    var final_month_data = []
                    var meters_content = []


                    for (var i = 0; i < month_data.length; i++) {
                        month_uniq_meters.push(month_data[i]['P3'])
                    }

                    for (var m = 0; m < meter_data.length; m++) {
                        meter_uniq.push(meter_data[m]['subname'])
                    }

                    var month_uniq_meters_arry = unique(month_uniq_meters)
                    var meter_uniq_arry = unique(meter_uniq)

                    for (var u = 0; u < month_uniq_meters_arry.length; u++) {

                        var uniq = month_uniq_meters_arry[u]

                        var filterBy = { P3: [uniq] },
                            month_result = month_data.filter(function (o) {
                                return Object.keys(filterBy).every(function (k) {
                                    return filterBy[k].some(function (f) {
                                        return o[k] === f;
                                    });
                                });
                            });

                        month_fnl.push({ "report": month_result, "subdiv_name": month_result[0]['P3'], "division_name": month_result[0]['P2'], "cirle_name": month_result[0]['P1'] })
                    }

                    for (var v = 0; v < meter_uniq_arry.length; v++) {

                        var uniq_meter = meter_uniq_arry[v]

                        var filterBy = { subname: [uniq_meter] },
                            meter_result = meter_data.filter(function (o) {
                                return Object.keys(filterBy).every(function (k) {
                                    return filterBy[k].some(function (f) {
                                        return o[k] === f;
                                    });
                                });
                            });

                        meter_fnl.push({ "report": meter_result, "subdiv_name": meter_result[0]['subname'] })
                    }

                    for (var mtr = 0; mtr < meter_fnl.length; mtr++) {
                        meters_content.push({ "meter_count": meter_fnl[mtr]["report"].length, "subdivision": meter_fnl[mtr]["subdiv_name"] })
                    }

                    for (var a = 0; a < month_fnl.length; a++) {

                        var P6 = 0
                        var P42 = 0
                        var P43 = 0
                        var P44 = 0
                        var md_cd = 0
                        var P69 = 0
                        var P68 = 0
                        var nl_bo = 0
                        var P71 = 0
                        var P72 = 0

                        var subdiv_name = (month_fnl[a]["subdiv_name"])
                        var division_name = month_fnl[a]["division_name"]
                        var cirle_name = month_fnl[a]["cirle_name"]

                        for (var mtr_cnt = 0; mtr_cnt < meters_content.length; mtr_cnt++) {
                            if (subdiv_name == meters_content[mtr_cnt]["subdivision"])
                                var meter_count = meters_content[mtr_cnt]["meter_count"]
                        }

                        for (var b = 0; b < month_fnl[a]["report"].length; b++) {

                            P6 = P6 + 1

                            if ((month_fnl[a]["report"][b]["P42"]) != null) {
                                P42 = (parseFloat(month_fnl[a]["report"][b]["P42"])) + 1
                            }

                            if ((month_fnl[a]["report"][b]["P43"]) != null) {
                                P43 = (parseFloat(month_fnl[a]["report"][b]["P43"])) + 1
                            }

                            if ((month_fnl[a]["report"][b]["P44"]) != null) {
                                if (parseFloat(month_fnl[a]["report"][b]["P44"]) < 0.9)
                                    P44 = P44 + 1
                            }

                            if ((month_fnl[a]["report"][b]["P55"] != null) & (month_fnl[a]["report"][b]["P48"] != null) & (month_fnl[a]["report"][b]["P14"] != null)) {
                                if ((parseFloat(month_fnl[a]["report"][b]["P55"]) > 100) || (parseFloat(month_fnl[a]["report"][b]["P48"])) > (parseFloat(month_fnl[a]["report"][b]["P14"])))
                                    md_cd = md_cd + 1
                            }

                            if ((month_fnl[a]["report"][b]["P71"]) != null) {
                                P71 = parseInt(month_fnl[a]["report"][b]["P71"]) + 1
                            }

                            if ((month_fnl[a]["report"][b]["P72"]) != null) {
                                P72 = parseInt(month_fnl[a]["report"][b]["P72"]) + 1
                            }

                            if ((month_fnl[a]["report"][b]["P61"]) != null & (month_fnl[a]["report"][b]["P61"]) != null) {

                                value = parseFloat(month_fnl[a]["report"][b]["P61"]) + parseFloat(month_fnl[a]["report"][b]["P61"])

                                if (value > 10) {
                                    nl_bo = nl_bo + 1
                                }
                            }

                            if ((month_fnl[a]["report"][b]["P69"]) != null & parseInt(month_fnl[a]["report"][b]["P69"]) > parseInt(129600)) {
                                P69 = P69 + 1
                            }

                            if ((month_fnl[a]["report"][b]["P68"]) != null) {
                                P68 = P68 + 1
                            }
                        }

                        final_month_data.push({
                            "cirle": cirle_name,
                            "division": division_name,
                            "subdivision": subdiv_name,
                            "P6": P6,
                            "P42": P42,
                            "P43": P43,
                            "P44": P44,
                            "md_cd": md_cd,
                            "P71": P71,
                            "P72": P72,
                            "nl_bo": nl_bo,
                            "P68": P68,
                            "P69": P69,
                            "meter_count": meter_count
                        })
                    }

                    if (final_month_data.length != 0) {

                        final_month_data.sort(function (a, b) {
                            if (a.subdivision < b.subdivision) { return -1; }
                            if (a.subdivision > b.subdivision) { return 1; }
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

                        table_format.push({ text: 'Summary Report', style: 'header' })
                        table_format.push({
                            style: 'tableExample',
                            layout: 'noBorders',
                            table: {
                                widths: ['*', '*', '*', '*'],
                                body: [
                                    [{ text: 'Report Month & Year', style: 'contentHeader' }, month_year, { text: 'Circle Name', style: 'contentHeader' }, cirle_name]
                                ]
                            }
                        })

                        table_rows.push([{ rowSpan: 2, text: 'SI No', style: 'tableHeader' }, { rowSpan: 2, text: 'Division', style: 'tableHeader' },
                        { rowSpan: 2, text: 'Sub Division', style: 'tableHeader' }, { rowSpan: 2, text: 'Total No of Consumers', style: 'tableHeader' },
                        { rowSpan: 2, text: 'No of Consumers Reported', style: 'tableHeader' }, { rowSpan: 2, text: 'Total Units (kWh)', style: 'tableHeader' },
                        { rowSpan: 2, text: 'Total Units (kVAh)', style: 'tableHeader' }, { colSpan: 7, text: ' Consumer Count ', style: 'tableHeader' },
                        { text: 'MD > CD', style: 'tableHeader' }, { text: 'Persisting Event', style: 'tableHeader' },
                        { text: 'Tamper Full', style: 'tableHeader' }, { text: 'PT Event', style: 'tableHeader' },
                        { text: 'CT Event', style: 'tableHeader' }, { text: 'No Load & Blackout Status > 10%', style: 'tableHeader' }])

                        table_rows.push([{}, {}, {}, {}, {}, {}, {},
                        { text: ' PF < 0.9', style: 'tableHeader' }, { text: 'MD > CD', style: 'tableHeader' },
                        { text: 'Persisting Event', style: 'tableHeader' }, { text: 'Tamper Full', style: 'tableHeader' },
                        { text: 'PT Event', style: 'tableHeader' }, { text: 'CT Event', style: 'tableHeader' },
                        { text: 'No Load & Blackout Status > 10%', style: 'tableHeader' }])

                        for (var fnl = 0; fnl < final_month_data.length; fnl++) {

                            table_rows.push([{ text: fnl + 1, style: 'tableRows' }, { text: final_month_data[fnl]['division'], style: 'tableRows' },
                            { text: final_month_data[fnl]['subdivision'], style: 'tableRows' }, { text: final_month_data[fnl]['meter_count'], style: 'tableRows' },
                            { text: (final_month_data[fnl]['P6']), style: 'tableRows_len' }, { text: final_month_data[fnl]['P42'], style: 'tableRows' },
                            { text: final_month_data[fnl]['P43'], style: 'tableRows' }, { text: final_month_data[fnl]['P44'], style: 'tableRows' },
                            { text: final_month_data[fnl]['md_cd'], style: 'tableRows' }, { text: final_month_data[fnl]['P68'], style: 'tableRows' },
                            { text: final_month_data[fnl]['P69'], style: 'tableRows' }, { text: final_month_data[fnl]['P72'], style: 'tableRows' },
                            { text: final_month_data[fnl]['P71'], style: 'tableRows' }, { text: final_month_data[fnl]['nl_bo'], style: 'tableRows' }])
                        }

                        table_format.push({
                            style: 'tableExample',
                            layout: layout,
                            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
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
                                    bold: false,
                                    noWrap: false
                                },
                                tableRows: {
                                    margin: [0, 0, 0, 0],
                                    fontSize: 8,
                                    color: 'black',
                                    alignment: 'center',
                                    bold: false,
                                    noWrap: false
                                }
                            },
                            defaultStyle: {
                            }
                        };

                        process.chdir(crnt_dir + "/PDF/" + month_year + "/")

                        if (!fs.existsSync(invoked_date)) {
                            fs.mkdirSync(invoked_date);
                            process.chdir(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/")
                        }
                        else {
                            process.chdir(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/")
                        }

                        var pdfDoc = printer.createPdfKitDocument(docDefinition);
                        pdfDoc.pipe(fs.createWriteStream(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/" + supply_cat + "_Summary_Report.pdf"));
                        pdfDoc.end();

                        global.status.cnt = global.status.cnt - 1
                        console.log("Summary Over : " + global.status.cnt)

                        if (global.status.cnt == 0) {
                            updateApi(AccessToken, ipAddr, invoked_date)
                        }
                    }
                    else {
                        global.status.cnt = global.status.cnt - 1
                        console.log("Summary Over : " + global.status.cnt)

                        if (global.status.cnt == 0) {
                            updateApi(AccessToken, ipAddr, invoked_date)
                        }
                    }
                }
                else {
                    global.status.cnt = global.status.cnt - 1
                    console.log("Summary Over : " + global.status.cnt)

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

module.exports = { callreport_summary: callreport_summary };