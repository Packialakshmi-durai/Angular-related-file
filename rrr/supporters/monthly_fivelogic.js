var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');
var groupBy = require('json-groupby')
var sortBy = require('array-sort-by');

function callfiveFunction(AccessToken, i, dataproc_data, ipAddr, monthly_data, errlog) {

	return new Promise(async function (resolve, reject) {

		try {

			var hierarchy_code = dataproc_data[i]['hierarchy_code']
			var meter_id = dataproc_data[i]['meterId']
			rtc_date = (moment(dataproc_data[i]["meter_rtc"], "DD-MM-YYYY HH:mm:SS")).format('YYYY-MM-DD HH:mm:SS')
			split_dt = rtc_date.split(" ")[0] + " " + "00:00:00"
			startMonthDate = new Date(split_dt);
			startMonthDate.setMonth(startMonthDate.getMonth() - 1);

			await callfivepdflogic(hierarchy_code, AccessToken, i, dataproc_data, ipAddr, monthly_data, errlog, rtc_date, startMonthDate, errlog, meter_id).then(async function (result) {
				await updateEvent(AccessToken, i, dataproc_data, ipAddr, result).then(async function (result) {
				})
			})
			resolve([monthly_data, errlog])
		}
		catch (e) {
			errlog.event = "Error"
			errlog.monthly_D5 = "Error"
			resolve([monthly_data, errlog])
		}
	})
}

function callfivepdflogic(hierarchy_code, AccessToken, i, dataproc_data, ipAddr, monthly_data, errlog, rtc_date, startMonthDate, errlog, meter_id) {

	return new Promise(async function (resolve, reject) {

		await client.get(ipAddr + "/api/d5s?filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][event_name][nlike]=Power Failure&filter[where][month_year]=" + dataproc_data[i]['month_year'] + "&access_token=" + AccessToken, async function (d5_data, d5_response, d5_err) {
			console.log("================================")
			console.log(d5_data)
			console.log(d5_data.length)
			var everecord_upto_crt_mnth = []
			var notrestored_data = []
			var notres_date = []
			var duration_sum = [];
			var dur_events_occuredCurrent_Month = []
			var notrestored_name_data = []
			var everecord_crt_mnth = []
			var merge_data = [];
			var MongoFormat = []
			var count = 0
			var args = []
			monthly_data.P67 = "No data"
			monthly_data.P68 = null
			monthly_data.P69 = null
			monthly_data.P70 = null
			monthly_data.P71 = null
			monthly_data.P72 = null

			if (d5_data.length != 0) {

				errlog.event = "Found"
				errlog.monthly_D5 = "Found"

				//full data for particular month - event names
				var event_record_upto_crt_mnth = d5_data.map((value) => value.event_name).filter((value, index, d5_data) => d5_data.indexOf(value) == index);
				everecord_upto_crt_mnth.push({ event_record_upto_crt_mnth })

				//full data for particular month - not res event names - occ date
				for (var a = 0; a < d5_data.length; a++) {
					if (d5_data[a]["restored"] == "-") {
						notrestored_data.push(d5_data[a]["event_name"] + "-" + d5_data[a]["occured"])
						notres_date.push({ "notres_date": d5_data[a]["occured"] })
						count = count + 1
					}
				}
				notrestored_name_data.push({ "notres_name_date": notrestored_data })

				//current month-filtering data
				for (var fltr = 0; fltr < d5_data.length; fltr++) {
					if (((Date.parse(d5_data[fltr]["date"]) > Date.parse(startMonthDate)) || (d5_data[fltr]["restored"] == "-"))) {
						merge_data.push(d5_data[fltr])
					}
				}

				for (var notres_fltr = 0; notres_fltr < d5_data.length; notres_fltr++) {
					if ((d5_data[notres_fltr]["restored"] != "-")) {
						if (Date.parse(moment(d5_data[notres_fltr]["restored"], "DD-MM-YYYY HH:mm:SS").toDate()) > (Date.parse(startMonthDate))) {
							merge_data.push(d5_data[notres_fltr])
						}
					}
				}

				result_table = [...new Set(merge_data.map(obj => JSON.stringify(obj)))].map(str => JSON.parse(str));
				console.log("--------------------Finalized")
				console.log(result_table)
				var event_record_crt_mnth = result_table.map((value) => value.event_name).filter((value, index, result_table) => result_table.indexOf(value) == index);
				everecord_crt_mnth.push({ event_record_crt_mnth })

				for (var ct_pt = 0; ct_pt < event_record_crt_mnth.length; ct_pt++) {

					if ((event_record_crt_mnth[ct_pt]).includes("CT") || ((event_record_crt_mnth[ct_pt]).includes("Current")))
						monthly_data.P71 = 1

					if ((event_record_crt_mnth[ct_pt]).includes("PT") || ((event_record_crt_mnth[ct_pt]).includes("Voltage")))
						monthly_data.P72 = 1
				}

				var summary_duration = []

				//event_name : duration
				for (var dur = 0; dur < everecord_crt_mnth[0]["event_record_crt_mnth"].length; dur++) {
					evname = event_record_crt_mnth[dur]
					json = []

					var ind_event_len = groupBy(result_table, ['event_name'])[evname].length

					for (var ind_json = 0; ind_json < ind_event_len; ind_json++) {
						json.push(groupBy(result_table, ['event_name'])[evname][ind_json]['duration'])
					}
					summary_duration = DurationSum(json, duration_sum, evname)
				}
				dur_events_occuredCurrent_Month.push({ summary_duration })

				//low, severe, medium
				Event = event_fun(summary_duration, count)
				monthly_data.P67 = Event

				//persistant days
				if (notres_date.length != 0) {
					oldnotres_date = sortBy(notres_date, item => new Date(item.notres_date))
					occ_date_moment = (moment(oldnotres_date[0]["notres_date"], "DD-MM-YYYY HH:mm:ss")).format('YYYY-MM-DD HH:mm:ss')
					diffTime_eve_persist = (new Date(rtc_date).getTime() - new Date(occ_date_moment).getTime());
					diffDays_eve_persist = parseFloat(diffTime_eve_persist / (1000 * 60 * 60 * 24)).toFixed(2);
					monthly_data.P68 = diffDays_eve_persist
				}

				//time lapse
				timelapsed_since_lastevent = timelapseFun(d5_data, rtc_date)
				monthly_data.P69 = timelapsed_since_lastevent[0]

				if (timelapsed_since_lastevent[1] != "-")
					monthly_data.P70 = (moment(timelapsed_since_lastevent[1], "YYYY-MM-DD HH:mm:SS")).format('DD-MM-YYYY HH:mm:SS')

				var EventCount_Summary_Array = EventCount_Summary(result_table)

				MongoFormat.push({
					"hierarchy_code": hierarchy_code,
					"meterId": meter_id,
					"month_year": dataproc_data[i]['month_year'],
					"event": [everecord_upto_crt_mnth, notrestored_name_data, everecord_crt_mnth, dur_events_occuredCurrent_Month, EventCount_Summary_Array],
				});

				var args = {
					data: MongoFormat,
					headers: {
						"Content-Type": "application/json"
					}
				};

				resolve(args)
			}

			else {
				await client.get(ipAddr + "/api/d5s?filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][month_year]=" + dataproc_data[i]['month_year'] + "&access_token=" + AccessToken, async function (d5_data, d5_response, d5_err) {

					if (d5_data.length > 0) {
						monthly_data.P67 = "Normal"
						errlog.event = "Not Found"
						errlog.monthly_D5 = "Found"
						resolve(args)
					}
					else {
						errlog.event = "Not Found"
						errlog.monthly_D5 = "Not Found"
						resolve(args)
					}
				})

			}
		})
	})
}

function updateEvent(AccessToken, i, dataproc_data, ipAddr, args) {

	return new Promise(async function (resolve, reject) {

		if (args.length != 0) {
			await client.post(ipAddr + "/api/events?access_token=" + AccessToken, args, function (data, res) {
				resolve()
			});
		}
		resolve()
	})
}

function event_fun(FinalData, notres_count) {

	Event = "Normal";

	for (var a = 0; a < FinalData.length; a++) {

		if ((FinalData[0].split("-")[1].split("")[0] < 5) && (notres_count == 0)) {
			Event = "Low"
		}
		if ((FinalData[0].split("-")[1].split("")[0] >= 5) && (FinalData[0].split("-")[1].split("")[0] < 10) && (notres_count == 0)) {
			Event = "Medium"
		}
		if ((FinalData[0].split("-")[1].split("")[0] >= 10) || (notres_count > 0)) {
			Event = "Severe"
		}
	}
	return Event;
}

function timelapseFun(d5_data, rtc_date) {

	var diffTime = "-"
	var diffDays = "-"
	var timelapse = "-"

	latest_date = sortBy(d5_data, item => new Date(item.date))

	if (latest_date.length > 0)
		timelapse = new Date(latest_date[latest_date.length - 1]['date'])
	diffTime = (new Date(rtc_date).getTime() - timelapse.getTime());
	diffDays = parseInt(diffTime / (1000 * 60 * 60 * 24));

	return [diffDays.toString(), timelapse];
}

function DurationSum(json, duration_sum, evname) {

	var second = 0;
	var days = 0;
	var split = "";
	var split_time = "";

	for (var i = 0; i <= json.length - 1; i++) {
		if (json[i] != "-") {
			split = json[i].split("days")
			split_time = split[1].split(":")
			time = pad(split_time[0].trim()) + ":" + pad(split_time[1].trim()) + ":" + pad(split_time[2].trim())
			second += moment(time, 'hh:mm:ss').diff(moment().startOf('day'), 'seconds')
			days += parseInt(split[0]);
		}
	}
	var a = moment.duration(second, 's');
	var b = moment.duration(days, 'd');
	var c = a.add(b)
	duration_sum.push(evname + "-" + c.asDays().toString().split(".")[0] + " days " + c.hours() + ":" + c.minutes() + ":" + c.seconds())

	return duration_sum
}

function EventCount_Summary(dataD5) {

	console.log(dataD5)

	var result = [];
	var duration_sum = [];
	var set_value = 0;
	var evname = "";
	var summary_duration = "";
	var str_value = "";
	var result = [];
	var Rescount = [];
	var Occrcount = [];
	

	var uniqueEventName = dataD5.map((value) => value.event_name).filter((value, index, dataD5) => dataD5.indexOf(value) == index);

	//duration

	for (var dur = 0; dur < uniqueEventName.length; dur++) {
		evname = uniqueEventName[dur]
		json = []
		var sum = 0;
		for (var ind_json = 0; ind_json < groupBy(dataD5, ['event_name'])[evname].length; ind_json++) {

			json.push(groupBy(dataD5, ['event_name'])[evname][ind_json]['duration'])
			if ((groupBy(dataD5, ['event_name'])[evname][ind_json]['restored']) != "-") {
				sum = sum + 1
			}
		}
		Rescount.push(sum)
		summary_duration = DurationSum(json, duration_sum, evname)
	}

	//occurence/restorance count

	for (var name = 0; name < uniqueEventName.length; name++) {
		var str_value = uniqueEventName[name]
		Occrcount.push(groupBy(dataD5, ['event_name'])[str_value].length)
	}

	dataD5.reduce(function (res, value) {
		if (!res[value.event_name]) {
			res[value.event_name] = {
				event_name: value.event_name,
				P67_4: 0,
				eventcode: value.eventcode
			};
			result.push(res[value.event_name])
		}
		if (value.consumption_value!=null){
			var num = parseFloat(value.consumption_value).toFixed(2)
			res[value.event_name].P67_4 += parseFloat(num);
		}
		return res;
	}, {});

	for (var icount = 0; icount < result.length; icount++) {
		result[icount]["P67_1"] = Occrcount[set_value];
		result[icount]["P67_2"] = Rescount[set_value];
		result[icount]["P67_3"] = duration_sum[set_value].split("-")[1];
		set_value = set_value + 1
	}

	for (var res = 0; res < result.length; res++) {
		if (result[res]["P67_1"] - result[res]["P67_2"] == 1) {
			result[res]["P67_5"] = "Not Restored"
		} else {
			result[res]["P67_5"] = ""
		}
	}
	return result
}


function pad(num) {

	var s = num + "";
	while (s.length < 2) s = "0" + s;
	return s;
}

module.exports = { callfiveFunction: callfiveFunction };