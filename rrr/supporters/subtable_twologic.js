var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');

function calltwoFunction(AccessToken, i, dataproc_data, ipAddr, dataproc_det, meter_id) {

	return new Promise(async function (resolve, reject) {

		try {

			var hierarchy_code = dataproc_data[i]['hierarchy_code']
			var month_year = dataproc_data[i]['month_year']
			var meter_rtc = moment(dataproc_data[i]['meter_rtc'], "DD-MM-YYYY HH:mm:ss").toISOString()

			await client.get(ipAddr + "/api/d2s?filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][date_obj]=" + meter_rtc + "&access_token=" + AccessToken, async function (d2_data, d2_response, d2_err) {

				await client.get(ipAddr + "/api/meters?access_token=" + AccessToken + "&filter[where][hierarchy_code]=" + hierarchy_code + "&filter[where][meter_status]=1", async function (meter_data, meter_response, meter_err) {

					if (d2_data.length != 0) {

						var v_r_ip = null
						var v_y_ip = null
						var v_b_ip = null
						var c_r_ip = null
						var c_y_ip = null
						var c_b_ip = null
						var c_ra_ip = null
						var c_ya_ip = null
						var c_ba_ip = null
						var pf_r_ip = null
						var pf_y_ip = null
						var pf_b_ip = null
						var pf_ip = null
						var v_ps_ip = null
						var rated_current = null
						var c_rated_mf = null
						var V_All_Missing = "No"
						var V_R_Low = "No"
						var V_Y_Low = "No"
						var V_B_Low = "No"
						var V_One_Low = "No"
						var V_ALL_Low = "No"
						var V_Unbalance = "No"
						var C_Unbalance = "No"
						var C_R_Missing = "No"
						var C_Y_Missing = "No"
						var C_B_Missing = "No"
						var C_One_Missing = "No"
						var C_All_Missing = "No"
						var CT_R_Reverse = "No"
						var CT_Y_Reverse = "No"
						var CT_B_Reverse = "No"
						var CT_One_Reverse = "No"
						var C_One_High = "No"
						var V_One_High = "No"
						var PF_Low = "No"
						var Power_Fail = "No"
						var V_R_Missing = "No"
						var V_Y_Missing = "No"
						var V_B_Missing = "No"
						var V_One_Missing = "No"
						var c_rated = null
						var v_rated = null
						var mtr_type = null
						var meter_ct_ratio = null
						var meter_pt_ratio = null
						var mtr_pri_cur = null
						var mtr_sec_cur = null
						var vr_ratedvolt = null
						var vy_ratedvolt = null
						var vb_ratedvolt = null
						var ir_ratedcur = null
						var iy_ratedcur = null
						var ib_ratedcur = null
						var wiring_status = null
						var make_code = null
						var MongoFormat = []

						v_r_ip = d2_data[i]["D2"][0]["vr"]
						v_y_ip = d2_data[i]["D2"][0]["vy"]
						v_b_ip = d2_data[i]["D2"][0]["vb"]
						c_r_ip = d2_data[i]["D2"][0]["ir"]
						c_y_ip = d2_data[i]["D2"][0]["iy"]
						c_b_ip = d2_data[i]["D2"][0]["ib"]
						c_ra_ip = d2_data[i]["D2"][0]["i_ra"]
						c_ya_ip = d2_data[i]["D2"][0]["i_ya"]
						c_ba_ip = d2_data[i]["D2"][0]["i_ba"]
						pf_r_ip = d2_data[i]["D2"][0]["pf_r"]
						pf_y_ip = d2_data[i]["D2"][0]["pf_y"]
						pf_b_ip = d2_data[i]["D2"][0]["pf_b"]
						pf_ip = d2_data[i]["D2"][0]["pf"]
						v_ps_ip = d2_data[i]["D2"][0]["v_ps"]
						kw_ip = d2_data[i]["D2"][0]["pf_b"]

						if (meter_data.length != 0) {
							meter_ct_ratio = meter_data[0]["meter_ct_ratio"]
							meter_pt_ratio = meter_data[0]["meter_pt_ratio"]
							mtr_pri_cur = meter_data[0]["mtr_pri_cur"]
							mtr_sec_cur = meter_data[0]["mtr_sec_cur"]
							c_rated = meter_data[0]["c_rated"]
							v_rated = meter_data[0]["v_rated"]
							mtr_type = meter_data[0]["mtr_type"]
							make_code = meter_data[0]["make_code"]
						}

						if (c_rated != null && meter_ct_ratio != null) {
							rated_current = parseInt(parseFloat(c_rated) * parseFloat(meter_ct_ratio))
						}

						if (mtr_pri_cur != null && parseFloat(mtr_pri_cur) != 0 && mtr_sec_cur != null && parseFloat(mtr_sec_cur) != 0) {
							c_rated_mf = ((parseFloat(mtr_pri_cur) / parseFloat(mtr_sec_cur)) * parseFloat(c_rated))
						}
						else {
							if (c_rated != null && meter_ct_ratio != null)
								c_rated_mf = parseFloat(c_rated) * parseFloat(meter_ct_ratio)
						}

						if (v_r_ip != null && v_rated != null)
							vr_ratedvolt = ((parseFloat(v_r_ip) / parseFloat(v_rated)) * 100)
						if (v_y_ip != null && v_rated != null)
							vy_ratedvolt = ((parseFloat(v_y_ip) / parseFloat(v_rated)) * 100)
						if (v_b_ip != null && v_rated != null)
							vb_ratedvolt = ((parseFloat(v_b_ip) / parseFloat(v_rated)) * 100)
						if (c_r_ip != null && c_rated_mf != null)
							ir_ratedcur = ((parseFloat(Math.abs(c_r_ip)) / parseFloat(c_rated_mf)) * 100)
						if (c_y_ip != null && c_rated_mf != null)
							iy_ratedcur = ((parseFloat(Math.abs(c_y_ip)) / parseFloat(c_rated_mf)) * 100)
						if (c_b_ip != null && c_rated_mf != null)
							ib_ratedcur = ((parseFloat(Math.abs(c_b_ip)) / parseFloat(c_rated_mf)) * 100)

						if (vr_ratedvolt == 0 && vy_ratedvolt == 0 && vb_ratedvolt == 0) {
							V_All_Missing = "Yes"
						}
						else {
							if (vr_ratedvolt != null && vr_ratedvolt < 70 && ir_ratedcur > 1) {
								V_R_Low = "Yes"
							}
							if (vy_ratedvolt != null && vy_ratedvolt < 70 && iy_ratedcur > 1) {
								V_Y_Low = "Yes"
							}
							if (vb_ratedvolt != null && vb_ratedvolt < 70 && ib_ratedcur > 1) {
								V_B_Low = "Yes"
							}
						}
						// status1 calculation
						if (V_R_Low == "Yes" || V_Y_Low == "Yes" || V_B_Low == "Yes") {
							V_One_Low = "Yes"
						}

						// status2 calculation
						if (V_R_Low == "No" && V_Y_Low == "No" && V_B_Low == "No") {
							V_ALL_Low = "Yes"
						}

						if (V_ALL_Low == "Yes") {
							var V_Max = Math.max(parseFloat(v_r_ip), parseFloat(v_y_ip), parseFloat(v_b_ip));
							var V_Min = Math.min(parseFloat(v_r_ip), parseFloat(v_y_ip), parseFloat(v_b_ip));

							if (V_Max != 0) {
								var V_Var = (((V_Max - V_Min) / V_Max) * 100)
							}
						}
						// status3 calculation
						if (V_Var > 30) {
							V_Unbalance = "Yes"
						}

						if (parseFloat(c_r_ip) >= 1 && parseFloat(c_y_ip) >= 1 && parseFloat(c_b_ip) >= 1) {
							var C_Max = Math.max(parseFloat(c_r_ip), parseFloat(c_y_ip), parseFloat(c_b_ip));
							var C_Min = Math.min(parseFloat(c_r_ip), parseFloat(c_y_ip), parseFloat(c_b_ip));

							if (C_Max != 0) {
								var C_Var = (((C_Max - C_Min) / C_Max) * 100)

								// status4 calculation
								if (C_Var > 25) {
									C_Unbalance = "Yes"
								}
							}
						}

						if (V_All_Missing == "No") {
							if (ir_ratedcur != null && ir_ratedcur < 1) {
								C_R_Missing = "Yes"
							}
							if (iy_ratedcur != null && iy_ratedcur < 1 && mtr_type.includes("3P-4W") == true) {
								C_Y_Missing = "Yes"
							}
							if (ib_ratedcur != null && ib_ratedcur < 1) {
								C_B_Missing = "Yes"
							}
						}
						// status5 calculation
						if (C_R_Missing == "Yes" || C_Y_Missing == "Yes" || C_B_Missing == "Yes") {
							C_One_Missing = "Yes"
						}

						// status6 calculation
						if (ir_ratedcur == 0 && iy_ratedcur == 0 && ib_ratedcur == 0) {
							C_All_Missing = "Yes"
						}

						if ((Math.abs(parseFloat(pf_r_ip)) > 0.8 && parseFloat(c_r_ip) < 0) || (parseFloat(c_ra_ip) < 0 && ir_ratedcur > 10)) {
							CT_R_Reverse = "Yes"
						}
						if ((Math.abs(parseFloat(pf_y_ip)) > 0.8 && parseFloat(c_y_ip) < 0) || (parseFloat(c_ya_ip) < 0 && iy_ratedcur > 10)) {
							CT_Y_Reverse = "Yes"
						}
						if ((Math.abs(parseFloat(pf_b_ip)) > 0.8 && parseFloat(c_b_ip) < 0) || (parseFloat(c_ba_ip) < 0 && ib_ratedcur > 10)) {
							CT_B_Reverse = "Yes"
						}

						// status7 calculation
						if (CT_R_Reverse == "Yes" || CT_Y_Reverse == "Yes" || CT_B_Reverse == "Yes") {
							CT_One_Reverse = "Yes"
						}

						// status8 calculation
						if (ir_ratedcur > 100 || iy_ratedcur > 100 || ib_ratedcur > 100) {
							C_One_High = "Yes"
						}

						// status9 calculation
						if (vr_ratedvolt > 125 || vy_ratedvolt > 125 || vb_ratedvolt > 125) {
							V_One_High = "Yes"
						}

						// status10 calculation
						if ((0 < Math.abs(parseFloat(pf_r_ip)) && Math.abs(parseFloat(pf_r_ip)) < 0.5 && ir_ratedcur > 20) || (0 < Math.abs(parseFloat(pf_y_ip)) && Math.abs(parseFloat(pf_y_ip)) < 0.5 && iy_ratedcur > 20) || (0 < Math.abs(parseFloat(pf_b_ip)) && Math.abs(parseFloat(pf_b_ip)) < 0.5 && ib_ratedcur > 20)) {
							PF_Low = "Yes"
						}
						// status11 calculation
						if (V_All_Missing == "Yes" && C_All_Missing == "Yes") {
							Power_Fail = "Yes"
						}

						if (vr_ratedvolt == 0 && ir_ratedcur > 1 && iy_ratedcur == 0 && ib_ratedcur == 0) {
							V_R_Missing = "Yes"
						}
						if (vy_ratedvolt == 0 && iy_ratedcur > 1 && ir_ratedcur == 0 && ib_ratedcur == 0) {
							V_Y_Missing = "Yes"
						}
						if (vb_ratedvolt == 0 && ib_ratedcur > 1 && ir_ratedcur == 0 && iy_ratedcur == 0) {
							V_B_Missing = "Yes"
						}

						if (V_R_Missing == "Yes" || V_Y_Missing == "Yes" || V_B_Missing == "Yes") {
							V_One_Missing = "Yes"
						}

						// to set Wiring status as normal or severe or low or medium
						if (V_One_Low == "No" && V_All_Missing == "No" && V_Unbalance == "No" && C_Unbalance == "No" && C_One_Missing == "No" && C_All_Missing == "No" && CT_One_Reverse == "No" && C_One_High == "No" && V_One_High == "No" && PF_Low == "No" && Power_Fail == "No") {
							wiring_status = "Normal"
						}
						if ((mtr_type.includes("LT") == true && C_Unbalance == "Yes") || C_All_Missing == "Yes" || CT_One_Reverse == "Yes" || Power_Fail == "Yes") {
							wiring_status = "Low"
						}
						if ((mtr_type.includes("LT") == true && C_One_Missing == "Yes") || PF_Low == "Yes" || V_Unbalance == "Yes" || V_One_High == "Yes" || (C_One_High == "Yes" && mtr_type.includes("LT") == true)) {
							wiring_status = "Medium"
						}
						if ((mtr_type.includes("HT") == true && C_One_Missing == "Yes") || (C_Unbalance == "Yes" && mtr_type.includes("HT") == true) || (V_One_Low == "Yes" && V_One_High == "No") || (V_One_Missing == "Yes" && V_One_High == "Yes") || (C_One_High == "Yes" && mtr_type.includes("HT") == true)) {
							wiring_status = "Severe"
						}

						var header = [{
							'v_rated': v_rated,
							'rated_current': rated_current,
							'meter_rtc': dataproc_data[i]['meter_rtc'],
							'meter_pt_ratio': meter_pt_ratio,
							'meter_ct_ratio': meter_ct_ratio,
							'phase_seq': v_ps_ip,
							'mtr_pri_cur': mtr_pri_cur,
							'mtr_sec_cur': mtr_sec_cur,
							'V_Unbalance': V_Unbalance,
							'C_Unbalance': C_Unbalance,
							'V_One_High': V_One_High,
							'C_One_High': C_One_High,
							'Power_Fail': Power_Fail,
							'Low_PF_Status': PF_Low,
							'wiring_status': wiring_status
						}]

						var body = [{
							'v_r_ip': v_r_ip,
							'vr_ratedvolt': vr_ratedvolt,
							'v_y_ip': v_y_ip,
							'vy_ratedvolt': vy_ratedvolt,
							'v_b_ip': v_b_ip,
							'vb_ratedvolt': vb_ratedvolt,
							'c_r_ip': c_r_ip,
							'ir_ratedcur': ir_ratedcur,
							'c_y_ip': c_y_ip,
							'iy_ratedcur': iy_ratedcur,
							'c_b_ip': c_b_ip,
							'ib_ratedcur': ib_ratedcur,
							'c_ra_ip': c_ra_ip,
							'c_ya_ip': c_ya_ip,
							'c_ba_ip': c_ba_ip,
							'pf_r_ip': pf_r_ip,
							'pf_y_ip': pf_y_ip,
							'pf_b_ip': pf_b_ip,
							'V_R_Low': V_R_Low,
							'V_Y_Low': V_Y_Low,
							'V_B_Low': V_B_Low,
							'C_R_Missing': C_R_Missing,
							'C_Y_Missing': C_Y_Missing,
							'C_B_Missing': C_B_Missing,
							'CT_R_Reverse': CT_R_Reverse,
							'CT_Y_Reverse': CT_Y_Reverse,
							'CT_B_Reverse': CT_B_Reverse
						}]

						var c_r_ip = body[0].c_r_ip
						var c_y_ip = body[0].c_y_ip
						var c_b_ip = body[0].c_b_ip
						var c_ra_ip = body[0].c_ra_ip
						var c_ya_ip = body[0].c_ya_ip
						var c_ba_ip = body[0].c_ba_ip
						var pf_r_ip = body[0].pf_r_ip
						var pf_y_ip = body[0].pf_y_ip
						var pf_b_ip = body[0].pf_b_ip
						var phase_seq = header[0].phase_seq
						var a_ir = null
						var a_iy = null
						var a_ib = null
						var angle_ir = null
						var angle_iy = null
						var angle_ib = null
						var angle_r = null
						var angle_y = null
						var angle_b = null
						var angle_v = ""
						var angle_i = ""

						if (pf_r_ip != null)
							a_ir = Math.acos(Math.abs(pf_r_ip)) * 180 / Math.PI
						if (pf_y_ip != null)
							a_iy = Math.acos(Math.abs(pf_y_ip)) * 180 / Math.PI
						if (pf_b_ip != null)
							a_ib = Math.acos(Math.abs(pf_b_ip)) * 180 / Math.PI

						// calculate current angle
						if (make_code == '003') {
							angle_i = lnt(c_r_ip, c_y_ip, c_b_ip, pf_r_ip, pf_y_ip, pf_b_ip, a_ir, a_iy, a_ib)
						}
						else if (make_code == '001' && (c_ra_ip != null && c_ya_ip != null && c_ba_ip != null && mtr_type.includes("3P-4W"))) {
							angle_i = secure(c_ra_ip, c_ya_ip, c_ba_ip, pf_r_ip, pf_y_ip, pf_b_ip, a_ir, a_iy, a_ib)
						}
						else if (make_code == '001' && (c_ra_ip != null && c_ya_ip != null && c_ba_ip != null && mtr_type.includes("3P-3W"))) {
							angle_i = secure(c_ra_ip, c_ya_ip, c_ba_ip, pf_r_ip, pf_y_ip, pf_b_ip, a_ir, a_iy, a_ib)
						}
						else {
							angle_i = others(c_r_ip, c_y_ip, c_b_ip, pf_r_ip, pf_y_ip, pf_b_ip, a_ir, a_iy, a_ib)
						}

						//Calculate voltage angle
						angle_v = v_angle(phase_seq)

						//Add voltage & current angle
						if (angle_v[0] != null && angle_i[0] != null)
							angle_r = angle_v[0] + angle_i[0]

						if (angle_v[1] != null && angle_i[1] != null)
							angle_y = angle_v[1] + angle_i[1]

						if (angle_y > 360)
							angle_y = (angle_y - 360)

						if (angle_v[2] != null && angle_i[2] != null)
							angle_b = angle_v[2] + angle_i[2]

						if (angle_b > 360)
							angle_b = (angle_b - 360)

						var vector_array = []

						vector_array.push({
							"vr": angle_v[0],
							"vy": angle_v[1],
							"vb": angle_v[2],
							"ir": angle_r,
							"iy": angle_y,
							"ib": angle_b
						})

						function lnt(c_r_ip, c_y_ip, c_b_ip, pf_r_ip, pf_y_ip, pf_b_ip, a_ir, a_iy, a_ib) {
							// find angle ir
							if (a_ir != null) {
								if (pf_r_ip >= 0 && c_r_ip >= 0)
									angle_ir = a_ir
								else if (pf_r_ip >= 0 && c_r_ip < 0)
									angle_ir = 180 - a_ir
								else if (pf_r_ip < 0 && c_r_ip < 0)
									angle_ir = 180 + a_ir
								else if (pf_r_ip < 0 && c_r_ip >= 0)
									angle_ir = 360 - a_ir
							}
							// find angle iy
							if (a_iy != null) {
								if (pf_y_ip >= 0 && c_y_ip >= 0)
									angle_iy = a_iy
								else if (pf_y_ip >= 0 && c_y_ip < 0)
									angle_iy = 180 - a_iy
								else if (pf_y_ip < 0 && c_y_ip < 0)
									angle_iy = 180 + a_iy
								else if (pf_y_ip < 0 && c_y_ip >= 0)
									angle_iy = 360 - a_iy
							}
							// find angle ib
							if (a_ib != null) {
								if (pf_b_ip >= 0 && c_b_ip >= 0)
									angle_ib = a_ib
								else if (pf_b_ip >= 0 && c_b_ip < 0)
									angle_ib = 180 - a_ib
								else if (pf_b_ip < 0 && c_b_ip < 0)
									angle_ib = 180 + a_ib
								else if (pf_b_ip < 0 && c_b_ip >= 0)
									angle_ib = 360 - a_ib
							}
							return [angle_ir, angle_iy, angle_ib];
						}

						function secure(c_ra_ip, c_ya_ip, c_ba_ip, pf_r_ip, pf_y_ip, pf_b_ip, a_ir, a_iy, a_ib) {
							// find angle ir
							if (a_ir != null) {
								if (pf_r_ip >= 0 && c_ra_ip >= 0)
									angle_ir = a_ir
								else if (pf_r_ip >= 0 && c_ra_ip < 0)
									angle_ir = 180 + a_ir
								else if (pf_r_ip < 0 && c_ra_ip < 0)
									angle_ir = 180 - a_ir
								else if (pf_r_ip < 0 && c_ra_ip >= 0)
									angle_ir = 360 - a_ir
							}
							// find angle iy
							if (a_iy != null) {
								if (pf_y_ip >= 0 && c_ya_ip >= 0)
									angle_iy = a_iy
								else if (pf_y_ip >= 0 && c_ya_ip < 0)
									angle_iy = 180 + a_iy
								else if (pf_y_ip < 0 && c_ya_ip < 0)
									angle_iy = 180 - a_iy
								else if (pf_y_ip < 0 && c_ya_ip >= 0)
									angle_iy = 360 - a_iy
							}
							// find angle ib
							if (a_ib != null) {
								if (pf_b_ip >= 0 && c_ba_ip >= 0)
									angle_ib = a_ib
								else if (pf_b_ip >= 0 && c_ba_ip < 0)
									angle_ib = 180 + a_ib
								else if (pf_b_ip < 0 && c_ba_ip < 0)
									angle_ib = 180 - a_ib
								else if (pf_b_ip < 0 && c_ba_ip >= 0)
									angle_ib = 360 - a_ib
							}
							return [angle_ir, angle_iy, angle_ib];
						}

						function others(c_r_ip, c_y_ip, c_b_ip, pf_r_ip, pf_y_ip, pf_b_ip, a_ir, a_iy, a_ib) {
							// find angle ir
							if (a_ir != null) {
								if (pf_r_ip >= 0 && c_r_ip >= 0)
									angle_ir = a_ir
								else if (pf_r_ip >= 0 && c_r_ip < 0)
									angle_ir = 180 + a_ir
								else if (pf_r_ip < 0 && c_r_ip < 0)
									angle_ir = 180 - a_ir
								else if (pf_r_ip < 0 && c_r_ip >= 0)
									angle_ir = 360 - a_ir
							}
							// find angle iy
							if (a_iy != null) {
								if (pf_y_ip >= 0 && c_y_ip >= 0)
									angle_iy = a_iy
								else if (pf_y_ip >= 0 && c_y_ip < 0)
									angle_iy = 180 + a_iy
								else if (pf_y_ip < 0 && c_y_ip < 0)
									angle_iy = 180 - a_iy
								else if (pf_y_ip < 0 && c_y_ip >= 0)
									angle_iy = 360 - a_iy
							}
							// find angle ib
							if (a_ib != null) {
								if (pf_b_ip >= 0 && c_b_ip >= 0)
									angle_ib = a_ib
								else if (pf_b_ip >= 0 && c_b_ip < 0)
									angle_ib = 180 + a_ib
								else if (pf_b_ip < 0 && c_b_ip < 0)
									angle_ib = 180 - a_ib
								else if (pf_b_ip < 0 && c_b_ip >= 0)
									angle_ib = 360 - a_ib
							}
							return [angle_ir, angle_iy, angle_ib];
						}

						function v_angle(phase_seq) {

							var angle_vr = ""
							var angle_vy = ""
							var angle_vb = ""

							if (phase_seq == "FORWARD" || phase_seq == null || phase_seq == null || phase_seq == "forward" || phase_seq == "Forward") {
								angle_vr = 0
								angle_vy = 120
								angle_vb = 240
							}
							if (phase_seq == "REVERSE" || phase_seq == "reverse" || phase_seq == "Reverse") {
								angle_vr = 0
								angle_vy = 240
								angle_vb = 120
							}
							return [angle_vr, angle_vy, angle_vb]
						}

						MongoFormat.push({
							"date_obj": moment(dataproc_data[i]["meter_rtc"], "DD-MM-YYYY HH:mm:ss").toDate(),
							"month_year": month_year,
							"hierarchy_code": hierarchy_code,
							"meterId": meter_id,
							"status": [header, body, vector_array],
						});

						var args = {
							data: MongoFormat,
							headers: {
								"Content-Type": "application/json"
							}
						};

						client.post(ipAddr + "/api/wirings?access_token=" + AccessToken, args, function (data, res) {
						});
						dataproc_det.wiring = "Found"
						resolve(dataproc_det)
					}
					else {
						dataproc_det.wiring = "Not Found"
						resolve(dataproc_det)
					}
				})
			})
		}
		catch (e) {
			dataproc_det.wiring = "Error"
			resolve(dataproc_det)
		}
	})
}

module.exports = { calltwoFunction: calltwoFunction };