var bill_config = require('./bill_config');
var PdfPrinter = require('./src/printer');
var Client = require('node-rest-client').Client;
var client = new Client();
var axios = require('axios');
var fs = require('fs');
var moment = require('moment');
var zipFolder = require('zip-folder');
var rimraf = require("rimraf");

var billing_pdf_func_call = function (AccessToken, location_path, fonts, launchedAt, ipAddr) {

	client.get(ipAddr + "/api/fileprocesses?filter[where][launchedAt]=" + launchedAt + "&access_token=" + AccessToken, async function (file_data, file_response, file_err) {

		if (file_data.length != 0) {

			var fileproc_id = file_data[0]['id']
			var month_year = file_data[0]['month_year']

			var args_fileproc = {
				data: {
					billing_pdf: "process"
				},
				headers: {
					"Content-Type": "application/json"
				}
			}

			await client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, async function (data_update, resp) {
				await dataproc_func_call(AccessToken, fileproc_id, launchedAt, month_year, location_path, fonts, ipAddr)
			})
		}
	})
}

var dataproc_func_call = async function (AccessToken, fileproc_id, launchedAt, month_year, location_path, fonts, ipAddr) {

	await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][billing_pdf]=new&filter[where][launchedAt]=" + launchedAt + "&filter[limit]=1", async function (dataproc_data, dataproc_response, dataproc_err) {

		if (dataproc_data.length != 0) {

			for (var i in dataproc_data) {

				setTimeout(async function (i) {

					var dataproc_id = dataproc_data[i].id
					var meter_id = dataproc_data[i].meterId
					var hierarchy_code = dataproc_data[i].hierarchy_code

					var args_dataproc = {
						data: {
							billing_pdf: "process"
						},
						headers: {
							"Content-Type": "application/json"
						}
					}
					await process_update(dataproc_id, args_dataproc, AccessToken, fileproc_id, meter_id, month_year, launchedAt, hierarchy_code, location_path, fonts, ipAddr)
				}, 500 * i, i)
			}
		}
	})
}

var process_update = async function (dataproc_id, args_dataproc, AccessToken, fileproc_id, meter_id, month_year, launchedAt, hierarchy_code, location_path, fonts, ipAddr) {

	await client.post(ipAddr + "/api/dataprocesses/update?where[id]=" + dataproc_id + "&access_token=" + AccessToken, args_dataproc, async function (data_update, resp) {
		if (resp.statusCode == 200) {
			await logic_call(dataproc_id, AccessToken, fileproc_id, meter_id, month_year, launchedAt, hierarchy_code, location_path, fonts, ipAddr)
		}
	})
}

var logic_call = async function (dataproc_id, AccessToken, fileproc_id, meter_id, month_year, launchedAt, hierarchy_code, location_path, fonts, ipAddr) {

	console.log(hierarchy_code)

	axios.get(ipAddr + "/api/d3s?filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][month_year]=" + month_year + "&filter[order]=bill_date_time DESC&access_token=" + AccessToken).then(d3_response => {

		axios.get(ipAddr + "/api/d1s?filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][month_year]=" + month_year + "&access_token=" + AccessToken).then(d1_response => {

			axios.get(ipAddr + "/api/meters?filter[where][id]=" + meter_id + "&access_token=" + AccessToken).then(meter_response => {

				if (d3_response.data.length != 0) {
					billing_logic(dataproc_id, AccessToken, fileproc_id, month_year, launchedAt, d3_response, meter_response, d1_response, location_path, fonts, ipAddr)
				}
				else {
					file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, fonts, ipAddr, "bill_not_found")
				}
			})
		})
	})
}

function billing_logic(dataproc_id, AccessToken, fileproc_id, month_year, launchedAt, d3_response, meter_response, d1_response, location_path, fonts, ipAddr) {

	try {

		var billing_array = []

		for (var i = 0; i < d3_response.data.length; i++) {
			d3_response.data[i].format_billdatetime = moment(d3_response.data[i]['bill_date_time']).format('DD-MM-YYYY HH:mm:ss')
		}

		for (var i = 0; i < d3_response.data.length; i++) {

			var make_code_name = { "001": "SECURE", "002": "ELSTER", "003": "L&T", "004": "GENUS", "005": "DUKE", "006": "HPL", "007": "Data Pro", "008": "Omni Agte", "009": "Easun Reyrolle", "010": "Capital Power", "011": "Bentec Electrical", "012": "Delhi Control Device", "013": "ICSA Pvt", "014": "Holley Meters", "015": "Indo Asian", "078": "KAIFA", "101": "L&G", "102": "Avon", "103": "Linkwell" }

			var kwh_im = "-"
			var kwh_ex = "-"
			var kvah_im = "-"
			var kvah_ex = "-"
			var kw_im = "-"
			var kw_ex = "-"
			var kva_im = "-"
			var kva_ex = "-"
			var pf_im = "-"
			var pf_ex = "-"
			var meter_no = "-"
			var meter_reading_date = "-"
			var ip = "-"
			var mri_date = "-"
			var meter_type = "-"
			var ct_ratio = "-"
			var pt_ratio = "-"
			var manufacture_name = "-"
			var consumer_no = "-"
			var consumer_name = "-"
			var cd = "-"
			var mf = "-"
			var meter_tech_type = "-"
			var cir_name = "-"
			var div_name = "-"
			var sub_name = "-"

			meter_no = (d1_response.data[0].D1[0].G1).toString().padStart(8, 0)
			meter_reading_date = d1_response.data[0].D1[0].G2
			ip = d1_response.data[0].D1[0].G20
			ip = ip == null ? "-" : ip;
			mri_date = d1_response.data[0].D1[0].G3
			mri_date = mri_date == null ? "-" : mri_date;
			ct_ratio = d1_response.data[0].D1[0].G8
			ct_ratio = ct_ratio == null ? "-" : ct_ratio;
			pt_ratio = d1_response.data[0].D1[0].G7
			pt_ratio = pt_ratio == null ? "-" : pt_ratio;
			meter_type = d1_response.data[0].D1[0].G15
			consumer_no = meter_response.data[0]["consumer_no"]
			consumer_name = meter_response.data[0]["consumer_name"]
			cd = meter_response.data[0]["contract_demand"]
			mf = meter_response.data[0]["bill_mf"]
			meter_tech_type = meter_response.data[0]["meter_tech_type"]
			cir_name = meter_response.data[0]["circlename"]
			div_name = meter_response.data[0]["divname"]
			sub_name = meter_response.data[0]["subname"]
			manufacture_name = make_code_name[d1_response.data[0].D1[0].G22[0].toString().padStart(3, 0)]

			if (manufacture_name == undefined)
				manufacture_name = "-"

			var bill_datetime = d3_response.data[i].format_billdatetime
			kwh_im = configReturn(d3_response.data[i].D3, 'kwh_im')
			kwh_im = kwh_im == null ? "-" : kwh_im;

			kwh_ex = configReturn(d3_response.data[i].D3, 'kwh_ex')
			kwh_ex = kwh_ex == null ? "-" : kwh_ex;

			kvah_im = configReturn(d3_response.data[i].D3, 'kvah_im')
			kvah_im = kvah_im == null ? "-" : kvah_im;

			kvah_ex = configReturn(d3_response.data[i].D3, 'kvah_ex')
			kvah_ex = kvah_ex == null ? "-" : kvah_ex;

			kw_im = configReturn(d3_response.data[i].D3, 'kw_im')
			kw_im = kw_im == null ? "-" : kw_im;

			kw_ex = configReturn(d3_response.data[i].D3, 'kw_ex')
			kw_ex = kw_ex == null ? "-" : kw_ex;

			kva_im = configReturn(d3_response.data[i].D3, 'kva_im')
			kva_im = kva_im == null ? "-" : kva_im;

			kva_ex = configReturn(d3_response.data[i].D3, 'kva_ex')
			kva_ex = kva_ex == null ? "-" : kva_ex;

			pf_im = configReturn(d3_response.data[i].D3, 'pf_im')
			pf_im = pf_im == null ? "-" : pf_im;

			pf_ex = configReturn(d3_response.data[i].D3, 'pf_ex')
			pf_ex = pf_ex == null ? "-" : pf_ex;

			billing_array.push({
				"bill_date_time": bill_datetime, "kwh_im": kwh_im, "kwh_ex": kwh_ex, "kvah_im": kvah_im, "kvah_ex": kvah_ex,
				"kw_im": kw_im, "kw_ex": kw_ex, "kva_im": kva_im, "kva_ex": kva_ex, "pf_im": pf_im, "pf_ex": pf_ex
			})
		}
		if (billing_array.length != 0) {
			templatecall(billing_array, consumer_no, consumer_name, meter_no, meter_reading_date, ip, meter_type, ct_ratio, pt_ratio, cd, mf, meter_tech_type, cir_name, div_name, sub_name, AccessToken, manufacture_name, location_path, fonts, month_year, launchedAt, dataproc_id, fileproc_id, ipAddr)
		}
		else {
			file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, fonts, ipAddr, "bill_not_found")
		}
	}
	catch (e) {
		file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, fonts, ipAddr, "error")
	}
}

var templatecall = function (final_df, cons_no, cons_name, meter_no, meter_rtc, meter_ip, meter_type, ct_ratio, pt_ratio, cd, mf, meter_tech_type, cir_name, div_name, sub_name, AccessToken, meter_manu, location_path, fonts, month_year, launchedAt, dataproc_id, fileproc_id, ipAddr) {

	try {

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

		table_format.push({ text: 'Billing Report for Meter : ' + meter_no + "-" + cons_no, style: 'header' })

		table_format.push({
			style: 'tableExample',
			layout: 'noBorders',
			table: {
				widths: ['*', '*', '*', '*'],
				body: [
					[{ text: 'Consumer No', style: 'contentHeader' }, cons_no, { text: 'Consumer Name', style: 'contentHeader' }, cons_name],
					[{ text: 'Meter No', style: 'contentHeader' }, meter_no, { text: 'Meter Reading Date', style: 'contentHeader' }, meter_rtc],
					[{ text: 'Demand Integration Period', style: 'contentHeader' }, meter_ip, { text: 'Meter Type', style: 'contentHeader' }, meter_type],
					[{ text: 'Meter Manu Name', style: 'contentHeader' }, meter_manu, { text: 'CT Ratio', style: 'contentHeader' }, ct_ratio],
					[{ text: 'PT Ratio', style: 'contentHeader' }, pt_ratio, { text: 'Contract Demand', style: 'contentHeader' }, cd],
					[{ text: 'MF', style: 'contentHeader' }, mf, { text: 'Meter Tech Type', style: 'contentHeader' }, meter_tech_type],
					[{ text: 'Circle Name', style: 'contentHeader' }, cir_name, { text: 'Division Name', style: 'contentHeader' }, div_name],
					[{ text: 'Sub Division Name', style: 'contentHeader' }, sub_name, {}, {}]
				]
			}
		})

		table_rows.push([{ text: 'Billing Date', style: 'tableHeader' },
		{ text: 'Kwh(I)', style: 'tableHeader' },
		{ text: 'Kwh(E)', style: 'tableHeader' },
		{ text: 'Kvah(I)', style: 'tableHeader' },
		{ text: 'Kvah(E)', style: 'tableHeader' },
		{ text: 'MD kw(I)', style: 'tableHeader' },
		{ text: 'MD kw(E)', style: 'tableHeader' },
		{ text: 'MD kva(I)', style: 'tableHeader' },
		{ text: 'MD kva(E)', style: 'tableHeader' },
		{ text: 'PF(I)', style: 'tableHeader' },
		{ text: 'PF(E)', style: 'tableHeader' }])

		for (var i = 0; i < final_df.length; i++) {

			table_rows.push([{ text: final_df[i].bill_date_time, style: 'tableRows' },
			{ text: final_df[i].kwh_im, style: 'tableRows' },
			{ text: final_df[i].kwh_ex, style: 'tableRows' },
			{ text: final_df[i].kvah_im, style: 'tableRows' },
			{ text: final_df[i].kvah_ex, style: 'tableRows' },
			{ text: final_df[i].kw_im, style: 'tableRows' },
			{ text: final_df[i].kw_ex, style: 'tableRows' },
			{ text: final_df[i].kva_im, style: 'tableRows' },
			{ text: final_df[i].kva_ex, style: 'tableRows' },
			{ text: final_df[i].pf_im, style: 'tableRows' },
			{ text: final_df[i].pf_ex, style: 'tableRows' }])
		}

		table_format.push({
			style: 'tableExample',
			layout: layout,
			widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
			table: {
				dontBreakRows: true,
				body: table_rows
			}
		})

		var docDefinition = {
			content: table_format,
			pageMargins: [30, 50, 30, 50],
			styles: {
				header: {
					fontSize: 14,
					bold: true,
					margin: [0, 5, 0, 10],
					alignment: 'center'
				},
				tableExample: {
					margin: [0, 5, 0, 15]
				},
				contentHeader: {
					bold: true,
					fontSize: 10,
					color: 'black',
					alignment: 'left'
				},
				tableHeader: {
					bold: true,
					fontSize: 10,
					color: 'black',
					alignment: 'center'
				},
				tableRows: {
					margin: [0, 0, 0, 0],
					fontSize: 8,
					color: 'black',
					alignment: 'right',
					noWrap: true
				}
			},
			defaultStyle: {
				fontSize: 8
			}
		};

		process.chdir(location_path + "/")

		if (!fs.existsSync("Billing_PDF")) {
			fs.mkdirSync("Billing_PDF");
		}

		process.chdir(location_path + "/Billing_PDF/")

		if (!fs.existsSync(month_year)) {
			fs.mkdirSync(month_year);
		}

		process.chdir(location_path + "/Billing_PDF/" + month_year + "/")

		if (!fs.existsSync(launchedAt)) {
			fs.mkdirSync(launchedAt);
		}

		var pdfDoc = printer.createPdfKitDocument(docDefinition);
		pdfDoc.pipe(fs.createWriteStream(location_path + "/Billing_PDF/" + month_year + "/" + launchedAt + "/" + meter_no + "_" + cons_no + '.pdf'));
		pdfDoc.end();

		file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, fonts, ipAddr, "complete")
	}
	catch (e) {
		file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, fonts, ipAddr, "error")
	}
}

function file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, fonts, ipAddr, status_update) {

	var args_dataproc = {
		data: {
			billing_pdf: status_update
		},
		headers: {
			"Content-Type": "application/json"
		}
	}

	client.post(ipAddr + "/api/dataprocesses/update?where[id]=" + dataproc_id + "&access_token=" + AccessToken, args_dataproc, async function (data_update, resp) {
		console.log("Dataprocesses Update : " + resp.statusCode)

		await dataproc_func_call(AccessToken, fileproc_id, launchedAt, month_year, location_path, fonts, ipAddr)

		await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][or][0][billing_pdf]=new&filter[where][or][1][billing_pdf]=process&filter[where][launchedAt]=" + launchedAt, async function (dataproc_data, dataproc_response, dataproc_err) {

			if (dataproc_data.length == 0) {

				var args_fileproc = {
					data: {
						billing_pdf: "complete"
					},
					headers: {
						"Content-Type": "application/json"
					}
				}

				zipFolder(location_path + "/Billing_PDF/" + month_year + "/" + launchedAt, location_path + "/Billing_PDF/" + month_year + "/" + launchedAt + '.zip', function (err) {

					if (!err) {

						rimraf(location_path + "/Billing_PDF/" + month_year + "/" + launchedAt, function () {

							client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, function (data_update, resp) {
								console.log("Fileprocesses Update : " + resp.statusCode)
								console.log("--------------------------- Billing PDF Completed ---------------------------")
							})
						});
					}
				})
			}
		})
	})
}

function configReturn(d3_resp, configname) {

	var count = 0

	for (var c = 0; c < bill_config[configname][0].name.length; c++) {
		for (var p = 0; p < d3_resp.length; p++) {
			if (bill_config[configname][0].name[c]['code'] == d3_resp[p]['param'] && count == 0) {
				count = 1
				return d3_resp[p]['value']
			}
		}
	}
}

module.exports = { billing_pdf_func_call: billing_pdf_func_call }