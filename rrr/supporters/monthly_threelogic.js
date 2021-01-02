var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');
var groupBy = require('group-by');

function callthreeFunction(AccessToken, i, dataproc_data, ipAddr, monthly_data, errlog) {

	return new Promise(async function (resolve, reject) {

		try {

			monthly_data.P42 = null
			monthly_data.P43 = null
			monthly_data.P44 = null
			monthly_data.P45 = null
			monthly_data.P46 = null
			monthly_data.P47 = null
			monthly_data.P48 = null
			monthly_data.P49 = null
			monthly_data.P83 = null
			monthly_data.P84 = null
			monthly_data.P85 = null
			monthly_data.P86 = null
			monthly_data.P87 = null
			monthly_data.P88 = null
			monthly_data.P89 = null
			monthly_data.P90 = null
			monthly_data.P91 = null
			monthly_data.P92 = null
			monthly_data.P93 = null
			monthly_data.P94 = null
			monthly_data.P95 = null
			monthly_data.P96 = null
			monthly_data.P97 = null
			monthly_data.P98 = null
			monthly_data.P99 = null
			monthly_data.P100 = null

			var d3_from_date = moment(dataproc_data[i]['meter_rtc'], 'DD-MM-YYYY HH:mm:ss').subtract(13, 'months').format('DD-MM-YYYY HH:mm:ss')
			d3_from_date = moment(d3_from_date, 'DD-MM-YYYY HH:mm:ss').toISOString()
			var d3_to_date = moment(dataproc_data[i]['meter_rtc'], 'DD-MM-YYYY HH:mm:ss').add(1, 'minutes').format('DD-MM-YYYY HH:mm:ss')
			d3_to_date = moment(d3_to_date, 'DD-MM-YYYY HH:mm:ss').toISOString()

			var d3_parser_from_date = moment(dataproc_data[i]['meter_rtc'], 'DD-MM-YYYY HH:mm:ss').subtract(5, 'months').format('DD-MM-YYYY HH:mm:ss')
			d3_parser_from_date = moment(d3_parser_from_date, 'DD-MM-YYYY HH:mm:ss').toISOString()

			await client.get(ipAddr + "/api/consumptions?filter[where][hierarchy_code]=" + monthly_data.hierarchy_code + "&filter[where][and][0][date_obj][gte]=" + d3_from_date + "&filter[where][and][1][date_obj][lte]=" + d3_to_date + "&filter[order]=date_obj ASC&access_token=" + AccessToken, async function (d3_data, d3_response, d3_err) {
				console.log(ipAddr + "/api/d3s?filter[where][hierarchy_code]=" + monthly_data.hierarchy_code + "&filter[where][Reset_type]=manual&filter[where][and][0][bill_date_time][gte]=" + d3_parser_from_date + "&filter[where][and][1][bill_date_time][lte]=" + d3_to_date + "&filter[order]=bill_date_time ASC&access_token=" + AccessToken)
				await client.get(ipAddr + "/api/d3s?filter[where][hierarchy_code]=" + monthly_data.hierarchy_code + "&filter[where][Reset_type]=manual&filter[where][and][0][bill_date_time][gte]=" + d3_parser_from_date + "&filter[where][and][1][bill_date_time][lte]=" + d3_to_date + "&filter[order]=bill_date_time ASC&access_token=" + AccessToken, async function (d3_parser_data, d3_parser_response, d3_parser_err) {
					console.log(d3_data.length)
					if (d3_data.length != 0 && d3_parser_data.length != 0) {
						console.log("************************")
						var auto_data = groupBy(d3_data, 'reset_type')[0]
						var manual_data = groupBy(d3_data, 'reset_type')[1]

						var kwh_key = []
						var kvah_key = []
						var md_key = []

						if (auto_data != undefined) {
							if (auto_data.length == 1) {
								var crnt_mnth_cons = auto_data[auto_data.length - 1]
							}
							if (auto_data.length >= 2) {
								var crnt_mnth_cons = auto_data[auto_data.length - 1]
								var prv_mnth_cons = auto_data[auto_data.length - 2]
							}
							var cons_md = auto_data
						}
						else {
							if (manual_data != undefined) {
								if (manual_data.length == 1) {
									var crnt_mnth_cons = manual_data[manual_data.length - 1]
								}
								if (manual_data.length >= 2) {
									var crnt_mnth_cons = manual_data[manual_data.length - 1]
									var prv_mnth_cons = manual_data[manual_data.length - 2]
								}
								var cons_md = manual_data
							}
						}

						// P42 logic
						if (crnt_mnth_cons['kwh_im_abs'] != null) {
							monthly_data.P42 = crnt_mnth_cons['kwh_im_abs']
							kwh_key.push('kwh_im_abs')
						}
						if (monthly_data.P42 == null && crnt_mnth_cons['kwh_im_t'] != null) {
							monthly_data.P42 = crnt_mnth_cons['kwh_im_t']
							kwh_key.push('kwh_im_t')
						}
						if (monthly_data.P42 == null && crnt_mnth_cons['kwh_im'] != null) {
							monthly_data.P42 = crnt_mnth_cons['kwh_im']
							kwh_key.push('kwh_im')
						}

						// P43 logic
						if (crnt_mnth_cons['kvah_abs'] != null) {
							monthly_data.P43 = crnt_mnth_cons['kvah_abs']
							kvah_key.push('kvah_abs')
						}
						if (monthly_data.P43 == null && crnt_mnth_cons['kvah_im'] != null) {
							monthly_data.P43 = crnt_mnth_cons['kvah_im']
							kvah_key.push('kvah_im')
						}

						// P44 logic
						if (monthly_data.P42 != null && monthly_data.P43 != null && monthly_data.P42 != "0.00" && monthly_data.P43 != "0.00") {
							monthly_data.P44 = (parseFloat(monthly_data.P42) / parseFloat(monthly_data.P43))
						}

						// P45 logic
						if (monthly_data.P42 != null && monthly_data.P14 != null && monthly_data.P42 != "0.00") {
							monthly_data.P45 = (parseFloat(monthly_data.P42) / parseFloat(monthly_data.P14))
						}

						// P46 logic
						if (prv_mnth_cons != undefined) {
							if (monthly_data.P42 != null && monthly_data.P42 != "0.00" && prv_mnth_cons[kwh_key[0]] != "0.00") {
								monthly_data.P46 = (parseFloat(monthly_data.P42) / parseFloat(prv_mnth_cons[kwh_key[0]]))
							}
						}

						// P48 logic
						console.log("__________________________________________________________")
						console.log(crnt_mnth_cons)
						if (crnt_mnth_cons['kva_im'] != null) {
							monthly_data.P48 = crnt_mnth_cons['kva_im']
							md_key.push('kva_im')
						}
						if (monthly_data.P48 == null && crnt_mnth_cons['kw_im_t'] != null) {
							monthly_data.P48 = crnt_mnth_cons['kw_im_t']
							md_key.push('kw_im_t')
						}
						if (monthly_data.P48 == null && crnt_mnth_cons['kw_im'] != null) {
							monthly_data.P48 = crnt_mnth_cons['kw_im']
							md_key.push('kw_im')
						}

						// P47 logic and P49 logic
						var cons_12_sum = 0
						var md_12_sum = 0

						for (var k = 0; k <= cons_md.length - 2; k++) {
							cons_12_sum += parseFloat(cons_md[k][kwh_key[0]])
							md_12_sum += parseFloat(cons_md[k][md_key[0]])
						}

						if (monthly_data.P42 != null && monthly_data.P42 != "0.00") {
							monthly_data.P47 = (parseFloat(monthly_data.P42) / (cons_12_sum / parseFloat(cons_md.length - 2)))
							monthly_data.P49 = (parseFloat(monthly_data.P48) / (md_12_sum / parseFloat(cons_md.length - 2)))
						}

						// P83, P84, P85, P86 logic
						if (moment(d3_parser_data[d3_parser_data.length - 1]['bill_date_time']).format('MM-YYYY') == monthly_data.month_year) {
							monthly_data.P94 = moment(d3_parser_data[d3_parser_data.length - 1]['bill_date_time']).format('DD-MM-YYYY HH:mm')

							for (var i = 0; i < d3_parser_data[d3_parser_data.length - 1]['D3'].length; i++) {

								if (Object.values(d3_parser_data[d3_parser_data.length - 1]['D3'][i])[0] == "kw_im_t") {
									monthly_data.P83 = d3_parser_data[d3_parser_data.length - 1]['D3'][i]['value']
									monthly_data.P84 = d3_parser_data[d3_parser_data.length - 1]['D3'][i]['occdate']
								}

								if (Object.values(d3_parser_data[d3_parser_data.length - 1]['D3'][i])[0] == "kw_im") {
									monthly_data.P83 = d3_parser_data[d3_parser_data.length - 1]['D3'][i]['value']
									monthly_data.P84 = d3_parser_data[d3_parser_data.length - 1]['D3'][i]['occdate']
								}

								if (Object.values(d3_parser_data[d3_parser_data.length - 1]['D3'][i])[0] == "kva_im") {
									monthly_data.P85 = d3_parser_data[d3_parser_data.length - 1]['D3'][i]['value']
									monthly_data.P86 = d3_parser_data[d3_parser_data.length - 1]['D3'][i]['occdate']
								}

								if (Object.values(d3_parser_data[d3_parser_data.length - 1]['D3'][i])[0] == "kwh_abs")
									monthly_data.P95 = d3_parser_data[d3_parser_data.length - 1]['D3'][i]['value']

								if (Object.values(d3_parser_data[d3_parser_data.length - 1]['D3'][i])[0] == "kwh_abs_t")
									monthly_data.P95 = d3_parser_data[d3_parser_data.length - 1]['D3'][i]['value']

								if (Object.values(d3_parser_data[d3_parser_data.length - 1]['D3'][i])[0] == "kwh_im_t")
									monthly_data.P95 = d3_parser_data[d3_parser_data.length - 1]['D3'][i]['value']

								if (Object.values(d3_parser_data[d3_parser_data.length - 1]['D3'][i])[0] == "kwh_im")
									monthly_data.P95 = d3_parser_data[d3_parser_data.length - 1]['D3'][i]['value']
							}
						}
						//P87 logic
						var sum_val = 0
						var cnt = 0

						for (var i = 0; i < d3_parser_data.length; i++) {
							for (var j = 0; j < d3_parser_data[i]['D3'].length; j++) {

								if (Object.values(d3_parser_data[i]['D3'][j])[0] == "kw_im_t") {
									sum_val += d3_parser_data[i]['D3'][j]['value']
									cnt += 1
								}

								if (Object.values(d3_parser_data[i]['D3'][j])[0] == "kw_im") {
									sum_val += d3_parser_data[i]['D3'][j]['value']
									cnt += 1
								}
							}
						}

						if (sum_val != 0 && cnt != 0)
							monthly_data.P87 = sum_val / cnt

						//P88 logic
						if (monthly_data.P83 != null && monthly_data.P14 != null && monthly_data.P83 != 0 && monthly_data.P14 != 0)
							monthly_data.P88 = (monthly_data.P83 / monthly_data.P14) * 100

						//P89 logic
						if (monthly_data.P87 != null && monthly_data.P14 != null && monthly_data.P87 != 0 && monthly_data.P14 != 0)
							monthly_data.P89 = (monthly_data.P87 / monthly_data.P14) * 100

						//P90, P91, P92, P93, P94, P95, P96, P97, P98, P99, P100 logic
						for (var i = 0; i < d3_parser_data.length; i++) {

							if (moment(d3_parser_data[i]['bill_date_time']).format('MM-YYYY') == moment(dataproc_data[0]['meter_rtc'], 'DD-MM-YYYY HH:mm:ss').subtract(1, 'months').format('MM-YYYY')) {

								monthly_data.P90 = moment(d3_parser_data[i]['bill_date_time']).format('DD-MM-YYYY HH:mm')
								var prv_mnth = d3_parser_data[i]

								for (var j = 0; j < d3_parser_data[i]['D3'].length; j++) {

									if (Object.values(d3_parser_data[i]['D3'][j])[0] == "kwh_abs")
										monthly_data.P91 = d3_parser_data[i]['D3'][j]['value']

									if (Object.values(d3_parser_data[i]['D3'][j])[0] == "kwh_abs_t")
										monthly_data.P91 = d3_parser_data[i]['D3'][j]['value']

									if (Object.values(d3_parser_data[i]['D3'][j])[0] == "kwh_im_t")
										monthly_data.P91 = d3_parser_data[i]['D3'][j]['value']

									if (Object.values(d3_parser_data[i]['D3'][j])[0] == "kwh_im")
										monthly_data.P91 = d3_parser_data[i]['D3'][j]['value']
								}
							}

							if (moment(d3_parser_data[i]['bill_date_time']).format('MM-YYYY') == moment(dataproc_data[0]['meter_rtc'], 'DD-MM-YYYY HH:mm:ss').subtract(2, 'months').format('MM-YYYY'))
								var nxt_prv_mnth = d3_parser_data[i]

							if (prv_mnth != undefined && nxt_prv_mnth != undefined) {

								for (var j = 0; j < prv_mnth['D3'].length; j++) {

									if (Object.values(prv_mnth['D3'][j])[0] == "kwh_abs")
										var prv_mnth_val = prv_mnth['D3'][j]['value']

									if (Object.values(prv_mnth['D3'][j])[0] == "kwh_abs_t")
										var prv_mnth_val = prv_mnth['D3'][j]['value']

									if (Object.values(prv_mnth['D3'][j])[0] == "kwh_im_t")
										var prv_mnth_val = prv_mnth['D3'][j]['value']

									if (Object.values(prv_mnth['D3'][j])[0] == "kwh_im")
										var prv_mnth_val = prv_mnth['D3'][j]['value']
								}

								for (var j = 0; j < nxt_prv_mnth['D3'].length; j++) {
									if (Object.values(nxt_prv_mnth['D3'][j])[0] == "kwh_im")
										var nxt_prv_mnth_val = nxt_prv_mnth['D3'][j]['value']
								}

								if (prv_mnth_val != undefined && nxt_prv_mnth_val != undefined)
									monthly_data.P92 = (prv_mnth_val - nxt_prv_mnth_val) * monthly_data.P15

								if (monthly_data.P92 != null && monthly_data.P92 != 0)
									monthly_data.P93 = monthly_data.P92 / (moment(prv_mnth['bill_date_time']).diff(moment(nxt_prv_mnth['bill_date_time']), 'days'))
							}

							if (monthly_data.P95 != null && prv_mnth_val != undefined)
								monthly_data.P96 = (monthly_data.P95 - prv_mnth_val) * monthly_data.P15

							if (monthly_data.P96 != null && monthly_data.P96 != 0 && monthly_data.P94 != null)
								monthly_data.P97 = monthly_data.P96 / (moment(monthly_data.P94, "DD-MM-YYYY HH:mm").diff(moment(prv_mnth['bill_date_time']), 'days'))

							if (monthly_data.P97 != null && monthly_data.P97 != 0 && monthly_data.P93 != null)
								monthly_data.P98 = ((monthly_data.P97 - monthly_data.P93) / monthly_data.P97) * 100

							if (monthly_data.P98 != null) {

								if (monthly_data.P98 <= 50)
									monthly_data.P99 = "Low"

								if (monthly_data.P98 > 50 && monthly_data.P98 <= 100)
									monthly_data.P99 = "Medium"

								if (monthly_data.P98 > 100)
									monthly_data.P99 = "Severe"
							}

							if (monthly_data.P88 != null) {

								if (monthly_data.P88 > 100)
									monthly_data.P100 = "Yes"

								if (monthly_data.P88 < 100)
									monthly_data.P100 = "No"
							}
						}
						errlog.monthly_D3 = "Found"
						resolve([monthly_data, errlog])
					}
					else {
						errlog.monthly_D3 = "Not Found"
						resolve([monthly_data, errlog])
					}
				})
			})
		}
		catch (e) {
			errlog.monthly_D3 = "Error"
			resolve([monthly_data, errlog])
		}
	})
}

module.exports = { callthreeFunction: callthreeFunction };