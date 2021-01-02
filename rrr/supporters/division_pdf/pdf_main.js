const global = require('./global.js')
const report_instantaneous = require('./report_instantaneous');
const report_energy_comparison = require('./report_energy_comparison');
const report_md_exceeded = require('./report_md_exceeded');
const report_low_power_factor = require('./report_low_power_factor');
const report_low_load_utilization = require('./report_low_load_utilization');
const report_high_noload_blackout = require('./report_high_noload_blackout');
const report_consumer_list = require('./report_consumer_list');
const report_consumption_based_analysis = require('./report_consumption_based_analysis');
const report_detective_mechanical = require('./report_detective_mechanical');
const report_pt_severe = require('./report_pt_severe');
const report_seal = require('./report_seal');
const report_load_survey_not_found = require('./report_load_survey_not_found');
const report_tamper_not_found = require('./report_tamper_not_found');
const report_power_factor = require('./report_power_factor');
const report_load_utilization = require('./report_load_utilization');
const report_power_off_duration = require('./report_power_off_duration');
const report_tamper_full_case = require('./report_tamper_full_case');
const report_tamper = require('./report_tamper');
const report_event_exception = require('./report_event_exception');
const report_summary = require('./report_summary');
const report_consumption_comparison = require('./report_consumption_comparison');
const report_daily = require('./report_daily');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');
var moment = require("moment");

var invoked_date = process.argv.slice(2)[0];
var ip = process.argv.slice(2)[1];
var port = process.argv.slice(2)[2];

var ipAddr = "http://" + ip + ":" + port

var util_read = function (AccessToken) {

	client.get(ipAddr + "/api/utils?access_token=" + AccessToken, async function (util_data, util_response, util_err) {

		var location = util_data[0]['home_path']
		var application_path = util_data[0]['application_path']

		var fonts = {
			Roboto: {
				normal: application_path + '/server/supporters/fonts/Roboto-Regular.ttf',
				bold: application_path + '/server/supporters/fonts/Roboto-Medium.ttf',
				italics: application_path + '/server/supporters/fonts/Roboto-Italic.ttf',
				bolditalics: application_path + '/server/supporters/fonts/Roboto-MediumItalic.ttf'
			}
		};
		month_fetch(AccessToken, location, fonts)
	})
}

var month_fetch = function (AccessToken, location, fonts) {

	return new Promise(function (resolve, reject) {

		client.get(ipAddr + "/api/pdfprocesses?access_token=" + AccessToken + "&filter[where][invoked_date]=" + invoked_date + "&filter[where][status]=new", function (pdf_data, pdf_response, pdf_err) {

			if (pdf_data.length == 1) {

				try {

					location = location
					fonts = fonts
				}
				catch (e) {

					var errorlog_format = []

					errorlog_format.push({
						"error_occured_date": new Date(),
						"launchedAt": invoked_date,
						"error_code": "Error103A",
						"error_type": "PDF_Error",
						"error_desc": "Location Error",
						"error_remark": "Check the Location"
					})
					errorlog(errorlog_format, AccessToken)

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
				}

				var supply_cat = pdf_data[0]['supply_cat']
				var hierarchy_code = pdf_data[0]['hierarchy_code']
				var report_type = pdf_data[0]['report_type']
				var pdf_name = pdf_data[0]['report_name']
				var report_count = pdf_data[0]['report_count']
				global.status.cnt = report_count

				var from = ""
				var to = ""
				var month_year = ""

				if (report_type == "monthly") {
					month_year = pdf_data[0]['month_year']
				}
				else if (report_type == "daily") {
					from = pdf_data[0]['from']
					to = pdf_data[0]['to']
					month_year = moment(to, "DD-MM-YYYY").format("MM-YYYY")
				}

				var args_pdfproc = {
					data: {
						status: "process",
					},
					headers: {
						"Content-Type": "application/json"
					}
				}

				client.post(ipAddr + "/api/pdfprocesses/update?where[id]=" + pdf_data[0].id + "&access_token=" + AccessToken, args_pdfproc, function (pdfproc_update, resp) {

					client.get(ipAddr + "/api/monthlies?access_token=" + AccessToken + "&filter[where][month_year]=" + month_year + "&filter[where][hierarchy_code][like]=" + hierarchy_code + "&filter[where][P12]=" + supply_cat, function (month_data, month_response, month_err) {

						try {

							if (month_data.length != 0) {

								if (report_type == "monthly") {

									var crnt_dir = location
									process.chdir(crnt_dir)

									if (!fs.existsSync("PDF")) {
										fs.mkdirSync("PDF");
										process.chdir(crnt_dir + "/PDF/")
									}
									else {
										process.chdir(crnt_dir + "/PDF/")
									}

									if (!fs.existsSync(month_year)) {
										fs.mkdirSync(month_year);
										var filepath = crnt_dir + "/PDF/" + month_year + "/"
										process.chdir(filepath)
									}
									else {
										var filepath = crnt_dir + "/PDF/" + month_year + "/"
										process.chdir(filepath)
									}

									hierarchy_filter(month_data, month_year, AccessToken, supply_cat, hierarchy_code, fonts, filepath, from, to, invoked_date, report_type, pdf_name, report_count)
								}

								else if (report_type == "daily") {

									var crnt_dir = location
									process.chdir(crnt_dir)

									if (!fs.existsSync("Daily")) {
										fs.mkdirSync("Daily");
										process.chdir(crnt_dir + "/Daily/")
									}
									else {
										process.chdir(crnt_dir + "/Daily/")
									}

									if (!fs.existsSync(month_year)) {
										fs.mkdirSync(month_year);
										var filepath = crnt_dir + "/Daily/" + month_year + "/"
										process.chdir(filepath)
									}
									else {
										var filepath = crnt_dir + "/Daily/" + month_year + "/"
										process.chdir(filepath)
									}

									hierarchy_filter(month_data, month_year, AccessToken, supply_cat, hierarchy_code, fonts, filepath, from, to, invoked_date, report_type, pdf_name, report_count)
								}
							}
							else {
								var errorlog_format = []

								errorlog_format.push({
									"error_occured_date": new Date(),
									"launchedAt": invoked_date,
									"error_code": "Error103B",
									"error_type": "PDF_Error",
									"error_desc": "PDF Not Generated",
									"error_remark": "Data Not Available"
								})
								errorlog(errorlog_format, AccessToken)

								updateApi(AccessToken)
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
				});
			}
		});
	});
}

var hierarchy_filter = function (month_data, month_year, AccessToken, supply_cat, hierarchy_code, fonts, filepath, from, to, invoked_date, report_type, pdf_name, report_count) {

	var div_all = []

	for (var i = 0; i < month_data.length; i++) {
		div_all.push(month_data[i]['P2'])
	}
	var div_uniq = unique(div_all)
	global.status.cnt = div_uniq.length * report_count

	for (var d = 0; d < div_uniq.length; d++) {
		setTimeout(async function (d) {

			var div_name = div_uniq[d]
			console.log(div_name)

			var filterBy = { P2: [div_name] },
				div_result = month_data.filter(function (o) {
					return Object.keys(filterBy).every(function (k) {
						return filterBy[k].some(function (f) {
							return o[k] === f;
						});
					});
				});

			if (div_result.length != 0) {
				if (report_type == "monthly")
					logic_call(div_result, month_year, AccessToken, supply_cat, hierarchy_code, fonts, filepath, pdf_name, div_name, invoked_date)
				if (report_type == "daily")
					report_daily.callreport_daily(div_result, fonts, AccessToken, ipAddr, hierarchy_code, from, to, invoked_date, supply_cat, filepath, div_name)
			}
		}, 1000 * d, d)
	}
}

var logic_call = function (month_data, month_year, AccessToken, supply_cat, hierarchy_code, fonts, filepath, pdf_name, div_name, invoked_date) {

	try {

		if (pdf_name == "All") {

			report_instantaneous.callreport_instantaneous(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_energy_comparison.callreport_energy_comparison(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_md_exceeded.callreport_md_exceeded(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_low_power_factor.callreport_low_power_factor(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_low_load_utilization.callreport_low_load_utilization(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_high_noload_blackout.callreport_high_noload_blackout(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_tamper_full_case.callreport_tamper_full_case(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_consumer_list.callreport_consumer_list(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_consumption_based_analysis.callreport_consumption_based_analysis(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_pt_severe.callreport_pt_severe(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_load_survey_not_found.callreport_load_survey_not_found(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_tamper_not_found.callreport_tamper_not_found(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_power_factor.callreport_power_factor(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_load_utilization.callreport_load_utilization(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_seal.callreport_seal(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_detective_mechanical.callreport_detective_mechanical(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)
			report_power_off_duration.callreport_power_off_duration(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, filepath, div_name)
			report_summary.callreport_summary(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, filepath, div_name)
			report_consumption_comparison.callreport_consumption_comparison(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, hierarchy_code, filepath, div_name)
			report_tamper.callreport_tamper(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, filepath, div_name)
			report_event_exception.callreport_event_exception(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, filepath, div_name)
		}
		else {
			if (pdf_name == "Instantaneous")
				report_instantaneous.callreport_instantaneous(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Energy_Comparison")
				report_energy_comparison.callreport_energy_comparison(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "MD_Exceeded")
				report_md_exceeded.callreport_md_exceeded(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Low_Power_Factor_Status")
				report_low_power_factor.callreport_low_power_factor(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Low_Load_Utilization")
				report_low_load_utilization.callreport_low_load_utilization(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "High_Noload_Blackout")
				report_high_noload_blackout.callreport_high_noload_blackout(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Tamper_Full_Cases")
				report_tamper_full_case.callreport_tamper_full_case(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Tamper")
				report_tamper.callreport_tamper(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, filepath, div_name)

			else if (pdf_name == "Event_Exception")
				report_event_exception.callreport_event_exception(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, filepath, div_name)

			else if (pdf_name == "Summary")
				report_summary.callreport_summary(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, filepath, div_name)

			else if (pdf_name == "Consumers_List")
				report_consumer_list.callreport_consumer_list(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Consumption_Comparison")
				report_consumption_comparison.callreport_consumption_comparison(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, hierarchy_code, filepath, div_name)

			else if (pdf_name == "List_of_Defective_Mechanical_Meters")
				report_detective_mechanical.callreport_detective_mechanical(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Seal")
				report_seal.callreport_seal(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Consumption_Based_Analysis")
				report_consumption_based_analysis.callreport_consumption_based_analysis(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "PT_Unbalance_Severe")
				report_pt_severe.callreport_pt_severe(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Load_Survey_Not_Found")
				report_load_survey_not_found.callreport_load_survey_not_found(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Tamper_Not_Found")
				report_tamper_not_found.callreport_tamper_not_found(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Power_Factor_Status")
				report_power_factor.callreport_power_factor(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Load_Utilization")
				report_load_utilization.callreport_load_utilization(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, invoked_date, filepath, div_name)

			else if (pdf_name == "Power_off_Duration")
				report_power_off_duration.callreport_power_off_duration(month_data, month_year, supply_cat, fonts, AccessToken, ipAddr, hierarchy_code, invoked_date, filepath, div_name)
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
}

var updateApi = function (AccessToken) {

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

var errorlog = function (errorlog_format, AccessToken) {

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

var loginargs = {

	data: {
		email: "admin@sands.in",
		password: "admin"
	},
	headers: {
		"Content-Type": "application/json"
	}
}

client.post(ipAddr + "/api/Reviewers/login", loginargs, function (logindata, loginresponse, loginerr) {

	if (!loginerr) {
		util_read(logindata.id);
	}
	else {
		console.log(loginerr);
	}
});