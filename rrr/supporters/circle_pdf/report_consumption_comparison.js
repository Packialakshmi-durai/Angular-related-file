const global = require("./global.js");
var PdfPrinter = require('../src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');
var moment = require('moment')
var groupBy = require('group-by');

function callreport_consumption_comparison(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, hierarchy_code, crnt_dir) {

	return new Promise(function (resolve) {

		var dm_all = month_data

		var d3_from_date = moment(month_year, 'MM-YYYY').subtract(5, 'months').format('DD-MM-YYYY HH:mm:ss')
		d3_from_date = moment(d3_from_date, 'DD-MM-YYYY HH:mm:ss').toISOString()
		var d3_to_date = moment(month_year, 'MM-YYYY').format('DD-MM-YYYY HH:mm:ss')
		d3_to_date = moment(d3_to_date, 'DD-MM-YYYY HH:mm:ss').toISOString()

		var start_hstry = moment(month_year, 'MM-YYYY').subtract(5, 'months').format('DD-MM-YYYY')
		var end_hstry = moment(month_year, 'MM-YYYY').add(1, 'months').format('DD-MM-YYYY')

		client.get(ipAddr + "/api/consumptions?filter[where][hierarchy_code][like]=" + hierarchy_code + "&filter[where][and][0][date_obj][gte]=" + d3_from_date + "&filter[where][and][1][date_obj][lte]=" + d3_to_date + "&filter[order]=date_obj DESC&access_token=" + AccessToken, async function (d3_data, d3_response, d3_err) {

			try {

				var cons_hstry = []

				for (var m = moment(start_hstry, 'DD-MM-YYYY'); m.isBefore(moment(end_hstry, "DD-MM-YYYY")); m.add(1, 'months')) {
					cons_hstry.push({ "Date": m.format('DD-MM-YYYY') })
				}

				cons_hstry.sort(function compare(a, b) {
					var dateA = new Date(a.Date);
					var dateB = new Date(b.Date);
					return dateB - dateA;
				});

				if (d3_data.length != 0) {

					var d3_merge = groupBy(d3_data, 'hierarchy_code')

					var merged = dm_all.map((item, j) => Object.assign({}, item, Object.values(d3_merge)[j]));

					if (merged != undefined) {

						var final_cons_table = []

						for (var i = 0; i < merged.length; i++) {

							var key_val = []
							var fir_mnth = "-"
							var sec_mnth = "-"
							var third_mnth = "-"
							var fourth_mnth = "-"
							var five_mnth = "-"
							var six_mnth = "-"
							var cir_name = merged[i]['P1']
							var div_name = merged[i]['P2']
							var subdiv_name = merged[i]['P3']
							var cons_no = merged[i]['P4']
							var cons_name = merged[i]['P5']
							var meter_no = merged[i]['P6']

							for (var j = 0; j < 6; j++) {
								if (Object.keys(merged[i])[j] == '0' || Object.keys(merged[i])[j] == '1' || Object.keys(merged[i])[j] == '2' || Object.keys(merged[i])[j] == '3' || Object.keys(merged[i])[j] == '4' || Object.keys(merged[i])[j] == '5')
									key_val.push(Object.values(merged[i])[j])
							}

							for (var k = 0; k < key_val.length; k++) {

								if (key_val[k]['date'] == cons_hstry[0]['Date']) {

									if (key_val[k]['kwh_im_abs'] != null)
										var fir_mnth = key_val[k]['kwh_im_abs']
									if (key_val[k]['kwh_im_t'] != null)
										var fir_mnth = key_val[k]['kwh_im_t']
									if (key_val[k]['kwh_im'] != null)
										var fir_mnth = key_val[k]['kwh_im']
								}

								if (key_val[k]['date'] == cons_hstry[1]['Date']) {

									if (key_val[k]['kwh_im_abs'] != null)
										var sec_mnth = key_val[k]['kwh_im_abs']
									if (key_val[k]['kwh_im_t'] != null)
										var sec_mnth = key_val[k]['kwh_im_t']
									if (key_val[k]['kwh_im'] != null)
										var sec_mnth = key_val[k]['kwh_im']
								}

								if (key_val[k]['date'] == cons_hstry[2]['Date']) {

									if (key_val[k]['kwh_im_abs'] != null)
										var third_mnth = key_val[k]['kwh_im_abs']
									if (key_val[k]['kwh_im_t'] != null)
										var third_mnth = key_val[k]['kwh_im_t']
									if (key_val[k]['kwh_im'] != null)
										var third_mnth = key_val[k]['kwh_im']
								}

								if (key_val[k]['date'] == cons_hstry[3]['Date']) {

									if (key_val[k]['kwh_im_abs'] != null)
										var fourth_mnth = key_val[k]['kwh_im_abs']
									if (key_val[k]['kwh_im_t'] != null)
										var fourth_mnth = key_val[k]['kwh_im_t']
									if (key_val[k]['kwh_im'] != null)
										var fourth_mnth = key_val[k]['kwh_im']
								}

								if (key_val[k]['date'] == cons_hstry[4]['Date']) {

									if (key_val[k]['kwh_im_abs'] != null)
										var five_mnth = key_val[k]['kwh_im_abs']
									if (key_val[k]['kwh_im_t'] != null)
										var five_mnth = key_val[k]['kwh_im_t']
									if (key_val[k]['kwh_im'] != null)
										var five_mnth = key_val[k]['kwh_im']
								}

								if (key_val[k]['date'] == cons_hstry[5]['Date']) {

									if (key_val[k]['kwh_im_abs'] != null)
										var six_mnth = key_val[k]['kwh_im_abs']
									if (key_val[k]['kwh_im_t'] != null)
										var six_mnth = key_val[k]['kwh_im_t']
									if (key_val[k]['kwh_im'] != null)
										var six_mnth = key_val[k]['kwh_im']
								}
							}
							final_cons_table.push({
								"cir_name": cir_name, "div_name": div_name, "subdiv_name": subdiv_name,
								"cons_no": cons_no, "cons_name": cons_name, "meter_no": meter_no,
								"fir_mnth": fir_mnth, "sec_mnth": sec_mnth, "third_mnth": third_mnth,
								"fourth_mnth": fourth_mnth, "five_mnth": five_mnth, "six_mnth": six_mnth
							})
						}

						if (final_cons_table.length != 0) {

							var dm = final_cons_table

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

							table_format.push({ text: 'Consumption Comparison Report', style: 'header' })
							table_format.push({
								style: 'tableExample',
								layout: 'noBorders',
								table: {
									widths: ['*', '*', '*', '*'],
									body: [
										[{ text: 'Report Month & Year', style: 'contentHeader' }, month_year, { text: 'Circle Name', style: 'contentHeader' }, dm[0]['cir_name']]
									]
								}
							})

							table_rows.push([{ text: 'SI No', style: 'tableHeader' }, { text: 'Division', style: 'tableHeader' },
							{ text: 'Sub Division', style: 'tableHeader' }, { text: 'Consumer No', style: 'tableHeader' },
							{ text: 'Consumer Name', style: 'tableHeader' }, { text: 'Meter No', style: 'tableHeader' },
							{ text: 'Consumption on ' + moment(cons_hstry[0]['Date'], "DD-MM-YYYY").format('MMM-YYYY'), style: 'tableHeader' },
							{ text: 'Consumption on ' + moment(cons_hstry[1]['Date'], "DD-MM-YYYY").format('MMM-YYYY'), style: 'tableHeader' },
							{ text: 'Consumption on ' + moment(cons_hstry[2]['Date'], "DD-MM-YYYY").format('MMM-YYYY'), style: 'tableHeader' },
							{ text: 'Consumption on ' + moment(cons_hstry[3]['Date'], "DD-MM-YYYY").format('MMM-YYYY'), style: 'tableHeader' },
							{ text: 'Consumption on ' + moment(cons_hstry[4]['Date'], "DD-MM-YYYY").format('MMM-YYYY'), style: 'tableHeader' },
							{ text: 'Consumption on ' + moment(cons_hstry[5]['Date'], "DD-MM-YYYY").format('MMM-YYYY'), style: 'tableHeader' }])

							for (var i = 0; i < dm.length; i++) {

								var first = "-"
								var second = "-"
								var third = "-"
								var fourth = "-"
								var fiveth = "-"
								var sixth = "-"

								if (dm[i]['fir_mnth'] != "-")
									first = parseFloat(dm[i]['fir_mnth'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
								if (dm[i]['sec_mnth'] != "-")
									second = parseFloat(dm[i]['sec_mnth'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
								if (dm[i]['third_mnth'] != "-")
									third = parseFloat(dm[i]['third_mnth'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
								if (dm[i]['fourth_mnth'] != "-")
									fourth = parseFloat(dm[i]['fourth_mnth'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
								if (dm[i]['five_mnth'] != "-")
									fiveth = parseFloat(dm[i]['five_mnth'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
								if (dm[i]['six_mnth'] != "-")
									sixth = parseFloat(dm[i]['six_mnth'].toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)

								table_rows.push([{ text: i + 1, style: 'tableRows' }, { text: dm[i]['div_name'], style: 'tableRows' },
								{ text: dm[i]['subdiv_name'], style: 'tableRows' }, { text: dm[i]['cons_no'], style: 'tableRows' },
								{ text: (dm[i]['cons_name']).substring(0, 25), style: 'tableRows_len' }, { text: dm[i]['meter_no'], style: 'tableRows' },
								{ text: first, style: 'tableRows' }, { text: second, style: 'tableRows' },
								{ text: third, style: 'tableRows' }, { text: fourth, style: 'tableRows' },
								{ text: fiveth, style: 'tableRows' }, { text: sixth, style: 'tableRows' }])
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

							process.chdir(crnt_dir + "/PDF/" + month_year + "/")

							if (!fs.existsSync(invoked_date)) {
								fs.mkdirSync(invoked_date);
								process.chdir(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/")
							}
							else {
								process.chdir(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/")
							}

							var pdfDoc = printer.createPdfKitDocument(docDefinition);
							pdfDoc.pipe(fs.createWriteStream(crnt_dir + "/PDF/" + month_year + "/" + invoked_date + "/" + supply_cat + "_Consumption_Comparison_Report.pdf"));
							pdfDoc.end();

							global.status.cnt = global.status.cnt - 1
							console.log("Consumption Comparison Over : " + global.status.cnt)

							if (global.status.cnt == 0) {
								updateApi(AccessToken, ipAddr, invoked_date)
							}
						}
						else {
							global.status.cnt = global.status.cnt - 1
							console.log("Consumption Comparison Over : " + global.status.cnt)

							if (global.status.cnt == 0) {
								updateApi(AccessToken, ipAddr, invoked_date)
							}
						}
					}
					else {
						global.status.cnt = global.status.cnt - 1
						console.log("Consumption Comparison Over : " + global.status.cnt)

						if (global.status.cnt == 0) {
							updateApi(AccessToken, ipAddr, invoked_date)
						}
					}
				}
				else {
					global.status.cnt = global.status.cnt - 1
					console.log("Consumption Comparison Over : " + global.status.cnt)

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

module.exports = { callreport_consumption_comparison: callreport_consumption_comparison };