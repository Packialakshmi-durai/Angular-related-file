
var aa= process.argv[2]
var bb= process.argv[3]

var a=[
{"id":11,"name2":"ajax","subject":"OR1","mark":63},
{"id":12,"name":"javascript","subject":"OR2","mark":63},
{"id":13,"name":"jquery","subject":"OR2","mark":63},
{"id":14,"name2":"ajax","subject":"OR3","mark":63},
{"id":15,"name":"jquery","subject":"OR4","mark":63},
{"id":16,"name":"ajax","subject":"OR5","mark":63},
{"id":20,"name1":"ajax","subject":"OR6","mark":63}
]
var f={
    "name":"ajax",
    "subject":"OR5",
    "mark":6
}



console.log(a.filter(a=>Object.keys(f).every(key => a[key] === f[key])))
