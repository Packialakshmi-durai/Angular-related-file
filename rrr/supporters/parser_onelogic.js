var Client = require('node-rest-client').Client;
var client = new Client();
var moment = require('moment');

function calloneFunction(Node1, dataproc_det, ipAddr, AccessToken, hierarchy_code, month_year) {

    return new Promise(async function (resolve, reject) {

        try {

            var G3 = null
            var G7 = null
            var G8 = null
            var G9 = null
            var G10 = null
            var G11 = null
            var G12 = null
            var G13 = null
            var G14 = null
            var G15 = null
            var G19 = null
            var G20 = null
            var G22 = []
            var G32 = null

            var G1 = (Node1.D1.G1).toString().padStart(8, 0)
            var G2 = Node1.D1.G2
            if (Node1.D1.G3 != undefined)
                G3 = Node1.D1.G3
            if (Node1.D1.G7 != undefined)
                G7 = Node1.D1.G7
            if (Node1.D1.G8 != undefined)
                G8 = Node1.D1.G8
            if (Node1.D1.G9 != undefined)
                G9 = parseFloat(Node1.D1.G9)
            if (Node1.D1.G10 != undefined)
                G10 = parseFloat(Node1.D1.G10)
            if (Node1.D1.G11 != undefined)
                G11 = parseFloat(Node1.D1.G11)
            if (Node1.D1.G12 != undefined)
                G12 = parseFloat(Node1.D1.G12)
            if (Node1.D1.G13 != undefined)
                G13 = Node1.D1.G13
            if (Node1.D1.G14 != undefined)
                G14 = Node1.D1.G14
            if (Node1.D1.G15 != undefined)
                G15 = Node1.D1.G15
            if (Node1.D1.G19 != undefined)
                G19 = parseInt(Node1.D1.G19)
            if (Node1.D1.G20 != undefined)
                G20 = parseInt(Node1.D1.G20)
            G22.push(Node1.D1.G22._CODE, Node1.D1.G22._NAME)
            if (Node1.D1.G32 != undefined)
                G32 = Node1.D1.G32

            var finalformat = []

            finalformat.push({
                "G1": G1,
                "G2": G2,
                "G3": G3,
                "G7": G7,
                "G8": G8,
                "G9": G9,
                "G10": G10,
                "G11": G11,
                "G12": G12,
                "G13": G13,
                "G14": G14,
                "G15": G15,
                "G19": G19,
                "G20": G20,
                "G22": G22,
                "G32": G32
            })

            var d1_finalformat = []

            d1_finalformat.push({
                "date_obj": moment(G2, "DD-MM-YYYY HH:mm:ss").toDate(),
                "month_year": month_year,
                "hierarchy_code": hierarchy_code,
                "D1": finalformat
            })

            var args = {
                data: d1_finalformat,
                headers: {
                    "Content-Type": "application/json"
                }
            };

            client.post(ipAddr + "/api/d1s?access_token=" + AccessToken, args, function (data, res) {
            });
            resolve(dataproc_det)
        }
        catch (e) {
            resolve(dataproc_det)
        }
    })
}

module.exports = { calloneFunction: calloneFunction }