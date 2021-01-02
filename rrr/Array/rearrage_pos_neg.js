a= [5, -2, 5, 2, 4, -7, 1, 8, 0, -8]
var neg=[]
var pos=[]
var merg=[]
for(var i=0;i<a.length;i++){
    if(Math.sign(a[i])==-1){
       neg.push(a[i])
    }
    else{
        pos.push(a[i])
    }
}
var total=pos.length+neg.length

var counter=0
for(var j=0;j<total;j++){
    if(counter<neg.length)
        merg.push(neg[counter])
    counter++
    if(counter<pos.length)
        merg.push(pos[counter])
}
console.log(merg)