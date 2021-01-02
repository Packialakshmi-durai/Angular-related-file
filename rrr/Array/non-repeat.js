input = [0, 5, 3, 4, 3, 5, 6]
var a=[]
for(var i=0;i<input.length;i++){
    flag=0
   for(var j=i+1;j<input.length;j++){
       if(input[i]==input[j]){
           a.push(input[i])
       }
   }
}
for( var k=0;k<input.length;k++){
    if(!a.includes(input[k])){
        console.log(input[k])
    }
}
