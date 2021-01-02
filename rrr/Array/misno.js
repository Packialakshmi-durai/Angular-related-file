
var a=[1,2,3,6,9,15]
var misno=[]
for(var i=1;i<15;i++){
	if(a.includes(i)){
		console.log("yes")
	}
	else{
		misno.push(i)
	}
}
console.log(misno)