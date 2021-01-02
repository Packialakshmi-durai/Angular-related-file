var onelogic = require('./parser_onelogic');
var twologic = require('./parser_twologic');
var threelogic = require('./parser_threelogic');
var fourlogic = require('./parser_fourlogic');
var fivelogic = require('./parser_fivelogic');
var ninelogic = require('./parser_ninelogic');
var billing_report_jdvvnl = require('./billing_report_jdvvnl');
var billing_report_mr9 = require('./billing_report_mr9');
var billing_pdf = require('./billing_pdf');
var billing_pdf_ht = require('./billing_pdf_ht');
var subtable_main = require('./subtable_main');
var Client = require('node-rest-client').Client;
var client = new Client();
var fs = require('fs');
var he = require('he');
var mv = require('mv');
var ls = require('list-directory-contents');
var JsonFind = require('json-find');
var xmlReader = require('read-xml');
var fastXmlParser = require('fast-xml-parser');
var moment = require('moment');
var parseString = require('xml2js').parseString;
var numeral = require('numeral');

var ip = process.argv.slice(2)[0];
var port = process.argv.slice(2)[1];

var ipAddr = "http://" + ip + ":" + port

var util_read = function (AccessToken) {

	client.get(ipAddr + "/api/utils?access_token=" + AccessToken, async function (util_data, util_response, util_err) {

		var location_path = util_data[0]['home_path']
		var application_path = util_data[0]['application_path']

		var fonts = {
			Roboto: {
				normal: application_path + '/server/supporters/fonts/Roboto-Regular.ttf',
				bold: application_path + '/server/supporters/fonts/Roboto-Medium.ttf',
				italics: application_path + '/server/supporters/fonts/Roboto-Italic.ttf',
				bolditalics: application_path + '/server/supporters/fonts/Roboto-MediumItalic.ttf'
			}
		};
		file_read(AccessToken, util_data, location_path, fonts)
	})
}

var file_read = function (AccessToken, util_data, location_path, fonts) {

	client.get(ipAddr + "/api/fileprocesses?filter[where][status]=new&access_token=" + AccessToken, async function (file_data, file_response, file_err) {

		if (file_data.length != 0) {

			var month_year = file_data[0]['month_year']
			var launchedAt = file_data[0]['launchedAt']
			var fileproc_id = file_data[0]['id']
			var fileproc_from = file_data[0]['from']

			var args_fileproc = {
				data: {
					status: "process"
				},
				headers: {
					"Content-Type": "application/json"
				}
			}

			client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, async function (data_update, resp) {

				try {

					var location = location_path + '/XMLFiles/' + moment(launchedAt).format().replace(/:/g, "_") + "_" + fileproc_from + "/"
					var suc_files = location_path + '/Processed_Meters/' + month_year + '/Success_Meters/'
					var dup_files = location_path + '/Processed_Meters/' + month_year + '/Duplicate_Meters/'
					var exp_files = location_path + '/Processed_Meters/' + month_year + '/Exception_Meters/'
					var err_files = location_path + '/Processed_Meters/' + month_year + '/Error_Meters/'

					ls(location, function (err, tree) {

						if (tree != undefined) {
							var cnt = tree.length
							var tot_cnt = tree.length
							var xml_files = [];

							for (var i = 0; i < tree.length; i++) {
								if ((tree[i].includes('.xml') || tree[i].includes('.XML') || tree[i].includes('.Xml'))) {
									xml_files.push(tree[i])
								}
							}
							if (xml_files.length != 0) {
								filegeneration(xml_files, AccessToken, tot_cnt, month_year, suc_files, exp_files, err_files, fileproc_id, cnt, launchedAt, util_data, location_path, fonts, dup_files)
							}
						}
						else {
							var errorlog_format = []

							errorlog_format.push({
								"file_path": location,
								"error_occured_date": new Date(),
								"launchedAt": launchedAt,
								"error_code": "Error102A",
								"error_type": "Parser_Error",
								"error_desc": "Inappropriate File Location/File Not Found",
								"error_remark": "Check the File Location"
							})
							errorlog(errorlog_format, AccessToken)

							error_status(fileproc_id, AccessToken)
						}
					});
				}
				catch (e) {

					var errorlog_format = []

					errorlog_format.push({
						"file_path": location,
						"error_occured_date": new Date(),
						"launchedAt": launchedAt,
						"error_code": "Error102A",
						"error_type": "Parser_Error",
						"error_desc": "Inappropriate File Location/File Not Found",
						"error_remark": "Check the File Location"
					})
					errorlog(errorlog_format, AccessToken)

					error_status(fileproc_id, AccessToken)
				}
			});
		}
		else {
			error_status(fileproc_id, AccessToken)
		}
	});
}

var filegeneration = function (xml_files, AccessToken, tot_cnt, month_year, suc_files, exp_files, err_files, fileproc_id, cnt, launchedAt, util_data, location_path, fonts, dup_files) {

	for (var j = 0; j < xml_files.length; j++) {

		setTimeout(async function (j) {
			console.log(j)

			cnt = cnt - 1

			_tagChecking(xml_files[j], AccessToken, tot_cnt, month_year, suc_files, exp_files, err_files, fileproc_id, cnt, launchedAt, util_data, location_path, fonts, dup_files);
		}, 2000 * j, j)
	}
}

var _tagChecking = function (files, AccessToken, tot_cnt, month_year, suc_files, exp_files, err_files, fileproc_id, cnt, launchedAt, util_data, location_path, fonts, dup_files) {

	fs.readFile(files, 'utf-8', function (err, data) {

		parseString(data, function (err, result) { // checking file valid or not

			console.log(files)

			var dataproc_det = []

			if (!err) {

				xmlReader.readXML(fs.readFileSync(files), function (err, data) {

					var strings = data.content;
					var jsonObj = fastXmlParser.parse(strings);
					var options = {
						attributeNamePrefix: "_",
						attrNodeName: false,
						textNodeName: "#text",
						ignoreAttributes: false,
						ignoreNameSpace: false,
						allowBooleanAttributes: false,
						parseNodeValue: true,
						parseAttributeValue: false,
						trimValues: true,
						cdataTagName: "__cdata",
						cdataPositionChar: "\\c",
						localeRange: "",
						attrValueProcessor: a => he.decode(a, {
							isAttributeValue: true
						}),
						tagValueProcessor: a => he.decode(a)
					};
					if (fastXmlParser.validate(strings) === true) {
						var jsonObj = fastXmlParser.parse(strings, options);
					}
					var tObj = fastXmlParser.getTraversalObj(strings, options);
					var jsonObj = fastXmlParser.convertToJson(tObj, options);
					var FinalJSon = JSON.stringify(jsonObj);
					var json = JSON.parse(FinalJSon);

					if (json != undefined && json != "") {
						var Node1 = json.UTILITYTYPE;

						if (Node1 == undefined) {
							var Node1 = (json.CDF.UTILITYTYPE)
						}

						const doc = JsonFind(Node1);

						if (moment(Node1.D1.G2, "DD-MM-YYYY HH:mm").isValid() && Node1.D1.G1 != undefined && Node1.D1.G2 != undefined && Node1.D1.G22 != undefined && Node1.D1.G1 != '' && Node1.D1.G2 != '' && Node1.D1.G22 != '' && Node1.D1.G22._CODE != undefined) {

							var start_of_month = moment(month_year, "MM-YYYY").startOf('month').format('DD-MM-YYYY HH:mm');
							var end_of_month = moment(month_year, "MM-YYYY").endOf('month').format('DD-MM-YYYY HH:mm');

							start_of_month = moment(start_of_month, "DD-MM-YYYY HH:mm").valueOf()
							end_of_month = moment(end_of_month, "DD-MM-YYYY HH:mm").valueOf()

							if (start_of_month >= moment(Node1.D1.G2, "DD-MM-YYYY HH:mm").valueOf() || end_of_month <= moment(Node1.D1.G2, "DD-MM-YYYY HH:mm").valueOf()) {

								if (((Node1.D1.G1).toString()).length < 8) {
									var hierarchy_code = String(Node1.D1.G1).padStart(8, 0)
								}
								else {
									var hierarchy_code = Node1.D1.G1
								}
								if (((Node1.D1.G22._CODE).toString()).length < 3) {
									var make_code = numeral(Node1.D1.G22._CODE).format('000')
								}
								else {
									var make_code = Node1.D1.G22._CODE
								}

								var meter_id = "NA"
								console.log("RTC Problem : " + hierarchy_code)

							 client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][meter_rtc]=" + Node1.D1.G2, async function (dataproc_data, dataproc_data_response, dataproc_data_err) {

									if (dataproc_data.length == 0) {

										threelogic.callthreeFunction(doc, Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year, meter_id).then(function (d3_res) {

											mv(files, exp_files + files.split('/')[files.split('/').length - 1], { mkdirp: true }, function (err) {
												if (!err) {

													var dataproc_format = []

													dataproc_format.push({
														"file_dest_path": (exp_files + files.split('/')[files.split('/').length - 1]).toString(),
														"process_date": moment().format('DD-MM-YYYY'),
														"launchedAt": launchedAt,
														"xml_status": "RTC Problem",
														"billing_report": "new",
														"make_code": make_code,
														"D3": dataproc_det.D3,
														"meter_rtc": Node1.D1.G2,
														"month_year": month_year,
														"hierarchy_code": hierarchy_code
													})

													var errorlog_format = []

													errorlog_format.push({
														"file_path": (exp_files + files.split('/')[files.split('/').length - 1]).toString(),
														"error_occured_date": new Date(),
														"launchedAt": launchedAt,
														"error_code": "Error102C",
														"error_type": "Parser_Error",
														"error_desc": "RTC Problem",
														"error_remark": "Meter RTC should range between 30 days from system date"
													})
													errorlog(errorlog_format, AccessToken)

													updateApi(dataproc_format, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts)
												}
											});
										});
									}
									else {
										mv(files, dup_files + files.split('/')[files.split('/').length - 1], { mkdirp: true }, function (err) {

											if (!err) {

												var dataproc_format = []

												dataproc_format.push({
													"file_dest_path": (dup_files + files.split('/')[files.split('/').length - 1]).toString(),
													"process_date": moment().format('DD-MM-YYYY'),
													"launchedAt": launchedAt,
													"xml_status": "Duplicate Meter",
													"meter_rtc": Node1.D1.G2,
													"month_year": month_year,
													"hierarchy_code": hierarchy_code
												})

												var errorlog_format = []

												errorlog_format.push({
													"file_path": (dup_files + files.split('/')[files.split('/').length - 1]).toString(),
													"error_occured_date": new Date(),
													"launchedAt": launchedAt,
													"error_code": "Error102F",
													"error_type": "Parser_Error",
													"error_desc": "Duplicate Meter",
													"error_remark": "Meter Already Exist"
												})
												errorlog(errorlog_format, AccessToken)

												updateApi(dataproc_format, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts)
											}
										});
									}
								})
							}
							else {
								check_key(doc, Node1, files, AccessToken, dataproc_det, tot_cnt, month_year, suc_files, exp_files, fileproc_id, cnt, launchedAt, util_data, location_path, fonts, dup_files)
							}
						}
						else {
							mv(files, err_files + files.split('/')[files.split('/').length - 1], { mkdirp: true }, function (err) {
								if (!err) {

									var dataproc_format = []

									dataproc_format.push({
										"file_dest_path": (err_files + files.split('/')[files.split('/').length - 1]).toString(),
										"process_date": moment().format('DD-MM-YYYY'),
										"launchedAt": launchedAt,
										"xml_status": "General Information Not Available"
									})

									var errorlog_format = []

									errorlog_format.push({
										"file_path": (err_files + files.split('/')[files.split('/').length - 1]).toString(),
										"error_occured_date": new Date(),
										"launchedAt": launchedAt,
										"error_code": "Error102D",
										"error_type": "Parser_Error",
										"error_desc": "General Information Not Available",
										"error_remark": "Meter Number (or) Meter RTC (or) Make Code is not available"
									})
									errorlog(errorlog_format, AccessToken)

									updateApi(dataproc_format, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts)
								}
							});
						}
					}
					else {
						mv(files, err_files + files.split('/')[files.split('/').length - 1], { mkdirp: true }, function (err) {
							if (!err) {

								var dataproc_format = []

								dataproc_format.push({
									"file_dest_path": (err_files + files.split('/')[files.split('/').length - 1]).toString(),
									"process_date": moment().format('DD-MM-YYYY'),
									"launchedAt": launchedAt,
									"xml_status": "Invalid XML"
								})

								var errorlog_format = []

								errorlog_format.push({
									"file_path": (err_files + files.split('/')[files.split('/').length - 1]).toString(),
									"error_occured_date": new Date(),
									"launchedAt": launchedAt,
									"error_code": "Error102B",
									"error_type": "Parser_Error",
									"error_desc": "Invalid XML",
									"error_remark": "XML is invalid for Parsing"
								})
								errorlog(errorlog_format, AccessToken)

								updateApi(dataproc_format, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts)
							}
						});
					}
				});
			}
			else {
				mv(files, err_files + files.split('/')[files.split('/').length - 1], { mkdirp: true }, function (err) {
					if (!err) {

						var dataproc_format = []

						dataproc_format.push({
							"file_dest_path": (err_files + files.split('/')[files.split('/').length - 1]).toString(),
							"process_date": moment().format('DD-MM-YYYY'),
							"launchedAt": launchedAt,
							"xml_status": "Invalid XML"
						})

						var errorlog_format = []

						errorlog_format.push({
							"file_path": (err_files + files.split('/')[files.split('/').length - 1]).toString(),
							"error_occured_date": new Date(),
							"launchedAt": launchedAt,
							"error_code": "Error102B",
							"error_type": "Parser_Error",
							"error_desc": "Invalid XML",
							"error_remark": "XML is invalid for Parsing"
						})
						errorlog(errorlog_format, AccessToken)

						updateApi(dataproc_format, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts)
					}
				});
			}
		});
	});
}

var check_key = async function (doc, Node1, files, AccessToken, dataproc_det, tot_cnt, month_year, suc_files, exp_files, fileproc_id, cnt, launchedAt, util_data, location_path, fonts, dup_files) {

	if (((Node1.D1.G1).toString()).length < 8) {
		var meter_no = String(Node1.D1.G1).padStart(8, 0)
	}
	else {
		var meter_no = Node1.D1.G1
	}

	if (((Node1.D1.G22._CODE).toString()).length < 3) {
		var make_code = numeral(Node1.D1.G22._CODE).format('000')
	}
	else {
		var make_code = Node1.D1.G22._CODE
	}

	await client.get(ipAddr + "/api/meters?access_token=" + AccessToken + "&filter[where][meter_no]=" + meter_no + "&filter[where][make_code]=" + make_code + "&filter[where][meter_status]=1", async function (meter_data, meter_response, meter_err) {

		if (meter_data[0] != undefined) {

			var hierarchy_code = meter_data[0]['hierarchy_code']
			var div_name = meter_data[0]['divname']
			var subdiv_name = meter_data[0]['subname']
			var meter_id = meter_data[0]['id']
			var supply_cat = meter_data[0]['supply_cat']

			await logic_call(doc, Node1, files, AccessToken, dataproc_det, hierarchy_code, div_name, subdiv_name, tot_cnt, month_year, suc_files, fileproc_id, cnt, launchedAt, meter_id, util_data, location_path, fonts, dup_files, supply_cat)
		}
		else {

			if (((Node1.D1.G1).toString()).length < 8) {
				var hierarchy_code = String(Node1.D1.G1).padStart(8, 0)
			}
			else {
				var hierarchy_code = Node1.D1.G1
			}
			if (((Node1.D1.G22._CODE).toString()).length < 3) {
				var make_code = numeral(Node1.D1.G22._CODE).format('000')
			}
			else {
				var make_code = Node1.D1.G22._CODE
			}

			var meter_id = "NA"
			console.log("Meter Not in Master : " + hierarchy_code)

			await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][meter_rtc]=" + Node1.D1.G2, async function (dataproc_data, dataproc_data_response, dataproc_data_err) {

				if (dataproc_data.length == 0) {

					await threelogic.callthreeFunction(doc, Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year, meter_id).then(async function (d3_res) {

						mv(files, exp_files + files.split('/')[files.split('/').length - 1], { mkdirp: true }, function (err) {

							if (!err) {

								var dataproc_format = []

								dataproc_format.push({
									"file_dest_path": (exp_files + files.split('/')[files.split('/').length - 1]).toString(),
									"process_date": moment().format('DD-MM-YYYY'),
									"launchedAt": launchedAt,
									"xml_status": "Meter Not in Master",
									"billing_report": "new",
									"D3": dataproc_det.D3,
									"make_code": make_code,
									"meter_rtc": Node1.D1.G2,
									"month_year": month_year,
									"hierarchy_code": hierarchy_code
								})

								var errorlog_format = []

								errorlog_format.push({
									"file_path": (exp_files + files.split('/')[files.split('/').length - 1]).toString(),
									"error_occured_date": new Date(),
									"launchedAt": launchedAt,
									"error_code": "Error102E",
									"error_type": "Parser_Error",
									"error_desc": "Meter Not in Master",
									"error_remark": "Master is not available for this Meter"
								})
								errorlog(errorlog_format, AccessToken)

								updateApi(dataproc_format, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts)
							}
						});
					});
				}
				else {
					mv(files, dup_files + files.split('/')[files.split('/').length - 1], { mkdirp: true }, function (err) {

						if (!err) {

							var dataproc_format = []

							dataproc_format.push({
								"file_dest_path": (dup_files + files.split('/')[files.split('/').length - 1]).toString(),
								"process_date": moment().format('DD-MM-YYYY'),
								"launchedAt": launchedAt,
								"xml_status": "Duplicate Meter",
								"meter_rtc": Node1.D1.G2,
								"month_year": month_year,
								"hierarchy_code": hierarchy_code
							})

							var errorlog_format = []

							errorlog_format.push({
								"file_path": (dup_files + files.split('/')[files.split('/').length - 1]).toString(),
								"error_occured_date": new Date(),
								"launchedAt": launchedAt,
								"error_code": "Error102F",
								"error_type": "Parser_Error",
								"error_desc": "Duplicate Meter",
								"error_remark": "Meter Already Exist"
							})
							errorlog(errorlog_format, AccessToken)

							updateApi(dataproc_format, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts)
						}
					});
				}
			})
		}
	})
}

var logic_call = async function (doc, Node1, files, AccessToken, dataproc_det, hierarchy_code, div_name, subdiv_name, tot_cnt, month_year, suc_files, fileproc_id, cnt, launchedAt, meter_id, util_data, location_path, fonts, dup_files, supply_cat) {

	await onelogic.calloneFunction(Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year).then(async function (d1_res) {
		await twologic.calltwoFunction(Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year).then(async function (d2_res) {
			await threelogic.callthreeFunction(doc, Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year, meter_id).then(async function (d3_res) {
				await fourlogic.callfourFunction(doc, Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year, meter_id).then(async function (d4_res) {
					await fivelogic.callfiveFunction(doc, Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year, meter_id).then(async function (d5_res) {
						await ninelogic.callnineFunction(Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year, meter_id).then(async function (d9_res) {

							await client.get(ipAddr + "/api/dataprocesses?access_token=" + AccessToken + "&filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][meter_rtc]=" + Node1.D1.G2, async function (dataproc_data, dataproc_data_response, dataproc_data_err) {

								if (dataproc_data.length == 0) {

									mv(files, suc_files + files.split('/')[files.split('/').length - 1], { mkdirp: true }, function (err) {

										if (!err) {

											fs.renameSync(suc_files + files.split('/')[files.split('/').length - 1], suc_files + Node1.D1.G1 + "_" + (Node1.D1.G2).replace(/[-:' ']/g, '') + ".XML")

											var dataproc_format = []

											if (supply_cat == "HT") {

												dataproc_format.push({
													"D2": dataproc_det.D2,
													"D3": dataproc_det.D3,
													"D4": dataproc_det.D4,
													"D5": dataproc_det.D5,
													"D9": dataproc_det.D9,
													"div_name": div_name,
													"subdiv_name": subdiv_name,
													"meterId": meter_id,
													"file_dest_path": (suc_files + Node1.D1.G1 + "_" + (Node1.D1.G2).replace(/[-:' ']/g, '') + ".XML").toString(),
													"process_date": moment().format('DD-MM-YYYY'),
													"meter_ip": dataproc_det.meter_ip,
													"meter_rtc": Node1.D1.G2,
													"month_year": month_year,
													"hierarchy_code": hierarchy_code,
													"billing_report": "new",
													"report_status": "new",
													"billing_pdf": "new",
													"billing_pdf_ht": "new",
													"launchedAt": launchedAt,
													"xml_status": "success"
												})
											}
											else {

												dataproc_format.push({
													"D2": dataproc_det.D2,
													"D3": dataproc_det.D3,
													"D4": dataproc_det.D4,
													"D5": dataproc_det.D5,
													"D9": dataproc_det.D9,
													"div_name": div_name,
													"subdiv_name": subdiv_name,
													"meterId": meter_id,
													"file_dest_path": (suc_files + Node1.D1.G1 + "_" + (Node1.D1.G2).replace(/[-:' ']/g, '') + ".XML").toString(),
													"process_date": moment().format('DD-MM-YYYY'),
													"meter_ip": dataproc_det.meter_ip,
													"meter_rtc": Node1.D1.G2,
													"month_year": month_year,
													"hierarchy_code": hierarchy_code,
													"billing_report": "new",
													"report_status": "new",
													"billing_pdf": "new",
													"launchedAt": launchedAt,
													"xml_status": "success"
												})
											}
											updateApi(dataproc_format, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts)
										}
									});
								}
								else {
									mv(files, dup_files + files.split('/')[files.split('/').length - 1], { mkdirp: true }, function (err) {

										if (!err) {

											var dataproc_format = []

											dataproc_format.push({
												"file_dest_path": (dup_files + files.split('/')[files.split('/').length - 1]).toString(),
												"process_date": moment().format('DD-MM-YYYY'),
												"launchedAt": launchedAt,
												"xml_status": "Duplicate Meter",
												"meter_rtc": Node1.D1.G2,
												"month_year": month_year,
												"hierarchy_code": hierarchy_code
											})

											var errorlog_format = []

											errorlog_format.push({
												"file_path": (dup_files + files.split('/')[files.split('/').length - 1]).toString(),
												"error_occured_date": new Date(),
												"launchedAt": launchedAt,
												"error_code": "Error102F",
												"error_type": "Parser_Error",
												"error_desc": "Duplicate Meter",
												"error_remark": "Meter Already Exist"
											})
											errorlog(errorlog_format, AccessToken)

											updateApi(dataproc_format, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts)
										}
									});
								}
							})
						})
					})
				})
			})
		})
	})
}

var updateApi = async function (dataproc_format, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts) {

	var args = {
		data: dataproc_format,
		headers: {
			"Content-Type": "application/json"
		}
	};

	client.post(ipAddr + "/api/dataprocesses?access_token=" + AccessToken, args, function (data, res) {

		console.log("Dataprocess Update : " + res.statusCode)

		setTimeout(function () {
			cnt_update(ipAddr, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts)
		}, 2500)
	});
}

var cnt_update = function (ipAddr, AccessToken, tot_cnt, fileproc_id, cnt, launchedAt, util_data, location_path, fonts) {

	if (cnt == 0) {

		client.get(ipAddr + "/api/dataprocesses?filter[where][report_status]=new&filter[where][launchedAt]=" + launchedAt + "&access_token=" + AccessToken, async function (suc_data, suc_response, suc_err) {
			var rep_cnt = suc_data.length

			client.get(ipAddr + "/api/dataprocesses?filter[where][xml_status]=Duplicate Meter&filter[where][launchedAt]=" + launchedAt + "&access_token=" + AccessToken, async function (dup_data, dup_response, dup_err) {
				var dup_cnt = dup_data.length

				client.get(ipAddr + "/api/dataprocesses?filter[where][or][0][xml_status]=RTC Problem&filter[where][or][1][xml_status]=Meter Not in Master&filter[where][launchedAt]=" + launchedAt + "&access_token=" + AccessToken, async function (exp_data, exp_response, exp_err) {
					var exp_cnt = exp_data.length

					client.get(ipAddr + "/api/dataprocesses?filter[where][or][0][xml_status]=General Information Not Available&filter[where][or][1][xml_status]=Invalid XML&filter[where][launchedAt]=" + launchedAt + "&access_token=" + AccessToken, async function (err_data, err_response, err) {
						var err_cnt = err_data.length

						fileproc_update(ipAddr, AccessToken, tot_cnt, exp_cnt, err_cnt, dup_cnt, rep_cnt, fileproc_id, launchedAt, util_data, location_path, fonts)
					})
				})
			})
		})
	}
}

var fileproc_update = function (ipAddr, AccessToken, tot_cnt, exp_cnt, err_cnt, dup_cnt, rep_cnt, fileproc_id, launchedAt, util_data, location_path, fonts) {

	var args_fileproc = {
		data: {
			"parser": "complete",
			"total_count": tot_cnt,
			"success_count": rep_cnt,
			"exception_count": exp_cnt,
			"error_count": err_cnt,
			"duplicate_count": dup_cnt
		},
		headers: {
			"Content-Type": "application/json"
		}
	}

	client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, async function (data_update, resp) {
		console.log("Fileprocess Update : " + resp.statusCode)
		console.log("----------------------------- Parser Completed -----------------------------")

		if (resp.statusCode == 200) {

			if (rep_cnt != 0) {
				subtable_main.func_call(AccessToken, ipAddr, launchedAt, util_data[0]['meter_make'])

				if (util_data[0]['billing_pdf'] == true)
					billing_pdf.billing_pdf_func_call(AccessToken, location_path, fonts, launchedAt, ipAddr, util_data[0]['meter_make'])

				if (util_data[0]['billing_pdf_ht'] == true)
					billing_pdf_ht.billing_pdf_func_call(AccessToken, location_path, fonts, launchedAt, ipAddr, util_data[0]['meter_make'])

				if (util_data[0]['flat_file'] == "jdvvnl")
					billing_report_jdvvnl.billing_report_func_call(AccessToken, location_path, ipAddr, launchedAt)

				if (util_data[0]['flat_file'] == "mr9")
					billing_report_mr9.billing_report_func_call(AccessToken, location_path, ipAddr, launchedAt)
			}
			else {
				if (util_data[0]['flat_file'] == "jdvvnl")
					billing_report_jdvvnl.billing_report_func_call(AccessToken, location_path, ipAddr, launchedAt)

				if (util_data[0]['flat_file'] == "mr9")
					billing_report_mr9.billing_report_func_call(AccessToken, location_path, ipAddr, launchedAt)

				var args_fileproc = {
					data: {
						status: "complete"
					},
					headers: {
						"Content-Type": "application/json"
					}
				}

				await client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, async function (data_update, resp) {
					console.log("----------------------------- Overall Process Completed -----------------------------")
				})
			}
		}
	});
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

var error_status = function (fileproc_id, AccessToken) {

	var args_fileproc = {
		data: {
			status: "error"
		},
		headers: {
			"Content-Type": "application/json"
		}
	}

	client.post(ipAddr + "/api/fileprocesses/update?where[id]=" + fileproc_id + "&access_token=" + AccessToken, args_fileproc, async function (data_update, resp) {
		console.log("Error Update : " + resp.statusCode)
	})
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
});