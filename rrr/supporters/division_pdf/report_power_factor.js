const global = require("./global.js");
var PdfPrinter = require('../src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');

function callreport_power_factor(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name) {

	return new Promise(function (resolve) {

		try {

			var dm_all = month_data

			var dm = []

			for (var d = 0; d < dm_all.length; d++) {
				if (dm_all[d]['P63'] != null && dm_all[d]['P64'] != null && dm_all[d]['P65'] != null) {
					dm.push(dm_all[d])
				}
			}

			for (var fltr = 0; fltr < dm.length; fltr++) {
				if (dm[fltr]["P44"] < 0.9 && dm[fltr]["P44"] != null) {
					dm[fltr]["P44_1"] = "Yes"
				}
				else if (dm[fltr]["P44"] == null) {
					dm[fltr]["P44_1"] = "-"
				}
				else {
					dm[fltr]["P44_1"] = "No"
				}
			}

			if (dm.length != 0) {

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

				table_format.push({ text: 'Low Power Factor Status Report', style: 'header' })
				table_format.push({
					style: 'tableExample',
					layout: 'noBorders',
					table: {
						widths: ['*', '*', '*', '*'],
						body: [
							[{ text: 'Report Month & Year', style: 'contentHeader' }, month_year, { text: 'Circle Name', style: 'contentHeader' }, dm[0]['P1']],
							[{ text: 'Division Name', style: 'contentHeader' }, dm[0]['P2'], {}, {}]
						]
					}
				})

				table_rows.push([{ text: 'SI No', style: 'tableHeader' },
				{ text: 'Sub Division', style: 'tableHeader' }, { text: 'Consumer No', style: 'tableHeader' },
				{ text: 'Consumer Name', style: 'tableHeader' }, { text: 'Meter No', style: 'tableHeader' },
				{ text: 'CD', style: 'tableHeader' }, { text: 'MF', style: 'tableHeader' },
				{ text: 'PF < 0.5 - Slot %', style: 'tableHeader' }, { text: 'PF 0.5 - 0.7 Slot %', style: 'tableHeader' },
				{ text: 'PF > 0.7', style: 'tableHeader' }, { text: 'Monthly PF', style: 'tableHeader' },
				{ text: 'Monthly PF < 0.9', style: 'tableHeader' }])

				for (var i = 0; i < dm.length; i++) {

					var cd = ""
					var mf = ""
					var pf_1 = ""
					var pf_2 = ""
					var pf_3 = ""
					var pf = ""

					if (dm[i]['P14'] != null)
						cd = parseFloat(dm[i]['P14'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P15'] != null)
						mf = parseFloat(dm[i]['P15'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P63'] != null)
						pf_1 = parseFloat(dm[i]['P63'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P64'] != null)
						pf_2 = parseFloat(dm[i]['P64'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P65'] != null)
						pf_3 = parseFloat(dm[i]['P65'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P44'] != null)
						pf = parseFloat(dm[i]['P44'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)

					table_rows.push([{ text: i + 1, style: 'tableRows' },
					{ text: dm[i]['P3'], style: 'tableRows' }, { text: dm[i]['P4'], style: 'tableRows' },
					{ text: (dm[i]['P5']).substring(0, 25), style: 'tableRows_len' }, { text: dm[i]['P6'], style: 'tableRows' },
					{ text: cd, style: 'tableRows' }, { text: mf, style: 'tableRows' },
					{ text: pf_1, style: 'tableRows' }, { text: pf_2, style: 'tableRows' },
					{ text: pf_3, style: 'tableRows' }, { text: pf, style: 'tableRows' },
					{ text: dm[i]['P44_1'], style: 'tableRows' }])
				}

				table_format.push({
					style: 'tableExample',
					layout: layout,
					widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
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

				process.chdir(filepath)

				if (!fs.existsSync(invoked_date)) {
					fs.mkdirSync(invoked_date);
					process.chdir(filepath + invoked_date + "/")
				}
				else {
					process.chdir(filepath + invoked_date + "/")
				}

				if (!fs.existsSync(div_name)) {
					fs.mkdirSync(div_name);
					process.chdir(filepath + invoked_date + "/" + div_name + "/")
				}
				else {
					process.chdir(filepath + invoked_date + "/" + div_name + "/")
				}

				var pdfDoc = printer.createPdfKitDocument(docDefinition);
				pdfDoc.pipe(fs.createWriteStream(filepath + invoked_date + "/" + div_name + "/" + supply_cat + "_Power_Factor_Status_Report.pdf"));
				pdfDoc.end();

				global.status.cnt = global.status.cnt - 1
				console.log("Power Factor Over : " + global.status.cnt)

				if (global.status.cnt == 0) {
					updateApi(AccessToken, ipAddr, invoked_date)
				}
			}
			else {
				global.status.cnt = global.status.cnt - 1
				console.log("Power Factor Over : " + global.status.cnt)

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

module.exports = { callreport_power_factor: callreport_power_factor };