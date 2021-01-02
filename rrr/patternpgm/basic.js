var a="Hello3333"
var o=""
tot_len=a.length+4


var str=""

for(var i=0;i<5;i++){
  
    for(var j=0;j<tot_len;j++){
        
        if(i==0 || i==4){
            str+="*"
        }
        else if(i==1 ||i==3){
            if(j!=0 && j!=tot_len-1)
            {
                str+=" "
            }
            if(j==0 || j==tot_len-1){
                str+="*"
            }
        }
        else if(i==2){
            
            if(j==0 || j==tot_len-1){
                str+="*"
            }
            else if(j==2){
                str+=" "+a+" "
            }
        }
    }
    str+="\n"
}
console.log(str)
