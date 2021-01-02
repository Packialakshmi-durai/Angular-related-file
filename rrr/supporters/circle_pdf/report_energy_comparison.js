const global = require("./global.js");
var PdfPrinter = require('../src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');

function callreport_energy_comparison(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, crnt_dir) {

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

			table_format.push({ text: 'Energy Comparison Report', style: 'header' })
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
			{ text: 'Consumer Name', style: 'tableHeader' }, { text: 'Meter No', style: 'tableHeader' },
			{ text: 'CD (kVA)', style: 'tableHeader' }, { text: 'Type Of Industry', style: 'tableHeader' },
			{ text: 'Billed Units (kWh)', style: 'tableHeader' }, { text: 'Load Survey Units (kWh)', style: 'tableHeader' },
			{ text: 'Billed Units (kVAh)', style: 'tableHeader' }, { text: 'Load Survey Units (kVAh)', style: 'tableHeader' },
			{ text: 'MD (Bill) - Current Month', style: 'tableHeader' }, { text: 'MD (LS) - Current Month', style: 'tableHeader' },
			{ text: 'Utilization Factor (kWh/kVA)', style: 'tableHeader' }])

			for (var i = 0; i < dm.length; i++) {

				var cd = ""
				var bill_kwh = ""
				var bill_kvah = ""
				var load_kwh = ""
				var load_kvah = ""
				var md = ""
				var util_fctr = ""
				var max_dem = ""

				if (dm[i]['P14'] != null)
					cd = parseFloat(dm[i]['P14'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P42'] != null)
					bill_kwh = parseFloat(dm[i]['P42'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P43'] != null)
					bill_kvah = parseFloat(dm[i]['P43'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P50'] != null)
					load_kwh = parseFloat(dm[i]['P50'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P51'] != null)
					load_kvah = parseFloat(dm[i]['P51'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P48'] != null)
					md = parseFloat(dm[i]['P48'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P45'] != null)
					util_fctr = parseFloat(dm[i]['P45'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (dm[i]['P52'] != null)
					max_dem = parseFloat(dm[i]['P52'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)

				table_rows.push([{ text: i + 1, style: 'tableRows' }, { text: dm[i]['P2'], style: 'tableRows' },
				{ text: dm[i]['P3'], style: 'tableRows' }, { text: dm[i]['P4'], style: 'tableRows' },
				{ text: dm[i]['P5'].substring(0, 25), style: 'tableRows_len' }, { text: dm[i]['P6'], style: 'tableRows' },
				{ text: cd, style: 'tableRows' }, { text: dm[i]['P13'], style: 'tableRows' },
				{ text: bill_kwh, style: 'tableRows' }, { text: load_kwh, style: 'tableRows' },
				{ text: bill_kvah, style: 'tableRows' }, { text: load_kvah, style: 'tableRows' },
				{ text: md, style: 'tableRows' }, { text: max_dem, style: 'tableRows' },
				{ text: util_fctr, style: 'tableRows' }])
			}

			table_format.push({
				style: 'tableExample',
				layout: layout,
				widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
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

			process.chdir(crnt_dir + "/PDF/" + month_year + "/")

			if (!fs.existsSync(invoked_date)) {
				fs.mkdirSync(invoked_date);
				process.chdir(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/")
			}
			else {
				process.chdir(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/")
			}

			var pdfDoc = printer.createPdfKitDocument(docDefinition);
			pdfDoc.pipe(fs.createWriteStream(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/" + supply_cat + "_Energy_Comparison_Report.pdf"));
			pdfDoc.end();

			global.status.cnt = global.status.cnt - 1
			console.log("Energy Comparison Over : " + global.status.cnt)

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

module.exports = { callreport_energy_comparison: callreport_energy_comparison }; 