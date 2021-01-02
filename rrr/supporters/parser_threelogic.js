var d3_config = require('./d3_config');
const JsonFind = require('json-find');
var groupBy = require('json-groupby');
var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');

function callthreeFunction(doc, Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year, meter_id) {

	return new Promise(async function (resolve, reject) {

		try {

			if (Node1.D3 != undefined && Node1.D3 != '') {

				var d3Parent = doc.checkKey('D3')

				if (d3Parent) {

					for (var d3i in d3Parent) {

						var BillingArray = []
						var MongoFormat = []
						var bill_dateTime = ""
						var d3status = doc.checkKey(d3i);
						if (d3status != "") {
							var bill_dateTime = JsonFind(d3status).checkKey('_DATETIME')

							if (bill_dateTime) {

								dataproc_det.D3 = "Found"

								var mechanism_find = JsonFind(d3status).checkKey('_MECHANISM')

								if (mechanism_find) {

									if (d3status._MECHANISM != '' && d3status._MECHANISM != '-') {
										var mechanism = ((d3status._MECHANISM).toString()).toLowerCase()
										if (mechanism == 'push button' && mechanism == 'pushbutton') {
											mechanism = 'manual'
										}
									}
									else {
										var mechanism = 'manual'
									}
								}
								else {
									var mechanism = 'manual'
								}

								if (d3status) {

									var D3ZeroAvail = 'Yes'
									var B3zero = JsonFind(d3status).checkKey('B3');
									var B4zero = JsonFind(d3status).checkKey('B4');
									var B5zero = JsonFind(d3status).checkKey('B5');
									var B6zero = JsonFind(d3status).checkKey('B6');
									var B7zero = JsonFind(d3status).checkKey('B7');
									var B9zero = JsonFind(d3status).checkKey('B9');
									var B11zero = JsonFind(d3status).checkKey('B11');
									var B12zero = JsonFind(d3status).checkKey('B12');
									var B13zero = JsonFind(d3status).checkKey('B13');
								}
								if (B3zero) {
									BillingArray = configReturn(d3_config, B3zero, BillingArray, 'd3_b3Config')
								}
								if (B4zero) {
									var todArray = []
									todArray = configReturnWithTod(d3_config, B4zero, todArray, 'd3_b4todConfig')
									BillingArray = mergeTod(todArray, BillingArray)
								}
								if (B5zero) {
									BillingArray = configReturnB5(d3_config, B5zero, BillingArray, 'd3_b5Config')
								}
								if (B6zero) {
									var todArray = []
									todArray = configReturnWithTodB6(d3_config, B6zero, todArray, 'd3_b6todConfig')
									BillingArray = mergeTodB6(todArray, BillingArray)
								}
								if (B7zero) {
									BillingArray = configReturn(d3_config, B7zero, BillingArray, 'd3_b7Config')
								}
								if (B9zero) {
									BillingArray = configReturn(d3_config, B9zero, BillingArray, 'd3_b9Config')
								}
								if (B11zero) {
									BillingArray = configReturncommon(B11zero, BillingArray, "B11")
								}
								if (B12zero) {
									BillingArray = configReturncommon(B12zero, BillingArray, "B12")
								}
								if (B13zero) {
									BillingArray = configReturncommon(B13zero, BillingArray, "B13")
								}

								MongoFormat.push({
									"hierarchy_code": hierarchy_code,
									"meterId": meter_id,
									"month_year": month_year,
									"bill_date_time": moment(bill_dateTime, 'DD-MM-YYYY HH:mm:ss'),
									"Reset_type": mechanism,
									"D3": BillingArray
								});

								var args = {
									data: MongoFormat,
									headers: {
										"Content-Type": "application/json"
									}
								};

								client.post(ipAddr + "/api/d3s?access_token=" + AccessToken, args, function (data, res) {
								});
							}
						}
						else {
							dataproc_det.D3 = "Not Found"
							resolve(dataproc_det)
						}
					}
				}
				resolve(dataproc_det)
			}
			else {
				dataproc_det.D3 = "Not Found"
				resolve(dataproc_det)
			}
		}
		catch (e) {
			dataproc_det.D3 = "Error"
			resolve(dataproc_det)
		}
	})
}

function configReturn(d3_config, B3val, BillingArray, cnfgname) {

	if (B3val.length == undefined) {
		var d3param = B3val._PARAMCODE;
		var d3unit = B3val._UNIT;
		var d3val = B3val._VALUE.replace(",", "");

		if (d3unit != undefined || d3unit != null) {
			if (d3unit == 'M' || d3unit == 'm') {
				d3val = d3val * 1000;
			}
			else {
				d3val = d3val;
			}
		}

		for (var d3icon = 0; d3icon < d3_config[cnfgname].length; d3icon++) {
			for (var d3jcon = 0; d3jcon < d3_config[cnfgname][d3icon].mios_code.length; d3jcon++) {
				if (d3param.includes(d3_config[cnfgname][d3icon].mios_code[d3jcon].code)) {
					if (d3val != '') {
						BillingArray.push({
							"param": d3_config[cnfgname][d3icon].name,
							"value": parseFloat(d3val)
						});
					}
				}

			}
		}
	}
	else {
		var count = 0
		var index = 0
		for (var d3icon = 0; d3icon < d3_config[cnfgname].length; d3icon++) {
			for (var d3jcon = 0; d3jcon < d3_config[cnfgname][d3icon].mios_code.length; d3jcon++) {
				for (var bi in B3val) {

					if (B3val[bi]._PARAMCODE != undefined && B3val[bi]._VALUE != undefined) {
						var d3param = B3val[bi]._PARAMCODE;
						var d3val = B3val[bi]._VALUE.replace(",", "");
						var d3unit = B3val[bi]._UNIT;

						if (d3unit != undefined || d3unit != null) {
							if (d3unit == 'M' || d3unit == 'm') {
								d3val = d3val * 1000;
							}
							else {
								d3val = d3val;
							}
						}
						if (d3param.includes(d3_config[cnfgname][d3icon].mios_code[d3jcon].code)) {
							if (d3param.includes('P7-1-5-1-0')) {
								if (bi != 0) {
									if (d3val == "" || d3val == 0) {
										BillingArray.push({
											"param": d3_config[cnfgname][d3icon].name,
											"value": parseFloat(B3val[0]._VALUE.replace(",", ""))
										});
									}
									else {
										BillingArray.push({
											"param": d3_config[cnfgname][d3icon].name,
											"value": parseFloat(d3val)
										});
									}
								}
								else {

									if (d3val != 0 || d3val != '') {
										if (BillingArray)
											BillingArray.push({
												"param": d3_config[cnfgname][d3icon].name,
												"value": parseFloat(d3val)
											});
									}
								}
							}
							else {
								if (d3val != '') {
									BillingArray.push({
										"param": d3_config[cnfgname][d3icon].name,
										"value": parseFloat(d3val)
									});
								}
							}
						}
					}
				}

			}
		}
	}

	for (var bill = 0; bill < BillingArray.length; bill++) {
		if (Object.values(BillingArray[bill]).includes('kwh_im')) {
			update_val = Object.values(BillingArray[bill])[1]
			count = count + 1
			if (count == 1) {
				index = bill
			}
		}
	}
	if (count == 2) {
		BillingArray.splice(index, 1)
	}
	return BillingArray;
}

function configReturnB5(d3_config, B3val, BillingArray, cnfgname) {

	if (B3val.length == undefined) {
		var d3param = B3val._PARAMCODE;
		var d3unit = B3val._UNIT;
		var d3val = B3val._VALUE.replace(",", "");
		var occ_time = B3val._OCCDATE

		if (d3unit != undefined || d3unit != null) {
			if (d3unit == 'M' || d3unit == 'm') {
				d3val = d3val * 1000;
			}
			else {
				d3val = d3val;
			}
		}

		for (var d3icon = 0; d3icon < d3_config[cnfgname].length; d3icon++) {
			for (var d3jcon = 0; d3jcon < d3_config[cnfgname][d3icon].mios_code.length; d3jcon++) {
				if (d3param.includes(d3_config[cnfgname][d3icon].mios_code[d3jcon].code)) {
					if (d3val != '') {
						BillingArray.push({
							"param": d3_config[cnfgname][d3icon].name,
							"value": parseFloat(d3val),
							"occdate": occ_time
						});
					}
				}
			}
		}
	}
	else {
		var b5count = 0
		for (var d3icon = 0; d3icon < d3_config[cnfgname].length; d3icon++) {
			for (var d3jcon = 0; d3jcon < d3_config[cnfgname][d3icon].mios_code.length; d3jcon++) {
				for (var bi in B3val) {
					if (B3val[bi]._PARAMCODE != undefined && B3val[bi]._VALUE != undefined) {
						var d3param = B3val[bi]._PARAMCODE;
						var d3val = B3val[bi]._VALUE.replace(",", "");
						var d3unit = B3val[bi]._UNIT;
						var occ_time = B3val[bi]._OCCDATE

						if (d3unit != undefined || d3unit != null) {
							if (d3unit == 'M' || d3unit == 'm') {
								d3val = d3val * 1000;
							}
							else {
								d3val = d3val;
							}
						}

						if (d3param.includes(d3_config[cnfgname][d3icon].mios_code[d3jcon].code)) {
							if (d3param.includes('P7-1-5-1-0')) {
								if (bi != 0) {
									if (d3val == "" || d3val == 0) {
										BillingArray.push({
											"param": d3_config[cnfgname][d3icon].name,
											"value": parseFloat(B3val[0]._VALUE.replace(",", "")),
											"occdate": occ_time
										});
									}
									else {
										BillingArray.push({
											"param": d3_config[cnfgname][d3icon].name,
											"value": parseFloat(d3val),
											"occdate": occ_time
										});
									}
								}
								else {
									if (d3val != 0 || d3val != '') {
										BillingArray.push({
											"param": d3_config[cnfgname][d3icon].name,
											"value": parseFloat(d3val),
											"occdate": occ_time
										});
									}
								}
							}
							else {
								if (d3val != '') {
									BillingArray.push({
										"param": d3_config[cnfgname][d3icon].name,
										"value": parseFloat(d3val),
										"occdate": occ_time
									});
								}
							}
						}
					}
				}
			}
		}
	}

	for (var bill = 0; bill < BillingArray.length; bill++) {
		if (Object.values(BillingArray[bill]).includes('kva_im')) {
			update_val = Object.values(BillingArray[bill])[1]
			b5count = b5count + 1
			if (b5count == 1) {
				index = bill
			}
		}
	}
	if (b5count == 2) {
		BillingArray.splice(index, 1)
	}
	return BillingArray;
}

function configReturnWithTod(d3_config, B3val, todArray, cnfgname) {

	if (B3val.length == undefined) {
		var d3param = B3val._PARAMCODE;
		var d3val = B3val._VALUE.replace(",", "");
		var d3unit = B3val._UNIT;
		var d3tod = B3val._TOD;
		var tod = d3param + "_" + d3tod

		if (d3unit == 'M' || d3unit == 'm') {
			d3val = d3val * 1000;
		}
		else {
			d3val = d3val;
		}

		for (var d3icon = 0; d3icon < d3_config[cnfgname].length; d3icon++) {
			for (var d3jcon = 0; d3jcon < d3_config[cnfgname][d3icon].mios_code.length; d3jcon++) {
				if (tod.includes(d3_config[cnfgname][d3icon].mios_code[d3jcon].code)) {
					if (d3val != '') {
						todArray.push({
							"param": d3_config[cnfgname][d3icon].name,
							"value": d3val
						});
					}
				}
			}
		}
	}
	else {
		for (var d3icon = 0; d3icon < d3_config[cnfgname].length; d3icon++) {
			for (var d3jcon = 0; d3jcon < d3_config[cnfgname][d3icon].mios_code.length; d3jcon++) {
				for (var bi in B3val) {
					if (B3val[bi]._PARAMCODE != undefined && B3val[bi]._VALUE != undefined) {
						var d3param = B3val[bi]._PARAMCODE;
						var d3val = B3val[bi]._VALUE.replace(",", "");
						var d3unit = B3val[bi]._UNIT;

						if (d3unit == 'M' || d3unit == 'm') {
							d3val = d3val * 1000;
						}
						else {
							d3val = d3val;
						}
						if (B3val[0]._TOD == '0') {
							var d3todd = +B3val[bi]._TOD + +'1';
							var d3tod = d3todd.toString()
						}
						else {
							var d3tod = B3val[bi]._TOD
						}

						var tod = d3param + "_" + d3tod
						if (tod.includes(d3_config[cnfgname][d3icon].mios_code[d3jcon].code)) {
							if (d3val != '') {
								todArray.push({
									"param": d3_config[cnfgname][d3icon].name,
									"value": d3val
								});
							}
						}
					}
				}
			}
		}
	}
	return todArray;
}

function configReturnWithTodB6(d3_config, B3val, todArray, cnfgname) {

	if (B3val.length == undefined) {

		var d3param = B3val._PARAMCODE;
		var d3val = B3val._VALUE.replace(",", "");
		var d3unit = B3val._UNIT;
		var d3tod = B3val._TOD;
		var tod = d3param + "_" + d3tod
		var occ_time = B3val._OCCDATE

		if (d3unit == 'M' || d3unit == 'm') {
			d3val = d3val * 1000;
		}
		else {
			d3val = d3val;
		}

		for (var d3icon = 0; d3icon < d3_config[cnfgname].length; d3icon++) {
			for (var d3jcon = 0; d3jcon < d3_config[cnfgname][d3icon].mios_code.length; d3jcon++) {
				if (tod.includes(d3_config[cnfgname][d3icon].mios_code[d3jcon].code)) {
					if (d3val != '') {
						todArray.push({
							"param": d3_config[cnfgname][d3icon].name,
							"value": d3val,
							"date_time": occ_time
						});
					}
				}
			}
		}
	}
	else {
		for (var d3icon = 0; d3icon < d3_config[cnfgname].length; d3icon++) {
			for (var d3jcon = 0; d3jcon < d3_config[cnfgname][d3icon].mios_code.length; d3jcon++) {
				for (var bi in B3val) {
					if (B3val[bi]._PARAMCODE != undefined && B3val[bi]._VALUE != undefined) {
						var d3param = B3val[bi]._PARAMCODE;
						var d3val = B3val[bi]._VALUE.replace(",", "");
						var d3unit = B3val[bi]._UNIT;
						var occ_time = B3val[bi]._OCCDATE

						if (d3unit == 'M' || d3unit == 'm') {
							d3val = d3val * 1000;
						}
						else {
							d3val = d3val;
						}
						if (B3val[0]._TOD == '0') {
							var d3todd = +B3val[bi]._TOD + +'1';
							var d3tod = d3todd.toString()
						}
						else {
							var d3tod = B3val[bi]._TOD
						}
						var tod = d3param + "_" + d3tod

						if (tod.includes(d3_config[cnfgname][d3icon].mios_code[d3jcon].code)) {
							if (d3val != '') {
								todArray.push({
									"param": d3_config[cnfgname][d3icon].name,
									"value": d3val,
									"date_time": occ_time,
									"tod": B3val[bi]._TOD
								});
							}
						}
					}
				}
			}
		}
	}

	var todArray = todArray.reduce((unique, o) => {
		if (!unique.some(obj => obj.param == o.param && obj.value === o.value && obj.tod === o.tod)) {
			unique.push(o);
		}
		return unique;
	}, []);

	return todArray;
}

function mergeTod(todArray, BillingArray) {

	var uniquename = todArray.map((value) => value.param).filter((value, index, todArray) => todArray.indexOf(value) == index);

	for (var uniq = 0; uniq < uniquename.length; uniq++) {
		grpArray = groupBy(todArray, ['param'])[uniquename[uniq]]
		var todvalues = []

		for (var a = 0; a < grpArray.length; a++) {
			todvalues.push(parseFloat(grpArray[a].value))
		}
		BillingArray.push({ "param": uniquename[uniq], "value": todvalues })
	}
	return BillingArray
}

function mergeTodB6(todArray, BillingArray) {

	var uniquename = todArray.map((value) => value.param).filter((value, index, todArray) => todArray.indexOf(value) == index);

	for (var uniq = 0; uniq < uniquename.length; uniq++) {
		grpArray = groupBy(todArray, ['param'])[uniquename[uniq]]
		var todvalues = []
		var toddate = []

		for (var a = 0; a < grpArray.length; a++) {
			todvalues.push(parseFloat(grpArray[a].value))
			toddate.push(grpArray[a].date_time)
		}
		BillingArray.push({ "param": uniquename[uniq], "value": todvalues, "occdate": toddate })
	}
	return BillingArray
}

function configReturncommon(BArray, BillingArray, paramStatus) {

	BillingArray.push({ "param": paramStatus, "value": parseFloat(BArray._VALUE) })
	return BillingArray
}

module.exports = { callthreeFunction: callthreeFunction };