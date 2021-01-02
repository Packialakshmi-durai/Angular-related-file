var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');
var numeral = require('numeral');

function calltwoFunction(AccessToken, i, dataproc_data, ipAddr, monthly_data, errlog) {

	return new Promise(async function (resolve, reject) {

		try {
			monthly_data.P1 = null
			monthly_data.P2 = null
			monthly_data.P3 = null
			monthly_data.P4 = null
			monthly_data.P5 = null
			monthly_data.P6 = null
			monthly_data.P7 = null
			monthly_data.P8 = null
			monthly_data.P9 = null
			monthly_data.P10 = null
			monthly_data.P11 = dataproc_data[i].meter_ip
			monthly_data.P12 = null
			monthly_data.P13 = null
			monthly_data.P14 = null
			monthly_data.P15 = null
			monthly_data.P16 = null
			monthly_data.P17 = null
			monthly_data.P18 = dataproc_data[i].meter_rtc

			monthly_data.P19 = null
			monthly_data.P20 = null
			monthly_data.P21 = null
			monthly_data.P22 = null
			monthly_data.P23 = null
			monthly_data.P24 = null
			monthly_data.P25 = null
			monthly_data.P26 = null
			monthly_data.P27 = null
			monthly_data.P28 = null
			monthly_data.P29 = null
			monthly_data.P30 = null
			monthly_data.P31 = null
			monthly_data.P32 = null
			monthly_data.P33 = null
			monthly_data.P34 = null
			monthly_data.P35 = null
			monthly_data.P36 = null
			monthly_data.P37 = null
			monthly_data.P38 = null
			monthly_data.P39 = null
			monthly_data.P40 = null
			monthly_data.P41 = null
			monthly_data.P74 = null
			monthly_data.P75 = null
			monthly_data.P76 = null
			monthly_data.P77 = null
			monthly_data.P78 = null
			monthly_data.P79 = null
			monthly_data.P80 = null
			monthly_data.P81 = null
			monthly_data.P82 = null

			var make_code_name = { "001": "SECURE", "002": "ELSTER", "003": "L&T", "004": "GENUS", "005": "DUKE", "006": "HPL", "007": "Data Pro", "008": "Omni Agte", "009": "Easun Reyrolle", "010": "Capital Power", "011": "Bentec Electrical", "012": "Delhi Control Device", "013": "ICSA Pvt", "014": "Holley Meters", "015": "Indo Asian", "078": "KAIFA", "101": "L&G", "102": "Avon", "103": "Linkwell" }

			var meter_rtc = moment(dataproc_data[i]['meter_rtc'], "DD-MM-YYYY HH:mm:ss").toISOString()
			var d3_rtc = moment(dataproc_data[i]['meter_rtc'], "DD-MM-YYYY HH:mm").toISOString()

			await client.get(ipAddr + "/api/wirings?filter[where][hierarchy_code]=" + monthly_data.hierarchy_code + "&filter[where][date_obj]=" + meter_rtc + "&access_token=" + AccessToken, async function (d2_data, d2_response, d2_err) {

				await client.get(ipAddr + "/api/d2s?filter[where][hierarchy_code]=" + monthly_data.hierarchy_code + "&filter[where][date_obj]=" + meter_rtc + "&access_token=" + AccessToken, async function (d2master_data, d2master_response, d2master_err) {

					await client.get(ipAddr + "/api/meters?access_token=" + AccessToken + "&filter[where][hierarchy_code]=" + monthly_data.hierarchy_code + "&filter[where][meter_status]=1", async function (meter_data, meter_response, meter_err) {

						var prv_month = moment(dataproc_data[i]['month_year'], 'MM-YYYY').subtract(1, 'months').format('MM-YYYY');

						if (meter_data.length != 0) {

							monthly_data.P4 = meter_data[0].consumer_no
							monthly_data.P5 = meter_data[0].consumer_name
							monthly_data.P6 = meter_data[0].meter_no
							monthly_data.P8 = meter_data[0].make_code
							monthly_data.P7 = make_code_name[monthly_data.P8]
							monthly_data.P9 = meter_data[0].mtr_type
							monthly_data.P14 = meter_data[0].contract_demand
							monthly_data.P15 = meter_data[0].bill_mf
							monthly_data.P13 = meter_data[0].industry_type
							monthly_data.P16 = meter_data[0].v_rated
							monthly_data.P17 = meter_data[0].c_rated
							monthly_data.P3 = meter_data[0].subname
							monthly_data.P2 = meter_data[0].divname
							monthly_data.P1 = meter_data[0].circlename
							monthly_data.P12 = meter_data[0].supply_cat
							monthly_data.subdivisionId = meter_data[0].subdivisionId
							monthly_data.meterId = meter_data[0].id
							monthly_data.P77 = meter_data[0].tariff_cat
							monthly_data.P81 = meter_data[0].meter_con_sts
						}
						await client.get(ipAddr + "/api/consumers?access_token=" + AccessToken + "&filter[where][meter_no]=" + meter_data[0].meter_no, async function (consumer_data, consumer_response, consumer_err) {

							if (consumer_data.length != 0) {
								monthly_data.P74 = consumer_data[0].ss_code
								monthly_data.P75 = consumer_data[0].feeder_code
								monthly_data.P76 = consumer_data[0].dt_code
								monthly_data.P78 = consumer_data[0].acc_no
								monthly_data.P79 = consumer_data[0].consumer_add1
								monthly_data.P80 = consumer_data[0].consumer_con_sts
							}
							await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][hierarchy_code]=" + monthly_data.hierarchy_code + "&filter[where][month_year]=" + prv_month + "&filter[limit]=1", async function (prv_dataproc, prv_dataproc_resp, prv_dataproc_err) {

								await client.get(ipAddr + "/api/d3s?filter[where][hierarchy_code]=" + monthly_data.hierarchy_code + "&filter[where][bill_date_time]=" + d3_rtc + "&access_token=" + AccessToken, async function (d3_data, d3_response, d3_err) {

									if (prv_dataproc.length != 0) {
										var prv_rtc = moment(prv_dataproc[0].meter_rtc, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')
									}

									await client.get(ipAddr + "/api/d1s?filter[where][hierarchy_code]=" + monthly_data.hierarchy_code + "&filter[where][date_obj]=" + meter_rtc + "&access_token=" + AccessToken, async function (d1_data, d1_response, d1_err) {

										if (d1_data.length != 0 && d1_data[0]['D1'][0]['G13'] != null) {
											monthly_data.P10 = ((d1_data[0]['D1'][0]['G13']).toString()).toLowerCase()
										}

										if (d2_data.length != 0) {

											monthly_data.P19 = d2_data[0]['status'][1][0]['v_r_ip']
											monthly_data.P20 = d2_data[0]['status'][1][0]['vr_ratedvolt']
											monthly_data.P21 = d2_data[0]['status'][1][0]['v_y_ip']
											monthly_data.P22 = d2_data[0]['status'][1][0]['vy_ratedvolt']
											monthly_data.P23 = d2_data[0]['status'][1][0]['v_b_ip']
											monthly_data.P24 = d2_data[0]['status'][1][0]['vb_ratedvolt']
											monthly_data.P25 = d2_data[0]['status'][1][0]['c_r_ip']
											monthly_data.P26 = d2_data[0]['status'][1][0]['ir_ratedcur']
											monthly_data.P27 = d2_data[0]['status'][1][0]['c_y_ip']
											monthly_data.P28 = d2_data[0]['status'][1][0]['iy_ratedcur']
											monthly_data.P29 = d2_data[0]['status'][1][0]['c_b_ip']
											monthly_data.P30 = d2_data[0]['status'][1][0]['ib_ratedcur']
											monthly_data.P31 = d2_data[0]['status'][1][0]['c_ra_ip']
											monthly_data.P32 = d2_data[0]['status'][1][0]['c_ya_ip']
											monthly_data.P33 = d2_data[0]['status'][1][0]['c_ba_ip']
											monthly_data.P34 = d2_data[0]['status'][1][0]['pf_r_ip']
											monthly_data.P35 = d2_data[0]['status'][1][0]['pf_y_ip']
											monthly_data.P36 = d2_data[0]['status'][1][0]['pf_b_ip']
											monthly_data.P37 = d2master_data[0]['D2'][0]['pf']
											if (d2_data[0]['status'][0][0]['phase_seq'] != null)
												monthly_data.P38 = (d2_data[0]['status'][0][0]['phase_seq']).substring(0, 3)
											monthly_data.P39 = d2master_data[0]['D2'][0]['p_kw']
											monthly_data.P40 = d2_data[0]['status'][0][0]['wiring_status']
											monthly_data.P82 = d2master_data[0]['D2'][0]['i_n']

											var crnt_pwr_failure = "-"
											var prv_pwr_failure = "-"

											if (meter_data[0]['meter_com_type'] != "-") {

												if (meter_data[0]['meter_com_type'] == "DLMS") {
													crnt_pwr_failure = d2master_data[0]['D2'][0]['p_fail_dur']

													if (prv_rtc != undefined) {
														prv_pwr_failure = d2master_data[0]['D2'][0]['p_fail_dur']
													}
												}

												if (meter_data[0]['meter_com_type'] == "NON DLMS") {
													if (d3_data.length != 0) {
														if (d3_data[0]['D3'][d3_data[0]['D3'].length - 1]['param'] == "B12") {
															crnt_pwr_failure = d3_data[0]['D3'][d3_data[0]['D3'].length - 1]['value']
														}

														if (prv_rtc != undefined) {
															if (d3_data[0]['D3'][d3_data[0]['D3'].length - 1]['param'] == "B12") {
																prv_pwr_failure = d3_data[0]['D3'][d3_data[0]['D3'].length - 1]['value']
															}
														}
													}
												}

												if (crnt_pwr_failure != "-" && prv_pwr_failure != "-") {
													var pwr_off_dur = crnt_pwr_failure - prv_pwr_failure
													monthly_data.P41 = (parseInt(pwr_off_dur / 24 / 60) + " days " + numeral(parseInt(pwr_off_dur / 60 % 24)).format('00') + ':' + numeral(parseInt(pwr_off_dur % 60)).format('00'))
												}
											}
											errlog.monthly_D2 = "Found"
											resolve([monthly_data, errlog])
										}
										else {
											errlog.monthly_D2 = "Not Found"
											resolve([monthly_data, errlog])
										}
									})
								})
							})
						})
					})
				})
			})
		}
		catch (e) {
			errlog.monthly_D2 = "Error"
			resolve([monthly_data, errlog])
		}
	})
}

module.exports = { calltwoFunction: calltwoFunction };