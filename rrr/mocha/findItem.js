

var aa = "name2"
var bb = "ajax"

var sat = function () {
    
    var a = [
        { "id": 11, "name2": "ajax", "subject": "OR1", "mark": 63 },
        { "id": 12, "name": "javascript", "subject": "OR2", "mark": 63 },
        { "id": 13, "name": "jquery", "subject": "OR2", "mark": 63 },
        { "id": 14, "name2": "ajax", "subject": "OR3", "mark": 63 },
        { "id": 15, "name": "jquery", "subject": "OR4", "mark": 63 },
        { "id": 16, "name": "ajax", "subject": "OR5", "mark": 63 },
        { "id": 20, "name1": "ajax", "subject": "OR6", "mark": 63 }
    ]
    let ret = [];
    console.log(typeof(ret))
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < Object.keys(a[i]).length; j++) {
            if (Object.keys(a[i])[j] == aa && Object.values(a[i])[j] == bb) {
                ret.push(a[i])
            }
        }

    }
    return ret;
}

module.exports = { sat: sat }