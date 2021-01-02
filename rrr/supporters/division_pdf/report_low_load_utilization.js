const global = require("./global.js");
var PdfPrinter = require('../src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');

function callreport_low_load_utilization(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name) {

	return new Promise(function (resolve) {

		try {

			var dm_all = month_data

			var dm = []

			for (var d = 0; d < dm_all.length; d++) {
				if (dm_all[d]['P58'] != null) {
					if (parseFloat(dm_all[d]['P58']) >= 50)
						dm.push(dm_all[d])
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

				table_format.push({ text: 'Low Load Utilization Report', style: 'header' })
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
				{ text: 'CD', style: 'tableHeader' }, { text: 'MD', style: 'tableHeader' },
				{ text: 'Demand Unit', style: 'tableHeader' }, { text: 'AD', style: 'tableHeader' },
				{ text: 'MD / CD (%)', style: 'tableHeader' }, { text: 'AD / CD (%)', style: 'tableHeader' },
				{ text: 'AD / MD (%)', style: 'tableHeader' }, { text: 'CD < 20% - Slot % >= 50', style: 'tableHeader' },
				{ text: 'CD 20 - 100 % - Slot %', style: 'tableHeader' }, { text: 'CD > 100 % - Slot %', style: 'tableHeader' },
				{ text: 'No Load %', style: 'tableHeader' }, { text: ' Blackout Status %', style: 'tableHeader' }])

				for (var i = 0; i < dm.length; i++) {

					var cd = ""
					var md = ""
					var ad = ""
					var md_cd = ""
					var ad_cd = ""
					var ad_md = ""
					var cd_20 = ""
					var cd_20_100 = ""
					var cd_100 = ""
					var nl = ""
					var bo = ""

					if (dm[i]['P14'] != null)
						cd = parseFloat(dm[i]['P14'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P52'] != null)
						md = parseFloat(dm[i]['P52'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P54'] != null)
						ad = parseFloat(dm[i]['P54'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P55'] != null)
						md_cd = parseFloat(dm[i]['P55'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P56'] != null)
						ad_cd = parseFloat(dm[i]['P56'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P57'] != null)
						ad_md = parseFloat(dm[i]['P57'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P58'] != null)
						cd_20 = parseFloat(dm[i]['P58'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P59'] != null)
						cd_20_100 = parseFloat(dm[i]['P59'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P60'] != null)
						cd_100 = parseFloat(dm[i]['P60'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P61'] != null)
						nl = parseFloat(dm[i]['P61'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
					if (dm[i]['P62'] != null)
						bo = parseFloat(dm[i]['P62'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)

					table_rows.push([{ text: i + 1, style: 'tableRows' },
					{ text: dm[i]['P3'], style: 'tableRows' }, { text: dm[i]['P4'], style: 'tableRows' },
					{ text: (dm[i]['P5']).substring(0, 25), style: 'tableRows_len' }, { text: dm[i]['P6'], style: 'tableRows' },
					{ text: cd, style: 'tableRows' }, { text: md, style: 'tableRows' },
					{ text: dm[i]['P53'], style: 'tableRows' }, { text: ad, style: 'tableRows' },
					{ text: md_cd, style: 'tableRows' }, { text: ad_cd, style: 'tableRows' },
					{ text: ad_md, style: 'tableRows' }, { text: cd_20, style: 'tableRows' },
					{ text: cd_20_100, style: 'tableRows' }, { text: cd_100, style: 'tableRows' },
					{ text: nl, style: 'tableRows' }, { text: bo, style: 'tableRows' }])
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
				pdfDoc.pipe(fs.createWriteStream(filepath + invoked_date + "/" + div_name + "/" + supply_cat + "_Low_Load_Utilization_Report.pdf"));
				pdfDoc.end();

				global.status.cnt = global.status.cnt - 1
				console.log("Low Load : " + global.status.cnt)

				if (global.status.cnt == 0) {
					updateApi(AccessToken, ipAddr, invoked_date)
				}
			}
			else {
				global.status.cnt = global.status.cnt - 1
				console.log("Low Load : " + global.status.cnt)

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

module.exports = { callreport_low_load_utilization: callreport_low_load_utilization };