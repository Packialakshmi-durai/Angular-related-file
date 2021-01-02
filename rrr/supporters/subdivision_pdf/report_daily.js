var PdfPrinter = require('../src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');
var unique = require('array-unique');
var moment = require('moment');

function callreport_daily(subdiv_result, fonts, AccessToken, ipAddr, hierarchy_code, from, to, invoked_date, supply_cat, filepath, subdiv_name) {

	return new Promise(function (resolve, reject) {

		var from_date_iso = moment(from, 'DD-MM-YYYY').format('DD-MM-YYYY') + " 00:00:00"
		from_date_iso = moment(from_date_iso, 'DD-MM-YYYY HH:mm:ss').toISOString()
		var to_date_iso = moment(to, 'DD-MM-YYYY').format('DD-MM-YYYY') + " 00:00:00"
		to_date_iso = moment(to_date_iso, 'DD-MM-YYYY HH:mm:ss').toISOString()

		client.get(ipAddr + "/api/dailies?access_token=" + AccessToken + "&filter[where][hierarchy_code][like]=" + hierarchy_code + "&filter[where][and][0][date_obj][gte]=" + from_date_iso + "&filter[where][and][1][date_obj][lte]=" + to_date_iso + "&filter[order]=date_obj ASC", function (daily_data, daily_response, daily_err) {

			try {

				if (daily_data.length != 0) {

					var monthly = subdiv_result

					var uniq_meters = []
					var daily_fnl = []

					for (var i = 0; i < daily_data.length; i++) {
						uniq_meters.push(daily_data[i]['hierarchy_code'])
					}

					var uniq_meters_arry = unique(uniq_meters)

					for (var u = 0; u < uniq_meters_arry.length; u++) {

						var uniq = uniq_meters_arry[u]

						var filterBy = { hierarchy_code: [uniq] },
							daily_result = daily_data.filter(function (o) {
								return Object.keys(filterBy).every(function (k) {
									return filterBy[k].some(function (f) {
										return o[k] === f;
									});
								});
							});

						daily_fnl.push({ "reports": daily_result, "hierarchy_code": uniq })
					}

					var merged = ""
					var max_len = []

					max_len.push({ "data": monthly, "len": monthly.length })
					max_len.push({ "data": daily_fnl, "len": daily_fnl.length })

					max_len.sort(function compare(a, b) {
						var A = a.len
						var B = b.len
						return B - A;
					});

					merged = merge_fun([max_len[0].data, max_len[1].data], 'hierarchy_code');

					var daily_df = []

					for (var i = 0; i < merged.length; i++) {
						if (merged[i]['P6'] != undefined && merged[i]['reports'] != undefined) {
							daily_df.push(merged[i])
						}
					}

					if (daily_df.length != 0) {

						daily_df.sort(function (c, d) {
							if (c.hierarchy_code < d.hierarchy_code) { return -1; }
							if (c.hierarchy_code > d.hierarchy_code) { return 1; }
							return 0;
						})
						template_func(daily_df, fonts, AccessToken, ipAddr, from, to, invoked_date, supply_cat, filepath, subdiv_name)
					}
					else {
						var errorlog_format = []

						errorlog_format.push({
							"error_occured_date": new Date(),
							"error_code": "Error103B",
							"error_type": "PDF_Error",
							"error_desc": "PDF Not Generated",
							"error_remark": "Data Not Available"
						})
						errorlog(ipAddr, errorlog_format, AccessToken)

						updateApi(AccessToken, ipAddr, invoked_date)
					}
				}
				else {
					var errorlog_format = []

					errorlog_format.push({
						"error_occured_date": new Date(),
						"error_code": "Error103B",
						"error_type": "PDF_Error",
						"error_desc": "PDF Not Generated",
						"error_remark": "Data Not Available"
					})
					errorlog(ipAddr, errorlog_format, AccessToken)

					updateApi(AccessToken, ipAddr, invoked_date)
				}
				resolve()
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
	});
}

var template_func = function (daily_df, fonts, AccessToken, ipAddr, from, to, invoked_date, supply_cat, filepath, subdiv_name) {

	return new Promise(function (resolve, reject) {

		var layout = {
			hLineWidth: function (i, node) {
				return 0.5;
			},
			vLineWidth: function (i, node) {
				return 0.5;
			},
		}

		var json = daily_df

		var printer = new PdfPrinter(fonts);
		var table = [];
		var column = [];
		var table_content = [];
		var doc_def = [];

		for (var i = 0; i < json.length; i++) {
			table = [];

			table.push([{ text: 'Date', style: 'tableHeader' }, { text: 'kwh', style: 'tableHeader' },
			{ text: 'kvah', style: 'tableHeader' }, { text: 'Max Demand', style: 'tableHeader' },
			{ text: 'Min Demand', style: 'tableHeader' }, { text: 'PF', style: 'tableHeader' },
			{ text: 'CD violation count', style: 'tableHeader' }, { text: 'No Load count', style: 'tableHeader' },
			{ text: 'Blackout count', style: 'tableHeader' }])

			for (var j = 0; j < json[i].reports.length; j++) {

				if (json[i].reports[j].max_kw != "-" && json[i].reports[j].max_kva != "-" && json[i].reports[j].min_kw != "-" && json[i].reports[j].min_kva != "-") {
					var max = json[i].reports[j].max_kw
					var min = json[i].reports[j].min_kw
				}

				else if (json[i].reports[j].max_kw == "-" && json[i].reports[j].max_kva != "-" && json[i].reports[j].min_kw == "-" && json[i].reports[j].min_kva != "-") {
					var max = json[i].reports[j].max_kva
					var min = json[i].reports[j].min_kva
				}

				else if (json[i].reports[j].max_kw != "-" && json[i].reports[j].max_kva == "-" && json[i].reports[j].min_kw != "-" && json[i].reports[j].min_kva == "-") {
					var max = json[i].reports[j].max_kw
					var min = json[i].reports[j].min_kw
				}

				var kwh = "-"
				var kvah = "-"
				var pf = "-"

				if (json[i].reports[j].kwh != null)
					kwh = parseFloat(json[i].reports[j].kwh.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (json[i].reports[j].kvah != null)
					kvah = parseFloat(json[i].reports[j].kvah.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (max != null)
					max = parseFloat(max.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (min != null)
					min = parseFloat(min.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
				if (json[i].reports[j].pf != null)
					pf = parseFloat(json[i].reports[j].pf.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)


				table.push([{ text: json[i].reports[j].date, style: 'tableContent' }, { text: kwh, style: 'tableContent' },
				{ text: kvah, style: 'tableContent' }, { text: max, style: 'tableContent' },
				{ text: min, style: 'tableContent' }, { text: pf, style: 'tableContent' },
				{ text: json[i].reports[j].cd_cnt, style: 'tableContent' }, { text: json[i].reports[j].nl, style: 'tableContent' },
				{ text: json[i].reports[j].bo, style: 'tableContent' }])
			}

			if (json[i].P15 != null)
				bill_mf = parseFloat(json[i].P15.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)
			if (json[i].P14 != null)
				contract_demand = parseFloat(json[i].P14.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2)

			table_content = [{
				layout: 'noBorders',
				margin: 5,
				table: {
					widths: ['*', '*', '*', '*'],
					body: [
						[{ text: 'Division Name', style: 'subheader' }, { text: json[i].P2, style: 'content' },
						{ text: 'Sub Division Name', style: 'subheader' }, { text: json[i].P3, style: 'content' }],

						[{ text: 'Consumer No', style: 'subheader' }, { text: json[i].P4, style: 'content' },
						{ text: 'Consumer Name', style: 'subheader' }, { text: (json[i].P5).substring(0, 20), style: 'content' }],

						[{ text: 'Meter No', style: 'subheader' }, { text: json[i].P6, style: 'content' },
						{ text: 'MF', style: 'subheader' }, { text: bill_mf, style: 'content' }],

						[{ text: 'CD', style: 'subheader' }, { text: contract_demand, style: 'content' },
						{ text: 'Period', style: 'subheader' }, { text: from + " - " + to, style: 'content' }]
					]
				}
			},
			{
				layout: layout,
				margin: [5, 5, 5, 5],
				table: {
					headerRows: 1,
					widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*'],
					body: table
				}
			}];

			column.push(table_content)
			doc_def.push({ text: 'Daily Report', style: 'header' })

			if (i == json.length - 1)
				doc_def.push({ columns: column })
			else
				doc_def.push({ columns: column, pageBreak: 'after' })

			column = []
		}

		var documentDefinition = {
			content: doc_def,
			styles:
			{
				header:
				{
					fontSize: 12,
					alignment: 'center',
					margin: [0, 0, 0, 10],
					bold: true
				},
				subheader:
				{
					fontSize: 9,
					alignment: 'left',
					bold: true
				},
				tableHeader:
				{
					fontSize: 9,
					bold: true,
					alignment: 'center'
				},
				content: {
					fontSize: 9,
					alignment: 'left'
				},
				tableContent: {
					fontSize: 9,
					alignment: 'center'
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
		pdfDoc.pipe(fs.createWriteStream(filepath + invoked_date + "/" + subdiv_name + "/" + supply_cat + "_Daily_Report.pdf"));
		pdfDoc.end();

		updateApi(AccessToken, ipAddr, invoked_date)

		resolve()
	})
}

var updateApi = function (AccessToken, ipAddr, invoked_date) {

	client.get(ipAddr + "/api/pdfprocesses?access_token=" + AccessToken + "&filter[where][invoked_date]=" + invoked_date, function (pdf_data, pdf_response, pdf_err) {

		var args_pdfproc = {
			data: {
				status: "complete"
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

var errorlog = function (ipAddr, errorlog_format, AccessToken) {

	var args = {
		data: errorlog_format,
		headers: {
			"Content-Type": "application/json"
		}
	};

	client.post(ipAddr + "/api/errorlogs?access_token=" + AccessToken, args, function (data, res) {
		console.log("Errorlog Update : " + res.statusCode)
	});
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

module.exports = { callreport_daily: callreport_daily };