const global = require("./global.js");
var PdfPrinter = require('../src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');

function callreport_load_survey_not_found(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, crnt_dir) {

	return new Promise(function (resolve) {

		try {

			var dm_all = month_data

			var dm = []

			for (var d = 0; d < dm_all.length; d++) {
				if (dm_all[d]['P50'] == null && dm_all[d]['P51'] == null && dm_all[d]['P52'] == null && dm_all[d]['P53'] == null && dm_all[d]['P54'] == null && dm_all[d]['P55'] == null && dm_all[d]['P56'] == null && dm_all[d]['P57'] == null && dm_all[d]['P58'] == null && dm_all[d]['P59'] == null && dm_all[d]['P60'] == null && dm_all[d]['P61'] == null && dm_all[d]['P62'] == null && dm_all[d]['P63'] == null && dm_all[d]['P64'] == null && dm_all[d]['P65'] == null && dm_all[d]['P66'] == null) {
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

				table_format.push({ text: 'Load Survey Not Available Report', style: 'header' })
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
				{ text: 'Meter RTC', style: 'tableHeader' }])

				for (var i = 0; i < dm.length; i++) {

					table_rows.push([{ text: i + 1, style: 'tableRows' }, { text: dm[i]['P2'], style: 'tableRows' },
					{ text: dm[i]['P3'], style: 'tableRows' }, { text: dm[i]['P4'], style: 'tableRows' },
					{ text: (dm[i]['P5']).substring(0, 25), style: 'tableRows_len' }, { text: dm[i]['P6'], style: 'tableRows' },
					{ text: dm[i]['P18'], style: 'tableRows' }])
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
				pdfDoc.pipe(fs.createWriteStream(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/" + supply_cat + "_Load_Survey_Not_Found_Report.pdf"));
				pdfDoc.end();

				global.status.cnt = global.status.cnt - 1
				console.log("D4 Not Found Over : " + global.status.cnt)

				if (global.status.cnt == 0) {
					updateApi(AccessToken, ipAddr, invoked_date)
				}
			}
			else {
				global.status.cnt = global.status.cnt - 1
				console.log("D4 Not Found : " + global.status.cnt)

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

module.exports = { callreport_load_survey_not_found: callreport_load_survey_not_found };