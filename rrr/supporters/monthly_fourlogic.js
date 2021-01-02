var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');

function callfourFunction(AccessToken, i, dataproc_data, ipAddr, monthly_data, errlog) {

    return new Promise(async function (resolve, reject) {

        try {

            monthly_data.P50 = null
            monthly_data.P51 = null
            monthly_data.P52 = null
            monthly_data.P53 = null
            monthly_data.P54 = null
            monthly_data.P55 = null
            monthly_data.P56 = null
            monthly_data.P57 = null
            monthly_data.P58 = null
            monthly_data.P59 = null
            monthly_data.P60 = null
            monthly_data.P61 = null
            monthly_data.P62 = null
            monthly_data.P63 = null
            monthly_data.P64 = null
            monthly_data.P65 = null
            monthly_data.P66 = null

            if (dataproc_data[i]['bill_from_date'] != null && dataproc_data[i]['bill_to_date'] != null && dataproc_data[i]['bill_from_date'] != "-" && dataproc_data[i]['bill_to_date'] != "-") {
                var d4_from_date = moment(dataproc_data[i]['bill_from_date'], "DD-MM-YYYY").toISOString()
                var d4_to_date = moment(dataproc_data[i]['bill_to_date'], "DD-MM-YYYY").toISOString()
            }
            else {
                var d4_from_date = (moment(dataproc_data[i]['meter_rtc'], "DD-MM-YYYY").subtract(30, 'days')).toISOString()
                var d4_to_date = moment(dataproc_data[i]['meter_rtc'], "DD-MM-YYYY").toISOString()
            }

            await client.get(ipAddr + "/api/dailies?access_token=" + AccessToken + "&filter[where][hierarchy_code]=" + monthly_data.hierarchy_code + "&filter[where][and][0][date_obj][gte]=" + d4_from_date + "&filter[where][and][1][date_obj][lte]=" + d4_to_date + "&filter[order]=date_obj ASC", async function (d4_data, d4_response, d4_err) {

                if (d4_data.length != 0 && d4_data.length != undefined) {

                    var kwh_sum = 0
                    var kvah_sum = 0
                    var demand_l20_cd = 0
                    var demand_20_100_cd = 0
                    var demand_g100_cd = 0
                    var tot_slots = 0
                    var nl = 0
                    var bo = 0
                    var pf_l5 = 0
                    var pf_5_7 = 0
                    var pf_g7 = 0
                    var used_slots = 0
                    var monthly_md = []
                    var md_unit = []

                    // monthly calculation
                    for (var k = 0; k < d4_data.length; k++) {
                        if (d4_data[k]['kwh'] != null) {
                            kwh_sum += parseFloat(d4_data[k]['kwh'])
                        }
                        if (d4_data[k]['kvah'] != null) {
                            kvah_sum += parseFloat(d4_data[k]['kvah'])
                        }

                        if (d4_data[k]['max_kw'] != null) {
                            monthly_md.push(parseFloat(d4_data[k]['max_kw']))
                            md_unit.push('kw')
                        }
                        if (d4_data[k]['max_kw'] == null && d4_data[k]['max_kva'] != null) {
                            monthly_md.push(parseFloat(d4_data[k]['max_kva']))
                            md_unit.push('kva')
                        }
                        if (d4_data[k]['demand_l20_cd'] != 0) {
                            demand_l20_cd += parseFloat(d4_data[k]['demand_l20_cd'])
                        }
                        if (d4_data[k]['demand_g20_40_cd'] != 0 && d4_data[k]['demand_g40_80_cd'] != 0 && d4_data[k]['demand_g80_100_cd'] != 0) {
                            demand_20_100_cd += parseFloat(d4_data[k]['demand_g20_40_cd']) + parseFloat(d4_data[k]['demand_g40_80_cd']) + parseFloat(d4_data[k]['demand_g80_100_cd'])
                        }
                        if (d4_data[k]['cd_cnt'] != 0) {
                            demand_g100_cd += parseFloat(d4_data[k]['cd_cnt'])
                        }
                        if (d4_data[k]['tot_slots'] != 0) {
                            tot_slots += parseFloat(d4_data[k]['tot_slots'])
                        }
                        if (d4_data[k]['nl'] != 0) {
                            nl += parseFloat(d4_data[k]['nl'])
                        }
                        if (d4_data[k]['bo'] != 0) {
                            bo += parseFloat(d4_data[k]['bo'])
                        }
                        if (d4_data[k]['pf_l5'] != 0) {
                            pf_l5 += parseFloat(d4_data[k]['pf_l5'])
                        }
                        if (d4_data[k]['pf_5_7'] != 0) {
                            pf_5_7 += parseFloat(d4_data[k]['pf_5_7'])
                        }
                        if (d4_data[k]['pf_g7'] != 0) {
                            pf_g7 += parseFloat(d4_data[k]['pf_7_9']) + parseFloat(d4_data[k]['pf_g9'])
                        }
                        if (d4_data[k]['used_slots'] != 0) {
                            used_slots += parseFloat(d4_data[k]['used_slots'])
                        }
                    }

                    // P50 logic
                    if (kwh_sum != 0) {
                        monthly_data.P50 = kwh_sum
                    }
                    // P51 logic
                    if (kvah_sum != 0) {
                        monthly_data.P51 = kvah_sum
                    }
                    // P52 logic
                    if (monthly_md.length != 0)
                        monthly_data.P52 = Math.max(...monthly_md)
                    // P53 logic
                    monthly_data.P53 = md_unit[0]

                    var md_sum = 0
                    // md sum logic
                    for (var m = 0; m < monthly_md.length; m++) {
                        md_sum += parseFloat(monthly_md[m])
                    }
                    // P54 logic
                    if (md_sum != 0) {
                        monthly_data.P54 = (md_sum / monthly_md.length)
                    }
                    // P55 logic
                    if (monthly_data.P52 != null && monthly_data.P14 != null) {
                        monthly_data.P55 = (parseFloat(monthly_data.P52) / parseFloat(monthly_data.P14)) * 100
                    }
                    // P56 logic
                    if (monthly_data.P54 != null && monthly_data.P14 != null) {
                        monthly_data.P56 = (parseFloat(monthly_data.P54) / parseFloat(monthly_data.P14)) * 100
                    }
                    // P57 logic
                    if (monthly_data.P52 != null && monthly_data.P54 != null) {
                        monthly_data.P57 = (parseFloat(monthly_data.P54) / parseFloat(monthly_data.P52)) * 100
                    }
                    // P58 logic
                    if (tot_slots != 0 && demand_l20_cd != 0) {
                        monthly_data.P58 = (parseFloat(demand_l20_cd) / parseFloat(tot_slots)) * 100
                    }
                    // P59 logic
                    if (tot_slots != 0 && demand_20_100_cd != 0) {
                        monthly_data.P59 = (parseFloat(demand_20_100_cd) / parseFloat(tot_slots)) * 100
                    }
                    // P60 logic
                    if (tot_slots != 0 && demand_g100_cd != 0) {
                        monthly_data.P60 = (parseFloat(demand_g100_cd) / parseFloat(tot_slots)) * 100
                    }
                    // P61 logic
                    if (tot_slots != 0 && nl != 0) {
                        monthly_data.P61 = (parseFloat(nl) / parseFloat(tot_slots)) * 100
                    }
                    // P62 logic
                    if (tot_slots != 0 && bo != 0) {
                        monthly_data.P62 = (parseFloat(bo) / parseFloat(tot_slots)) * 100
                    }
                    // P63 logic
                    if (used_slots != 0 && pf_l5 != 0) {
                        monthly_data.P63 = (parseFloat(pf_l5) / parseFloat(used_slots)) * 100
                    }
                    // P64 logic
                    if (used_slots != 0 && pf_5_7 != 0) {
                        monthly_data.P64 = (parseFloat(pf_5_7) / parseFloat(used_slots)) * 100
                    }
                    // P65 logic
                    if (used_slots != 0 && pf_g7 != 0) {
                        monthly_data.P65 = (parseFloat(pf_g7) / parseFloat(used_slots)) * 100
                    }
                    // P66 logic
                    monthly_data.P66 = d4_data.length

                    errlog.monthly_D4 = "Found"
                    resolve([monthly_data, errlog])
                }
                else {
                    errlog.monthly_D4 = "Not Found"
                    resolve([monthly_data, errlog])
                }
            })
        }
        catch (e) {
            errlog.monthly_D4 = "Error"
            resolve([monthly_data, errlog])
        }
    })
}

module.exports = { callfourFunction: callfourFunction };