var b=4
var a=[4,3,1,2]
var counter=0
for(var i=0;i<b;i++){
    for(var j=i+1;j<b;j++){
        if(a[i]>a[j]){
            counter++
            temp=a[i]
            a[i]=a[j]
            a[j]=temp
            console.log(a)
        }
    }
}
console.log(counter)


