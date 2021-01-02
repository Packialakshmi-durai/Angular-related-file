var a=6


str=""
// for(var i=0;i<a;i++){

//     for(var k=0;k<a-i;k++){
//         str+=" "
//     }
//     for(var j=0;j<=i;j++){
//         str+="*"+" "//r-space---get another type patter
//     }
//     str+="\n"
// }
// for(var i=a;i>=0;i--){
//     for(var k=0;k<a-i;k++){//
//         str+=" "//r-for ----get another type patter
//     }//
//     for(var j=0;j<=i;j++){
//         str+="*"+" "//r-space----get another type patter
//     }
//     str+="\n"
// }
// console.log(str)

//=================================================================


// * * * * * 
//  * * * * 
//   * * * 
//    * * 
//     * 
//     * 
//    * * 
//   * * * 
//  * * * * 
// * * * * * 



// for(var i=a;i>=0;i--){

//     for(var k=0;k<a-i;k++){
//         str+=" "
//     }
//     for(var j=0;j<=i;j++){
//         str+="*"+" "
//     }
//     str+="\n"
// }
// for(var i=0;i<a;i++){

//     for(var k=0;k<a-i;k++){
//         str+=" "
//     }
//     for(var j=0;j<=i;j++){
//         str+="*"+" "
//     }
//     str+="\n"
// }
// console.log(str)

// *
// * *
// *   *
// *     *
// *********

// for(var i=0;i<a;i++){

//         for(var k=0;k<a-i;k++){
//             str+=" "
//         }
//         for(var j=0;j<=i;j++){
//             if((j==0 || j==i) & i!=a-1)
//             str+="*"+" "
//             else if(i==a-1)
//             str+="*"+" "
//             else
//             str+=" "+" "
//         }
//         str+="\n"
//     }

//     console.log(str)

//     1 
// 2 3 
// 4 5 6 
// 7 8 9 10 
// 11 12 13 14 15 
k=1
for(var i=1;i<=a;i++){
    for(var j=1;j<=i;j++){
            str+=k++
    }
    
    str+="\n"
}
console.log(str)