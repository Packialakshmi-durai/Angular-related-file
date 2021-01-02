const global = require("./global.js");
var PdfPrinter = require('../src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');

function callreport_power_off_duration(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, crnt_dir) {

	return new Promise(function (resolve) {

		var dm_all = month_data

		client.get(ipAddr + "/api/consumers?access_token=" + AccessToken + "&filter[where][hierarchy_code][like]=" + hierarchy_code, function (cons_data, cons_response, cons_err) {

			try {

				if (cons_data.length != 0 && dm_all.length != 0) {

					var merged = ""
					var max_len = []
					var dm = []

					for (var d = 0; d < dm_all.length; d++) {
						dm_all[d]['meterno_make'] = dm_all[d]['P6'] + "_" + dm_all[d]['P8']
					}

					for (var c = 0; c < cons_data.length; c++) {
						cons_data[c]['meterno_make'] = cons_data[c]['meter_no'] + "_" + cons_data[c]['make_code']
					}

					max_len.push({ "data": dm_all, "len": dm_all.length })
					max_len.push({ "data": cons_data, "len": cons_data.length })

					max_len.sort(function compare(a, b) {
						var A = a.len
						var B = b.len
						return B - A;
					});

					merged = merge([max_len[0].data, max_len[1].data], 'meterno_make');

					for (var i = 0; i < merged.length; i++) {
						if (merged[i]['P3'] != undefined && merged[i]['meter_no'] != undefined) {
							dm.push(merged[i])
						}
					}

					if (dm != undefined && dm.length != 0) {

						dm.sort(function (a, b) {
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

						table_format.push({ text: 'Power Off Duration Report', style: 'header' })
						table_format.push({
							style: 'tableExample',
							layout: 'noBorders',
							table: {
								widths: ['*', '*', '*', '*'],
								body: [
									[{ text: 'Report Month & Year', style: 'contentHeader' }, month_year, { text: 'Circle Name', style: 'contentHeader' }, dm[0]['P1']]
								]
							}
						})

						table_rows.push([{ text: 'SI No', style: 'tableHeader' }, { text: 'Division', style: 'tableHeader' },
						{ text: 'Sub Division', style: 'tableHeader' }, { text: 'Consumer No', style: 'tableHeader' },
						{ text: 'Consumer Name', style: 'tableHeader' }, { text: 'Account No', style: 'tableHeader' },
						{ text: 'Binder No', style: 'tableHeader' }, { text: 'Meter No', style: 'tableHeader' },
						{ text: 'Category', style: 'tableHeader' }, { text: 'No of Days', style: 'tableHeader' }])

						for (var i = 0; i < dm.length; i++) {

							table_rows.push([{ text: i + 1, style: 'tableRows' }, { text: dm[i]['P2'], style: 'tableRows' },
							{ text: dm[i]['P3'], style: 'tableRows' }, { text: dm[i]['P4'], style: 'tableRows' },
							{ text: (dm[i]['P5']).substring(0, 25), style: 'tableRows_len' }, { text: dm[i]['acc_no'], style: 'tableRows' },
							{ text: dm[i]['binder_no'], style: 'tableRows' }, { text: dm[i]['P6'], style: 'tableRows' },
							{ text: dm[i]['P12'], style: 'tableRows' }, { text: dm[i]['P41'], style: 'tableRows' }])
						}

						table_format.push({
							style: 'tableExample',
							layout: layout,
							widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
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
									fontSize: 11,
									color: 'black',
									alignment: 'center'
								},
								tableRows_len: {
									margin: [0, 0, 0, 0],
									fontSize: 10,
									color: 'black',
									alignment: 'left',
									bold: false,
									noWrap: false
								},
								tableRows: {
									margin: [0, 0, 0, 0],
									fontSize: 10,
									color: 'black',
									alignment: 'center',
									bold: false,
									noWrap: true
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
						pdfDoc.pipe(fs.createWriteStream(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/" + supply_cat + "_Power_off_Duration_Report.pdf"));
						pdfDoc.end();

						global.status.cnt = global.status.cnt - 1
						console.log("Power Off Duration Over : " + global.status.cnt)

						if (global.status.cnt == 0) {
							updateApi(AccessToken, ipAddr, invoked_date)
						}
					}
					else {
						global.status.cnt = global.status.cnt - 1
						console.log("Power Off Duration Over : " + global.status.cnt)

						if (global.status.cnt == 0) {
							updateApi(AccessToken, ipAddr, invoked_date)
						}
					}
				}
				else {
					global.status.cnt = global.status.cnt - 1
					console.log("Power Off Duration Over : " + global.status.cnt)

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

module.exports = { callreport_power_off_duration: callreport_power_off_duration };