var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');
var groupBy = require('group-by');

function callthreeFunction(AccessToken, i, dataproc_data, ipAddr, dataproc_det, meter_id) {

	return new Promise(async function (resolve, reject) {

		try {

			var hierarchy_code = dataproc_data[i]['hierarchy_code']
			var meter_rtc = dataproc_data[i]['meter_rtc']

			var d3_from_date = moment(meter_rtc, 'DD-MM-YYYY HH:mm:ss').subtract(13, 'months').format('DD-MM-YYYY HH:mm:ss')
			d3_from_date = moment(d3_from_date, 'DD-MM-YYYY HH:mm:ss').toISOString()
			var d3_to_date = moment(meter_rtc, 'DD-MM-YYYY HH:mm:ss').toISOString()

			await client.get(ipAddr + "/api/d3s?filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][and][0][bill_date_time][gte]=" + d3_from_date + "&filter[where][and][1][bill_date_time][lte]=" + d3_to_date + "&filter[order]=bill_date_time ASC&access_token=" + AccessToken, async function (d3_data, d3_response, d3_err) {

				await client.get(ipAddr + "/api/meters?access_token=" + AccessToken + "&filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][meter_status]=1", async function (meter_data, meter_response, meter_err) {

					var bill_mf = 1
					if (meter_data.length != 0 && meter_data[0]['bill_mf'] != null) {
						bill_mf = meter_data[0]['bill_mf']
					}

					if (d3_data.length != 0) {
						var bill = []

						for (var d3i = 0; d3i < d3_data.length; d3i++) {
							var kwh_im = null
							var kwh_im_t = null
							var kwh_im_abs = null
							var kvah_im = null
							var kvah_abs = null
							var kwh_ex = null
							var kvah_ex = null
							var kw_im = null
							var kw_im_t = null
							var kva_im = null

							for (var a = 0; a < d3_data[d3i]["D3"].length; a++) {

								if ((d3_data[d3i]["D3"][a]["param"]) == "kwh_im") {
									kwh_im = (d3_data[d3i]["D3"][a]["value"])
								}
								if ((d3_data[d3i]["D3"][a]["param"]) == "kwh_im_t") {
									kwh_im_t = (d3_data[d3i]["D3"][a]["value"])
								}
								if ((d3_data[d3i]["D3"][a]["param"]) == "kwh_abs") {
									kwh_im_abs = (d3_data[d3i]["D3"][a]["value"])
								}
								if ((d3_data[d3i]["D3"][a]["param"]) == "kvah_im") {
									kvah_im = (d3_data[d3i]["D3"][a]["value"])
								}
								if ((d3_data[d3i]["D3"][a]["param"]) == "kvah_abs") {
									kvah_im_abs = (d3_data[d3i]["D3"][a]["value"])
								}
								if ((d3_data[d3i]["D3"][a]["param"]) == "kwh_ex") {
									kwh_ex = (d3_data[d3i]["D3"][a]["value"])
								}
								if ((d3_data[d3i]["D3"][a]["param"]) == "kvah_ex") {
									kvah_ex = (d3_data[d3i]["D3"][a]["value"])
								}
								if ((d3_data[d3i]["D3"][a]["param"]) == "kw_im") {
									kw_im = (d3_data[d3i]["D3"][a]["value"])
								}
								if ((d3_data[d3i]["D3"][a]["param"]) == "kw_im_t") {
									kw_im_t = (d3_data[d3i]["D3"][a]["value"])
								}
								if ((d3_data[d3i]["D3"][a]["param"]) == "kva_im") {
									kva_im = (d3_data[d3i]["D3"][a]["value"])
								}
							}

							if (d3_data[d3i]["Reset_type"] == "auto") {
								reset_value = 0
							}
							else if (d3_data[d3i]["Reset_type"] == "manual") {
								reset_value = 1
							}

							bill.push({
								"bill_date_time": (moment(d3_data[d3i].bill_date_time).format('DD-MM-YYYY')),
								"kwh_im": kwh_im,
								"kwh_im_t": kwh_im_t,
								"kwh_im_abs": kwh_im_abs,
								"kvah_im": kvah_im,
								"kvah_abs": kvah_im_abs,
								"kwh_ex": kwh_ex,
								"kvah_ex": kvah_ex,
								"kw_im": kw_im,
								"kw_im_t": kw_im_t,
								"kva_im": kva_im,
								"reset_type": reset_value
							})
						}

						var auto_data = groupBy(bill, 'reset_type')[0]
						var manual_data = groupBy(bill, 'reset_type')[1]

						var cons_data = []

						if (manual_data != undefined) {
							if (manual_data.length > 1) {

								for (var i = 1; i < manual_data.length; i++) {
									c = moment(manual_data[i - 1]['bill_date_time'], "DD-MM-YYYY");
									d = moment(manual_data[i]['bill_date_time'], "DD-MM-YYYY");

									if (d.diff(c, 'months') == 1) {

										var imp_kwh = null
										var imp_kwh_tot = null
										var imp_kwh_abs = null
										var imp_kvah = null
										var imp_kvah_abs = null
										var exp_kwh = null
										var exp_kvah = null
										var imp_kw = null
										var imp_kw_tot = null
										var imp_kva = null

										//consumption calculation
										if (manual_data[i]['kwh_im'] != null && manual_data[i - 1]['kwh_im'] != null) {
											imp_kwh = ((parseFloat(manual_data[i]['kwh_im']) - parseFloat(manual_data[i - 1]['kwh_im'])) * bill_mf)
										}
										if (manual_data[i]['kwh_im_t'] != null && manual_data[i - 1]['kwh_im_t'] != null) {
											imp_kwh_tot = ((parseFloat(manual_data[i]['kwh_im_t']) - parseFloat(manual_data[i - 1]['kwh_im_t'])) * bill_mf)
										}
										if (manual_data[i]['kwh_im_abs'] != null && manual_data[i - 1]['kwh_im_abs'] != null) {
											imp_kwh_abs = ((parseFloat(manual_data[i]['kwh_im_abs']) - parseFloat(manual_data[i - 1]['kwh_im_abs'])) * bill_mf)
										}
										if (manual_data[i]['kvah_im'] != null && manual_data[i - 1]['kvah_im'] != null) {
											imp_kvah = ((parseFloat(manual_data[i]['kvah_im']) - parseFloat(manual_data[i - 1]['kvah_im'])) * bill_mf)
										}
										if (manual_data[i]['kvah_abs'] != null && manual_data[i - 1]['kvah_abs'] != null) {
											imp_kvah_abs = ((parseFloat(manual_data[i]['kvah_abs']) - parseFloat(manual_data[i - 1]['kvah_abs'])) * bill_mf)
										}
										if (manual_data[i]['kwh_ex'] != null && manual_data[i - 1]['kwh_ex'] != null) {
											exp_kwh = ((parseFloat(manual_data[i]['kwh_ex']) - parseFloat(manual_data[i - 1]['kwh_ex'])) * bill_mf)
										}
										if (manual_data[i]['kvah_ex'] != null && manual_data[i - 1]['kvah_ex'] != null) {
											exp_kvah = ((parseFloat(manual_data[i]['kvah_ex']) - parseFloat(manual_data[i - 1]['kvah_ex'])) * bill_mf)
										}

										//MD calculation
										if (manual_data[i]['kw_im'] != null) {
											imp_kw = ((parseFloat(manual_data[i]['kw_im'])) * bill_mf)
										}
										if (manual_data[i]['kw_im_t'] != null) {
											imp_kw_tot = ((parseFloat(manual_data[i]['kw_im_t'])) * bill_mf)
										}
										if (manual_data[i]['kva_im'] != null) {
											imp_kva = ((parseFloat(manual_data[i]['kva_im'])) * bill_mf)
										}

										if ((Number(moment(manual_data[i]['bill_date_time'], "DD-MM-YYYY").format('DD'))) < 20) {

											cons_data.push({
												"hierarchy_code": hierarchy_code,
												"meterId": meter_id,
												"date_obj": moment(manual_data[i - 1]['bill_date_time'], "DD-MM-YYYY").toDate(),
												"date": c.format("DD-MM-YYYY"),
												"reset_type": 1,
												"kwh_im": imp_kwh,
												"kwh_im_t": imp_kwh_tot,
												"kwh_im_abs": imp_kwh_abs,
												"kvah_im": imp_kvah,
												"kvah_abs": imp_kvah_abs,
												"kwh_ex": exp_kwh,
												"kvah_ex": exp_kvah,
												"kw_im": imp_kw,
												"kw_im_t": imp_kw_tot,
												"kva_im": imp_kva
											})
										}
										else {
											cons_data.push({
												"hierarchy_code": hierarchy_code,
												"meterId": meter_id,
												"date_obj": moment(manual_data[i]['bill_date_time'], "DD-MM-YYYY").toDate(),
												"date": d.format("DD-MM-YYYY"),
												"reset_type": 1,
												"kwh_im": imp_kwh,
												"kwh_im_t": imp_kwh_tot,
												"kwh_im_abs": imp_kwh_abs,
												"kvah_im": imp_kvah,
												"kvah_abs": imp_kvah_abs,
												"kwh_ex": exp_kwh,
												"kvah_ex": exp_kvah,
												"kw_im": imp_kw,
												"kw_im_t": imp_kw_tot,
												"kva_im": imp_kva
											})
										}
									}
								}
							}
						}
						if (auto_data != undefined) {
							if (auto_data.length > 1) {

								for (var i = 1; i < auto_data.length; i++) {
									c = moment(auto_data[i - 1]['bill_date_time'], "DD-MM-YYYY");
									d = moment(auto_data[i]['bill_date_time'], "DD-MM-YYYY");

									if (d.diff(c, 'months') == 1) {

										var imp_kwh = null
										var imp_kwh_tot = null
										var imp_kwh_abs = null
										var imp_kvah = null
										var imp_kvah_abs = null
										var exp_kwh = null
										var exp_kvah = null
										var imp_kw = null
										var imp_kw_tot = null
										var imp_kva = null

										//consumption calculation
										if (auto_data[i]['kwh_im'] != null && auto_data[i - 1]['kwh_im'] != null) {
											imp_kwh = ((parseFloat(auto_data[i]['kwh_im']) - parseFloat(auto_data[i - 1]['kwh_im'])) * bill_mf)
										}
										if (auto_data[i]['kwh_im_t'] != null && auto_data[i - 1]['kwh_im_t'] != null) {
											imp_kwh_tot = ((parseFloat(auto_data[i]['kwh_im_t']) - parseFloat(auto_data[i - 1]['kwh_im_t'])) * bill_mf)
										}
										if (auto_data[i]['kwh_im_abs'] != null && auto_data[i - 1]['kwh_im_abs'] != null) {
											imp_kwh_abs = ((parseFloat(auto_data[i]['kwh_im_abs']) - parseFloat(auto_data[i - 1]['kwh_im_abs'])) * bill_mf)
										}
										if (auto_data[i]['kvah_im'] != null && auto_data[i - 1]['kvah_im'] != null) {
											imp_kvah = ((parseFloat(auto_data[i]['kvah_im']) - parseFloat(auto_data[i - 1]['kvah_im'])) * bill_mf)
										}
										if (auto_data[i]['kvah_abs'] != null && auto_data[i - 1]['kvah_abs'] != null) {
											imp_kvah_abs = ((parseFloat(auto_data[i]['kvah_abs']) - parseFloat(auto_data[i - 1]['kvah_abs'])) * bill_mf)
										}
										if (auto_data[i]['kwh_ex'] != null && auto_data[i - 1]['kwh_ex'] != null) {
											exp_kwh = ((parseFloat(auto_data[i]['kwh_ex']) - parseFloat(auto_data[i - 1]['kwh_ex'])) * bill_mf)
										}
										if (auto_data[i]['kvah_ex'] != null && auto_data[i - 1]['kvah_ex'] != null) {
											exp_kvah = ((parseFloat(auto_data[i]['kvah_ex']) - parseFloat(auto_data[i - 1]['kvah_ex'])) * bill_mf)
										}

										//MD calculation
										if (auto_data[i]['kw_im'] != null) {
											imp_kw = ((parseFloat(auto_data[i]['kw_im'])) * bill_mf)
										}
										if (auto_data[i]['kw_im_t'] != null) {
											imp_kw_tot = ((parseFloat(auto_data[i]['kw_im_t'])) * bill_mf)
										}
										if (auto_data[i]['kva_im'] != null) {
											imp_kva = ((parseFloat(auto_data[i]['kva_im'])) * bill_mf)
										}

										if ((Number(moment(auto_data[i]['bill_date_time'], "DD-MM-YYYY").format('DD'))) < 20) {

											cons_data.push({
												"hierarchy_code": hierarchy_code,
												"meterId": meter_id,
												"date_obj": moment(auto_data[i - 1]['bill_date_time'], "DD-MM-YYYY").toDate(),
												"date": c.format("DD-MM-YYYY"),
												"reset_type": 0,
												"kwh_im": imp_kwh,
												"kwh_im_t": imp_kwh_tot,
												"kwh_im_abs": imp_kwh_abs,
												"kvah_im": imp_kvah,
												"kvah_abs": imp_kvah_abs,
												"kwh_ex": exp_kwh,
												"kvah_ex": exp_kvah,
												"kw_im": imp_kw,
												"kw_im_t": imp_kw_tot,
												"kva_im": imp_kva
											})
										}
										else {
											cons_data.push({
												"hierarchy_code": hierarchy_code,
												"meterId": meter_id,
												"date_obj": moment(auto_data[i]['bill_date_time'], "DD-MM-YYYY").toDate(),
												"date": d.format("DD-MM-YYYY"),
												"reset_type": 0,
												"kwh_im": imp_kwh,
												"kwh_im_t": imp_kwh_tot,
												"kwh_im_abs": imp_kwh_abs,
												"kvah_im": imp_kvah,
												"kvah_abs": imp_kvah_abs,
												"kwh_ex": exp_kwh,
												"kvah_ex": exp_kvah,
												"kw_im": imp_kw,
												"kw_im_t": imp_kw_tot,
												"kva_im": imp_kva
											})
										}
									}
								}
							}
						}
						if (cons_data.length != 0) {
							push_d3(AccessToken, cons_data, ipAddr)

							dataproc_det.bill_from_date = "-"
							dataproc_det.bill_to_date = "-"

							if ((auto_data != undefined && manual_data != undefined) || (auto_data != undefined && manual_data == undefined)) {
								if (auto_data.length >= 2) {
									dataproc_det.bill_from_date = auto_data[auto_data.length - 2]['bill_date_time']
									dataproc_det.bill_to_date = auto_data[auto_data.length - 1]['bill_date_time']
								}
							}
							else {
								if (manual_data != undefined && manual_data.length >= 2) {
									dataproc_det.bill_from_date = manual_data[manual_data.length - 2]['bill_date_time']
									dataproc_det.bill_to_date = manual_data[manual_data.length - 1]['bill_date_time']
								}
							}
							dataproc_det.consumption = "Found"
							resolve(dataproc_det)
						}
						else {
							dataproc_det.consumption = "Not Found"
							dataproc_det.bill_from_date = "-"
							dataproc_det.bill_to_date = "-"
							resolve(dataproc_det)
						}
					}
					else {
						dataproc_det.consumption = "Not Found"
						dataproc_det.bill_from_date = "-"
						dataproc_det.bill_to_date = "-"
						resolve(dataproc_det)
					}
				})
			})
		}
		catch (e) {
			dataproc_det.consumption = "Error"
			dataproc_det.bill_from_date = "-"
			dataproc_det.bill_to_date = "-"
			resolve(dataproc_det)
		}
	})
}

var push_d3 = async function (AccessToken, cons_data, ipAddr) {

	var args = {
		data: cons_data,
		headers: {
			"Content-Type": "application/json"
		}
	};

	await client.post(ipAddr + "/api/consumptions?access_token=" + AccessToken, args, function (data, res) {
	});
}

module.exports = { callthreeFunction: callthreeFunction };