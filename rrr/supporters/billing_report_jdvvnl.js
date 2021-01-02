var bill_config = require('./bill_config');
var Client = require('node-rest-client').Client;
var client = new Client();
var createIfNotExist = require("create-if-not-exist");
var jsonQuery = require('json-query')
var zipFolder = require('zip-folder');
var fs = require('fs');
var axios = require('axios');
var rimraf = require("rimraf");
var moment = require('moment');

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
					var d3_date = moment(dataproc_data[i].meter_rtc, 'DD-MM-YYYY HH:mm:ss').format('MM-YYYY')
					var meter_rtc = dataproc_data[i].meter_rtc

					var args_dataproc = {
						data: {
							billing_report: "process"
						},
						headers: {
							"Content-Type": "application/json"
						}
					}
					await process_update(dataproc_id, args_dataproc, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, ipAddr)
				}, 500 * i, i)
			}
		}
	})
}

var process_update = async function (dataproc_id, args_dataproc, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, ipAddr) {

	await client.post(ipAddr + "/api/dataprocesses/update?where[id]=" + dataproc_id + "&access_token=" + AccessToken, args_dataproc, async function (data_update, resp) {
		if (resp.statusCode == 200) {
			await logic_call(dataproc_id, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, ipAddr)
		}
	})
}

var logic_call = async function (dataproc_id, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, ipAddr) {

	console.log(hierarchy_code)

	axios.get(ipAddr + "/api/d3s?filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][month_year]=" + month_year + "&filter[order]=bill_date_time DESC&access_token=" + AccessToken).then(d3_response => {

		if (d3_response.data.length != 0) {
			billing_logic(dataproc_id, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, d3_response, ipAddr)
		}
		else {
			var dataproc_status = "Not Found"
			file_update(dataproc_id, AccessToken, fileproc_id, launchedAt, location_path, month_year, dataproc_status, ipAddr)
		}
	})
}

function billing_logic(dataproc_id, AccessToken, fileproc_id, meter_id, month_year, launchedAt, location_path, meter_rtc, hierarchy_code, d3_date, d3_response, ipAddr) {

	for (var i = 0; i < d3_response.data.length; i++) {
		d3_response.data[i].format_billdate = moment(d3_response.data[i]['bill_date_time']).format('MM-YYYY')
		d3_response.data[i].format_billdatetime = moment(d3_response.data[i]['bill_date_time']).format('DD-MM-YYYY HH:mm:ss')
	}

	var date_chk=moment(meter_rtc,"DD-MM-YYYY HH:mm:ss").format("DD")
	for (var i = 0; i < d3_response.data.length; i++) {
		
		if (d3_date == d3_response.data[i]['format_billdate']) {
			
			if (d3_response.data[i]['Reset_type'] == "auto" && (date_chk>=1 && date_chk<=18)) {
				var bill_file = d3_response.data[i]
				var bill_date = d3_response.data[i]['format_billdatetime']
			}

			else if (d3_response.data[i]['Reset_type'] == "manual") {
				var bill_file = d3_response.data[i]
				var bill_date = d3_response.data[i]['format_billdatetime']
			}
		}
	}

	if (bill_file != undefined) {

		var kwh_im = configReturn(bill_file.D3, 'kwh_im')
		if (kwh_im == undefined)
			var kwh_im = "-"
	
		var kwh_ex = valueChk(jsonQuery('D3[param=kwh_ex]', { data: bill_file }).value)

		var kvah_im = configReturn(bill_file.D3, 'kvah_im')
		if (kvah_im == undefined)
			var kvah_im = "-"

		var kvah_ex = valueChk(jsonQuery('D3[param=kvah_ex]', { data: bill_file }).value)

		var kw_im = configReturn(bill_file.D3, 'kw_im')
		if (kw_im == undefined)
			var kw_im = "-"

		var kw_ex = valueChk(jsonQuery('D3[param=kw_ex]', { data: bill_file }).value)
		var kva_im = valueChk(jsonQuery('D3[param=kva_im]', { data: bill_file }).value)
		var kva_ex = valueChk(jsonQuery('D3[param=kva_ex]', { data: bill_file }).value)
		var pf_im = valueChk(jsonQuery('D3[param=pf_im]', { data: bill_file }).value)
		var pf_ex = valueChk(jsonQuery('D3[param=pf_ex]', { data: bill_file }).value)
		var kwh_tod = configReturn(bill_file.D3, 'kwh_im_tod')
		var kvah_tod = configReturn(bill_file.D3, 'kvah_im_tod')

		var kwh_tod_val = []
		var kvah_tod_val = []

		for (var t = 0; t < 8; t++) {

			if (kwh_tod != undefined) {
				if (t < kwh_tod.length)
					kwh_tod_val.push(kwh_tod[t])
				else
					kwh_tod_val.push("-")
			}
			else {
				kwh_tod_val.push("-")
			}

			if (kvah_tod != undefined) {
				if (t < kvah_tod.length)
					kvah_tod_val.push(kvah_tod[t])
				else
					kvah_tod_val.push("-")
			}
			else {
				kvah_tod_val.push("-")
			}
		}

		axios.get(ipAddr + "/api/meters?filter[where][id]=" + meter_id + "&access_token=" + AccessToken).then(meter_response => {

			if (meter_response.data.length != 0) {
				
				var Format1 = meter_response.data[0].consumer_no + ", " + meter_response.data[0].meter_no + ", " + kwh_im + ", " + kvah_im + ", " + kva_im + "," + "OK" + "," + 0 + "," + 0 + '\r\n';
				var Format2 = meter_response.data[0].consumer_no + "," + meter_response.data[0].consumer_name + "," + meter_response.data[0].meter_no + "," + meter_rtc + "," + bill_date + "," + meter_response.data[0].make_code + "," + meter_response.data[0].meter_com_type + "," + kwh_im+ "," + kvah_im + "," + kva_im + "," + kw_im + "," + pf_im + "," + kwh_ex + "," + kvah_ex + "," + kva_ex + "," + kw_ex + "," + pf_ex + "," + kwh_tod_val[0] + "," + kwh_tod_val[1] + "," + kwh_tod_val[2] + "," + kwh_tod_val[3] + "," + kwh_tod_val[4] + "," + kwh_tod_val[5] + "," + kwh_tod_val[6] + "," + kwh_tod_val[7] + "," + kvah_tod_val[0] + "," + kvah_tod_val[1] + "," + kvah_tod_val[2] + "," + kvah_tod_val[3] + "," + kvah_tod_val[4] + "," + kvah_tod_val[5] + "," + kvah_tod_val[6] + "," + kvah_tod_val[7] + '\r\n';
			}
			else {
				var Format1 = "---------------" + ", " + hierarchy_code + ", " + kwh_im + ", " + kvah_im + ", " + kva_im + "," + "OK" + "," + 0 + "," + 0 + '\r\n';
				var Format2 = "---------------" + "," + "---------------" + "," + hierarchy_code + "," + meter_rtc + "," + bill_date + "," + "---------------" + "," + "---------------" + "," + kwh_im + "," + kvah_im + "," + kva_im + "," + kw_im + "," + pf_im + "," + kwh_ex + "," + kvah_ex + "," + kva_ex + "," + kw_ex + "," + pf_ex + "," + kwh_tod_val[0] + "," + kwh_tod_val[1] + "," + kwh_tod_val[2] + "," + kwh_tod_val[3] + "," + kwh_tod_val[4] + "," + kwh_tod_val[5] + "," + kwh_tod_val[6] + "," + kwh_tod_val[7] + "," + kvah_tod_val[0] + "," + kvah_tod_val[1] + "," + kvah_tod_val[2] + "," + kvah_tod_val[3] + "," + kvah_tod_val[4] + "," + kvah_tod_val[5] + "," + kvah_tod_val[6] + "," + kvah_tod_val[7] + '\r\n';
			}
			
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

			var HeaderNomal = "ConsumerNo,ConsumerName,MeterNumber,MeterRTC,BillDate,MeterMake,MeterType,kWh_Imp,kVAh_Imp,kVA_Imp,kw_Imp,pf_Imp,kwh_ex,kvah_ex,kva_ex,kw_ex,pf_ex,tod_1_kwh_im ,tod_2_kwh_im ,tod_3_kwh_im ,tod_4_kwh_im ,tod_5_kwh_im ,tod_6_kwh_im ,tod_7_kwh_im ,tod_8_kwh_im ,tod_1_kvah_im ,tod_2_kvah_im ,tod_3_kvah_im ,tod_4_kvah_im ,tod_5_kvah_im ,tod_6_kvah_im ,tod_7_kvah_im ,tod_8_kvah_im"
			createIfNotExist(location_path + "/Bill_Files/" + month_year + "/" + launchedAt + "/" + 'RJFormat2.xls', HeaderNomal + '\r\n');

			fs.appendFileSync(location_path + "/Bill_Files/" + month_year + "/" + launchedAt + "/" + 'RJFormat1.txt', Format1);
			fs.appendFileSync(location_path + "/Bill_Files/" + month_year + "/" + launchedAt + "/" + 'RJFormat2.xls', Format2);

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
	var flag=0
	for (var c = 0; c < bill_config[configname][0].name.length; c++) {
		for (var p = 0; p < d3_resp.length; p++) {
			if(d3_resp[p]['value']!=0){
				if (bill_config[configname][0].name[c]['code'] == d3_resp[p]['param'] && count == 0) {
					count = 1
					flag=0
					return d3_resp[p]['value']
				}
				
			}
			if(d3_resp[p]['value']==0 && count==0){
					flag=1
			}
		}
	}
	if (flag==1){
		return 0
	}
}

function valueChk(val) {

	if (val == null)
		return "-";
	else
		return val.value;
}

module.exports = { billing_report_func_call: billing_report_func_call };