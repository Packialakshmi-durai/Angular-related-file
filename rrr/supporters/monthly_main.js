var twologic = require('./monthly_twologic');
var threelogic = require('./monthly_threelogic');
var fourlogic = require('./monthly_fourlogic');
var fivelogic = require('./monthly_fivelogic');
var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');

var fileproc_call = async function (AccessToken, ipAddr, launchedAt) {

	await client.get(ipAddr + "/api/fileprocesses?filter[where][subtable]=complete&filter[where][status]=process&filter[where][launchedAt]=" + launchedAt + "&access_token=" + AccessToken, async function (file_data, file_response, file_err) {

		if (file_data.length != 0) {

			var fileproc_id = file_data[0]['id']

			var args_fileproc = {
				data: {
					monthly: "process"
				},
				headers: {
					"Content-Type": "application/json"
				}
			}

			await client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, async function (data_update, resp) {
				monthlyfunc_call(AccessToken, fileproc_id, ipAddr, launchedAt)
			})
		}
	})
}

var monthlyfunc_call = async function (AccessToken, fileproc_id, ipAddr, launchedAt) {

	await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][report_status]=subtable_complete&filter[where][launchedAt]=" + launchedAt + "&filter[limit]=1", async function (dataproc_data, dataproc_response, dataproc_err) {

		if (dataproc_data.length != 0) {

			for (var i in dataproc_data) {

				var errlog = []

				var monthly_data = {}

				var dataproc_id = dataproc_data[i]["id"]
				monthly_data.hierarchy_code = dataproc_data[i]["hierarchy_code"]
				console.log(monthly_data.hierarchy_code)

				monthly_data.month_year = dataproc_data[i]["month_year"]
				monthly_data.date_obj = moment(dataproc_data[i]["meter_rtc"], "DD-MM-YYYY HH:mm:ss").toDate()
				monthly_data.P73 = "No"

				if (dataproc_data[i]["D9"] == "Found")
					monthly_data.P73 = "Yes"

				var args_dataproc = {
					data: {
						report_status: "monthly_process"
					},
					headers: {
						"Content-Type": "application/json"
					}
				}

				await client.post(ipAddr + "/api/dataprocesses/update?where[id]=" + dataproc_id + "&access_token=" + AccessToken, args_dataproc, async function (data_update, resp) {
					await logic_call(dataproc_id, AccessToken, i, dataproc_data, monthly_data, fileproc_id, errlog, ipAddr, launchedAt)
				})
			}
		}
	})
}

var logic_call = async function (dataproc_id, AccessToken, i, dataproc_data, monthly_data, fileproc_id, errlog, ipAddr, launchedAt) {

	await twologic.calltwoFunction(AccessToken, i, dataproc_data, ipAddr, monthly_data, errlog).then(async function (d2_res) {
		await threelogic.callthreeFunction(AccessToken, i, dataproc_data, ipAddr, monthly_data, errlog).then(async function (d3_res) {
			await fourlogic.callfourFunction(AccessToken, i, dataproc_data, ipAddr, monthly_data, errlog).then(async function (d4_res) {
				await fivelogic.callfiveFunction(AccessToken, i, dataproc_data, ipAddr, monthly_data, errlog).then(async function (d5_res) {
					await pushMonthlydata(AccessToken, monthly_data, dataproc_id, fileproc_id, errlog, ipAddr, launchedAt).then(async function (monthly_res) {
					})
				})
			})
		})
	})
}

var pushMonthlydata = async function (AccessToken, monthly_data, dataproc_id, fileproc_id, errlog, ipAddr, launchedAt) {

	return new Promise(function (resolve, reject) {

		var monthly_args = {
			data: monthly_data,
			headers: {
				"Content-Type": "application/json"
			}
		};

		client.post(ipAddr + "/api/monthlies?access_token=" + AccessToken, monthly_args, async function (data, res) {

			if (res.statusCode == 200) {

				var args_dataproc = {
					data: {
						report_status: "monthly_complete",
						monthly_D2: errlog.monthly_D2,
						monthly_D3: errlog.monthly_D3,
						monthly_D4: errlog.monthly_D4,
						monthly_D5: errlog.monthly_D5,
						event: errlog.event
					},
					headers: {
						"Content-Type": "application/json"
					}
				}
				await updateApi(dataproc_id, AccessToken, args_dataproc, fileproc_id, ipAddr, launchedAt)
			}
			else {

				var args_dataproc = {
					data: {
						report_status: "duplicate",
						monthly_D2: errlog.monthly_D2,
						monthly_D3: errlog.monthly_D3,
						monthly_D4: errlog.monthly_D4,
						monthly_D5: errlog.monthly_D5,
						event: errlog.event
					},
					headers: {
						"Content-Type": "application/json"
					}
				}
				await updateApi(dataproc_id, AccessToken, args_dataproc, fileproc_id, ipAddr, launchedAt)
			}
			resolve();
		});
	})
}

var updateApi = async function (dataproc_id, AccessToken, args_dataproc, fileproc_id, ipAddr, launchedAt) {

	return new Promise(async function (resolve, reject) {

		client.post(ipAddr + "/api/dataprocesses/update?where[id]=" + dataproc_id + "&access_token=" + AccessToken, args_dataproc, async function (data_update, resp) {
			console.log("Dataprocess Update : " + resp.statusCode)

			await monthlyfunc_call(AccessToken, fileproc_id, ipAddr, launchedAt)

			await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][or][0][report_status]=subtable_complete&filter[where][or][1][report_status]=monthly_process&filter[where][launchedAt]=" + launchedAt, async function (dataproc_data, dataproc_response, dataproc_err) {

				if (dataproc_data.length == 0) {

					var args_fileproc = {
						data: {
							monthly: "complete",
							status: "complete"
						},
						headers: {
							"Content-Type": "application/json"
						}
					}

					await client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, async function (data_update, resp) {
						console.log("Fileprocesses Update : " + resp.statusCode)
						console.log("------------------------- Monthlies &  Overall Process  Completed -------------------------")
					})
				}
			})
			resolve()
		});
	})
}

module.exports = { fileproc_call: fileproc_call };