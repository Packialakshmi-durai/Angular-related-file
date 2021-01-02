const global = require("./global.js");
var PdfPrinter = require('../src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');

function callreport_instantaneous(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, subdiv_name) {

	return new Promise(function (resolve) {

		try {

			var dm = month_data

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

			table_format.push({ text: 'Instantaneous Report', style: 'header' })
			table_format.push({
				style: 'tableExample',
				layout: 'noBorders',
				table: {
					widths: ['*', '*', '*', '*'],
					body: [
						[{ text: 'Report Month & Year', style: 'contentHeader' }, month_year, { text: 'Circle Name', style: 'contentHeader' }, dm[0]['P1']],
						[{ text: 'Division Name', style: 'contentHeader' }, dm[0]['P2'], { text: 'Sub Division Name', style: 'contentHeader' }, dm[0]['P3']]
					]
				}
			})

			table_rows.push([{ text: 'SI No', style: 'tableHeader' },
			{ text: 'Consumer No', style: 'tableHeader' },
			{ text: 'Consumer Name', style: 'tableHeader' }, { text: 'Meter No', style: 'tableHeader' },
			{ text: 'Make', style: 'tableHeader' }, { text: 'Meter Type', style: 'tableHeader' },
			{ text: 'MF', style: 'tableHeader' }, { text: 'V-R volt', style: 'tableHeader' },
			{ text: 'V-Y volt', style: 'tableHeader' }, { text: 'V-B volt', style: 'tableHeader' },
			{ text: 'I-R (A)', style: 'tableHeader' }, { text: 'I-Y (A)', style: 'tableHeader' },
			{ text: 'I-B (A)', style: 'tableHeader' }, { text: 'Phase Seq', style: 'tableHeader' },
			{ text: 'PF Avg', style: 'tableHeader' }, { text: 'Act Pwr (kW)', style: 'tableHeader' },
			{ text: 'Wiring Status', style: 'tableHeader' }])

			for (var i = 0; i < dm.length; i++) {

				var mf = ""
				var vr = ""
				var vy = ""
				var vb = ""
				var ir = ""
				var iy = ""
				var ib = ""
				var pf = ""
				var act_pwr = ""

				if (dm[i]['P15'] != null)
					mf = parseFloat(dm[i]['P15'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P19'] != null)
					vr = parseFloat(dm[i]['P19'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P21'] != null)
					vy = parseFloat(dm[i]['P21'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P23'] != null)
					vb = parseFloat(dm[i]['P23'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P25'] != null)
					ir = parseFloat(dm[i]['P25'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P27'] != null)
					iy = parseFloat(dm[i]['P27'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P29'] != null)
					ib = parseFloat(dm[i]['P29'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P37'] != null)
					pf = parseFloat(dm[i]['P37'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P39'] != null)
					act_pwr = parseFloat(dm[i]['P39'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)

				table_rows.push([{ text: i + 1, style: 'tableRows' },
				{ text: dm[i]['P4'], style: 'tableRows' },
				{ text: (dm[i]['P5']).substring(0, 25), style: 'tableRows_len' }, { text: dm[i]['P6'], style: 'tableRows' },
				{ text: dm[i]['P7'], style: 'tableRows' }, { text: dm[i]['P9'], style: 'tableRows' },
				{ text: mf, style: 'tableRows' }, { text: vr, style: 'tableRows' },
				{ text: vy, style: 'tableRows' }, { text: vb, style: 'tableRows' },
				{ text: ir, style: 'tableRows' }, { text: iy, style: 'tableRows' },
				{ text: ib, style: 'tableRows' }, { text: dm[i]['P38'], style: 'tableRows' },
				{ text: pf, style: 'tableRows' }, { text: act_pwr, style: 'tableRows' },
				{ text: dm[i]['P40'], style: 'tableRows' }])
			}

			table_format.push({
				style: 'tableExample',
				layout: layout,
				widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
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

			if (!fs.existsSync(subdiv_name)) {
				fs.mkdirSync(subdiv_name);
				process.chdir(filepath + invoked_date + "/" + subdiv_name + "/")
			}
			else {
				process.chdir(filepath + invoked_date + "/" + subdiv_name + "/")
			}

			var pdfDoc = printer.createPdfKitDocument(docDefinition);
			pdfDoc.pipe(fs.createWriteStream(filepath + invoked_date + "/" + subdiv_name + "/" + supply_cat + "_Instantaneous_Report.pdf"));
			pdfDoc.end();

			global.status.cnt = global.status.cnt - 1
			console.log("Instantaneous Over : " + global.status.cnt)

			if (global.status.cnt == 0) {
				updateApi(AccessToken, ipAddr, invoked_date)
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

module.exports = { callreport_instantaneous: callreport_instantaneous };