var twologic = require('./subtable_twologic');
var threelogic = require('./subtable_threelogic');
var fourlogic = require('./subtable_fourlogic');
var monthly_main = require('./monthly_main');
var Client = require('node-rest-client').Client;
var client = new Client();

var func_call = async function (AccessToken, ipAddr, launchedAt) {

	await client.get(ipAddr + "/api/fileprocesses?filter[where][parser]=complete&filter[where][status]=process&filter[where][launchedAt]=" + launchedAt + "&access_token=" + AccessToken, async function (file_data, file_response, file_err) {

		if (file_data.length != 0) {

			var fileproc_id = file_data[0]['id']

			var args_fileproc = {
				data: {
					subtable: "process"
				},
				headers: {
					"Content-Type": "application/json"
				}
			}

			await client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, async function (data_update, resp) {
				dataproc_func_call(AccessToken, fileproc_id, ipAddr, launchedAt)
			})
		}
	})
}

var dataproc_func_call = async function (AccessToken, fileproc_id, ipAddr, launchedAt) {

	await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][report_status]=new&filter[where][launchedAt]=" + launchedAt + "&filter[limit]=1", async function (dataproc_data, dataproc_response, dataproc_err) {

		if (dataproc_data.length != 0) {
			for (var i in dataproc_data) {

				setTimeout(async function (i) {

					var dataproc_id = dataproc_data[i].id
					var meter_id = dataproc_data[i].meterId

					var args_dataproc = {
						data: {
							report_status: "subtable_process"
						},
						headers: {
							"Content-Type": "application/json"
						}
					}
					await process_update(dataproc_id, args_dataproc, AccessToken, i, dataproc_data, fileproc_id, meter_id, ipAddr, launchedAt)
				}, 500 * i, i)
			}
		}
	})
}

var process_update = async function (dataproc_id, args_dataproc, AccessToken, i, dataproc_data, fileproc_id, meter_id, ipAddr, launchedAt) {

	await client.post(ipAddr + "/api/dataprocesses/update?where[id]=" + dataproc_id + "&access_token=" + AccessToken, args_dataproc, async function (data_update, resp) {
		if (resp.statusCode == 200) {
			await logic_call(dataproc_id, AccessToken, i, dataproc_data, fileproc_id, meter_id, ipAddr, launchedAt)
		}
	})
}

var logic_call = async function (dataproc_id, AccessToken, i, dataproc_data, fileproc_id, meter_id, ipAddr, launchedAt) {

	console.log(dataproc_data[i]['hierarchy_code'])

	var dataproc_det = []

	await twologic.calltwoFunction(AccessToken, i, dataproc_data, ipAddr, dataproc_det, meter_id).then(async function (d2_data) {
	//	await threelogic.callthreeFunction(AccessToken, i, dataproc_data, ipAddr, dataproc_det, meter_id).then(async function (d3_data) {
			await fourlogic.callfourFunction(AccessToken, i, dataproc_data, ipAddr, dataproc_det, meter_id).then(async function (d4_data) {
				setTimeout(async function () {
					await updateApi(dataproc_id, AccessToken, dataproc_det, fileproc_id, ipAddr, launchedAt).then(async function (res) {
				//	})
				}, 1000)
			})
		})
	})
}

var updateApi = async function (dataproc_id, AccessToken, dataproc_det, fileproc_id, ipAddr, launchedAt) {

	return new Promise(function (resolve, reject) {

		var args_dataproc = {
			data: {
				report_status: "subtable_complete",
				bill_from_date: dataproc_det.bill_from_date,
				bill_to_date: dataproc_det.bill_to_date,
				wiring: dataproc_det.wiring,
				consumption: dataproc_det.consumption,
				daily: dataproc_det.daily
			},
			headers: {
				"Content-Type": "application/json"
			}
		}

		client.post(ipAddr + "/api/dataprocesses/update?where[id]=" + dataproc_id + "&access_token=" + AccessToken, args_dataproc, async function (data_update, resp) {
			console.log("Dataprocesses Update : " + resp.statusCode)

			await dataproc_func_call(AccessToken, fileproc_id, ipAddr, launchedAt)

			await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][or][0][report_status]=new&filter[where][or][1][report_status]=subtable_process&filter[where][launchedAt]=" + launchedAt, async function (dataproc_data, dataproc_response, dataproc_err) {

				if (dataproc_data.length == 0) {

					var args_fileproc = {
						data: {
							subtable: "complete"
						},
						headers: {
							"Content-Type": "application/json"
						}
					}

					await client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, async function (data_update, resp) {
						console.log("Fileprocesses Update : " + resp.statusCode)
						console.log("--------------------------- Subtable Completed ---------------------------")
						if (resp.statusCode == 200)
							monthly_main.fileproc_call(AccessToken, ipAddr, launchedAt)
					})
				}
			})
			resolve();
		});
	})
}

module.exports = { func_call: func_call };