var a={"DATA": [{"id":11,"name":"ajax","subject":"OR","mark":63},
{"id":12,"name":"javascript","subject":"OR","mark":63},
{"id":13,"name":"jquery","subject":"OR","mark":63},
{"id":14,"name":"ajax","subject":"OR","mark":63},
{"id":15,"name":"jquery","subject":"OR","mark":63},
{"id":16,"name":"ajax","subject":"OR","mark":63},
{"id":20,"name":"ajax","subject":"OR","mark":63}],"COUNT":"120"}

obj=[]
var b=a.DATA

// for(var i=0;i<b.length;i++){
//     if(obj.includes(b[i].name)){
//         console.log("-")
//     }
//     else{
//         console.log(b[i]["name"])
//         obj.push(b[i]["name"])
//     }
   
// }
// console.log(obj)

var flags = {};
var newPlaces = b.filter(function(entry) {
    if (flags[entry.name]) {
        return false;
    }
    flags[entry.name] = true;
    return true;
    consd
});
console.log(newPlaces)


