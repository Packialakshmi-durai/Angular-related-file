var bill_config = require('./bill_config');
var Client = require('node-rest-client').Client;
var client = new Client();
var jsonQuery = require('json-query')
var zipFolder = require('zip-folder');
var axios = require('axios');
var rimraf = require("rimraf");
var moment = require('moment');
var fs = require('fs');
var numeral = require('numeral');

var billing_report_func_call = function (AccessToken, location_path, ipAddr, launchedAt) {

	client.get(ipAddr + "/api/fileprocesses?filter[where][launchedAt]=" + launchedAt + "&access_token=" + AccessToken, async function (file_data, file_response, file_err) {

		if (file_data.length != 0) {

			var fileproc_id = file_data[0]['id']
			var month_year = file_data[0]['month_year']

			var args_fileproc = {
				data: {
					billing_report: "process"
				},
				headers: {
					"Content-Type": "application/json"
				}
			}

			await client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, async function (data_update, resp) {
				await dataproc_func_call(AccessToken, fileproc_id, launchedAt, location_path, month_year, ipAddr)
			})
		}
	})
}

var dataproc_func_call = async function (AccessToken, fileproc_id, launchedAt, location_path, month_year, ipAddr) {

	await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][billing_report]=new&filter[where][launchedAt]=" + launchedAt + "&filter[limit]=1", async function (dataproc_data, dataproc_response, dataproc_err) {

		if (dataproc_data.length != 0) {
			for (var i in dataproc_data) {

				setTimeout(async function (i) {

					var dataproc_id = dataproc_data[i].id
					var meter_id = dataproc_data[i].meterId
					var hierarchy_code = dataproc_data[i].hierarchy_code
					var meterNo = (dataproc_data[i].hierarchy_code).split("_")[6]
					var meter_code = (dataproc_data[i].hierarchy_code).split("_")[7]
					var d3_date = moment(dataproc_data[i].meter_rtc, 'DD-MM-YYYY HH:mm:ss').format('YYYY-MM')
					var meter_rtc = dataproc_data[i].meter_rtc

					var args_dataproc = {
						data: {
							billing_report: "process"
						},
						headers: {
							"Content-Type": "application/json"
						}
					}
					await process_update(dataproc_id, args_dataproc, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, meterNo, meter_code, ipAddr)
				}, 500 * i, i)
			}
		}
	})
}

var process_update = async function (dataproc_id, args_dataproc, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, meterNo, meter_code, ipAddr) {

	await client.post(ipAddr + "/api/dataprocesses/update?where[id]=" + dataproc_id + "&access_token=" + AccessToken, args_dataproc, async function (data_update, resp) {
		if (resp.statusCode == 200) {
			await logic_call(dataproc_id, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, meterNo, meter_code, ipAddr)
		}
	})
}

var logic_call = async function (dataproc_id, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, meterNo, meter_code, ipAddr) {

	console.log(hierarchy_code)

	axios.get(ipAddr + "/api/d3s?filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][month_year]=" + month_year + "&filter[where][Reset_type]=manual&filter[order]=bill_date_time DESC&access_token=" + AccessToken).then(d3_response => {

		axios.get(ipAddr + "/api/d2s?filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][month_year]=" + month_year + "&access_token=" + AccessToken).then(d2_response => {

			if (d3_response.data.length != 0 && d2_response.data.length != 0) {
				billing_logic(dataproc_id, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, d3_response, d2_response, meterNo, meter_code, ipAddr)
			}
			else {
				var dataproc_status = "Not Found"
				file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, dataproc_status, ipAddr)
			}
		})
	})
}

function billing_logic(dataproc_id, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, d3_response, d2_response, meterNo, meter_code, ipAddr) {

	for (var i = 0; i < d3_response.data.length; i++) {
		d3_response.data[i].format_billdate = moment(d3_response.data[i]['bill_date_time']).format('YYYY-MM')
	}

	for (var i = 0; i < d3_response.data.length; i++) {
		if (d3_date == d3_response.data[i]['format_billdate']) {
			var bill_file = d3_response.data[i]
		}
	}

	if (bill_file != undefined) {

		var RY_Volt = numeral("0").format('0000.00');
		var YB_Volt = numeral("0").format('0000.00');
		var BR_Volt = numeral("0").format('0000.00');

		var RN_Volt = frmt_d2(d2_response.data[0]['D2'][0]['vr']).format('0000.00')
		var YN_Volt = frmt_d2(d2_response.data[0]['D2'][0]['vy']).format('0000.00')
		var BN_Volt = frmt_d2(d2_response.data[0]['D2'][0]['vb']).format('0000.00')

		var RY_Current = numeral("0").format('00000000.00');
		var YB_Current = numeral("0").format('00000000.00');
		var BR_Current = numeral("0").format('00000000.00');

		var RN_Current = frmt_d2(d2_response.data[0]['D2'][0]['ir']).format('00000000.00')
		var YN_Current = frmt_d2(d2_response.data[0]['D2'][0]['iy']).format('00000000.00')
		var BN_Current = frmt_d2(d2_response.data[0]['D2'][0]['ib']).format('00000000.00')

		var kw_im = configReturn(bill_file.D3, 'kw_im')
		kw_im = numeral(kw_im).format('000000000000.000')

		var kva_im = valueChk(jsonQuery('D3[param=kva_im]', { data: bill_file }).value)

		var kwh_im = configReturn(bill_file.D3, 'kwh_im')
		kwh_im = numeral(kwh_im).format('000000000000.000')

		var kvah_im = configReturn(bill_file.D3, 'kvah_im')
		kvah_im = numeral(kvah_im).format('000000000000.000')

		var kvarh_im = valueChk(jsonQuery('D3[param=kvarh_im]', { data: bill_file }).value)

		var kwh_tod = configReturn(bill_file.D3, 'kwh_im_tod')
		var kvah_tod = configReturn(bill_file.D3, 'kvah_im_tod')
		var kw_tod = configReturn(bill_file.D3, 'kw_im_tod')
		var kva_tod = configReturn(bill_file.D3, 'kva_im_tod')
		var kvarh_tod = configReturn(bill_file.D3, 'kvarh_im_tod')

		var kwh_tod_val = []
		var kvah_tod_val = []
		var kw_tod_val = []
		var kva_tod_val = []
		var kvarh_tod_val = []

		for (var t = 0; t < 4; t++) {

			if (kwh_tod != undefined) {
				if (t < kwh_tod.length) {
					kwh_tod_val.push(numeral(kwh_tod[t]).format('000000000000.000'))
				}
				else
					kwh_tod_val.push("000000000000.000")
			}
			else {
				kwh_tod_val.push("000000000000.000")
			}

			if (kvah_tod != undefined) {
				if (t < kvah_tod.length)
					kvah_tod_val.push(numeral(kvah_tod[t]).format('000000000000.000'))
				else
					kvah_tod_val.push("000000000000.000")
			}
			else {
				kvah_tod_val.push("000000000000.000")
			}

			if (kw_tod != undefined) {
				if (t < kw_tod.length)
					kw_tod_val.push(numeral(kw_tod[t]).format('000000000000.000'))
				else
					kw_tod_val.push("000000000000.000")
			}
			else {
				kw_tod_val.push("000000000000.000")
			}

			if (kva_tod != undefined) {
				if (t < kva_tod.length)
					kva_tod_val.push(numeral(kva_tod[t]).format('000000000000.000'))
				else
					kva_tod_val.push("000000000000.000")
			}
			else {
				kva_tod_val.push("000000000000.000")
			}

			if (kvarh_tod != undefined) {
				if (t < kvarh_tod.length)
					kvarh_tod_val.push(numeral(kvarh_tod[t]).format('000000000000.000'))
				else
					kvarh_tod_val.push("000000000000.000")
			}
			else {
				kvarh_tod_val.push("000000000000.000")
			}
		}

		axios.get(ipAddr + "/api/d1s?filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][month_year]=" + month_year + "&access_token=" + AccessToken).then(d1_response => {

			var no_reset = String(d1_response.data[0]['D1'][0]['G32']).padStart(3, 0)

			var make_code_name = { "004": "065", "003": "053", "001": "055", "002": "057", "006": "076", "078": "078", "101": "059" }

			var meter_make = make_code_name[meter_code]

			var MR9Report = meterNo + meter_make + moment(meter_rtc, 'DD-MM-YYYY hh:mm:ss').format('DDMMYYYY') + moment(meter_rtc, 'DD-MM-YYYY hh:mm:ss').format('HH:mm:ss') + "  " + no_reset + RY_Volt + YB_Volt + BR_Volt + RN_Volt + YN_Volt + BN_Volt + RY_Current + YB_Current + BR_Current + RN_Current + YN_Current + BN_Current + kw_im + kva_im + kwh_im + kvah_im + kvarh_im + kw_tod_val[0] + kva_tod_val[0] + kwh_tod_val[0] + kvah_tod_val[0] + kvarh_tod_val[0] + kw_tod_val[1] + kva_tod_val[1] + kwh_tod_val[1] + kvah_tod_val[1] + kvarh_tod_val[1] + kw_tod_val[2] + kva_tod_val[2] + kwh_tod_val[2] + kvah_tod_val[2] + kvarh_tod_val[3] + kw_tod_val[3] + kva_tod_val[3] + kwh_tod_val[3] + kvah_tod_val[3] + kvarh_tod_val[3]

			var FinalTxt = MR9Report.replace(/[.]/g, "");
			var FinalTxt_frmt = FinalTxt.replace(/[-]/g, "");

			process.chdir(location_path + "/")

			if (!fs.existsSync("Bill_Files")) {
				fs.mkdirSync("Bill_Files");
			}

			process.chdir(location_path + "/Bill_Files/")

			if (!fs.existsSync(month_year)) {
				fs.mkdirSync(month_year);
			}

			process.chdir(location_path + "/Bill_Files/" + month_year + "/")

			if (!fs.existsSync(launchedAt)) {
				fs.mkdirSync(launchedAt);
			}

			fs.appendFileSync(location_path + "/Bill_Files/" + month_year + "/" + launchedAt + "/" + "MR9Format.txt", FinalTxt_frmt + '\r\n');

			var dataproc_status = "Found"

			file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, dataproc_status, ipAddr)
		})
	}
	else {
		var dataproc_status = "Not Found"
		file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, dataproc_status, ipAddr)
	}
}

function file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, dataproc_status, ipAddr) {

	var args_dataproc = {
		data: {
			billing_report: "complete",
			billing_csv: dataproc_status
		},
		headers: {
			"Content-Type": "application/json"
		}
	}

	client.post(ipAddr + "/api/dataprocesses/update?where[id]=" + dataproc_id + "&access_token=" + AccessToken, args_dataproc, async function (data_update, resp) {
		console.log("Dataprocesses Update : " + resp.statusCode)

		await dataproc_func_call(AccessToken, fileproc_id, launchedAt, location_path, month_year, ipAddr)

		await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][or][0][billing_report]=new&filter[where][or][1][billing_report]=process&filter[where][launchedAt]=" + launchedAt, async function (dataproc_data, dataproc_response, dataproc_err) {

			if (dataproc_data.length == 0) {

				var not_found_cnt = 0

				client.get(ipAddr + "/api/dataprocesses?filter[where][billing_csv]=Not Found&filter[where][launchedAt]=" + launchedAt + "&access_token=" + AccessToken, async function (cnt_data, cnt_response, cnt_err) {

					if (cnt_data != undefined)
						not_found_cnt = cnt_data.length

					var args_fileproc = {
						data: {
							billing_report: "complete",
							billing_report_count: not_found_cnt
						},
						headers: {
							"Content-Type": "application/json"
						}
					}

					zipFolder(location_path + "/Bill_Files/" + month_year + "/" + launchedAt, location_path + "/Bill_Files/" + month_year + "/" + launchedAt + '.zip', function (err) {
						if (!err) {

							rimraf(location_path + "/Bill_Files/" + month_year + "/" + launchedAt, function () {

								client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, function (data_update, resp) {
									console.log("Fileprocesses Update : " + resp.statusCode)
									console.log("--------------------------- Billing Report Completed ---------------------------")
								})
							});
						}
					})
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

function valueChk(val) {

	if (val == null)
		return numeral("0").format('000000000000.000');
	else
		return numeral(val.value).format('000000000000.000');
}

function frmt_d2(frmt_d2_val) {

	if (frmt_d2_val == null)
		return numeral("0");
	else
		if (frmt_d2_val == "")
			return numeral("0");
		else
			return numeral(frmt_d2_val);
}

module.exports = { billing_report_func_call: billing_report_func_call };