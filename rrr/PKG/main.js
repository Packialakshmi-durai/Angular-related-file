const fs = require('fs')
//filePath="/home/rd/Desktop/MY_DOCUMENT/PKG/file.json"
module.exports = function(filePath) {
    let data = fs.readFileSync("/home/rd/Desktop/MY_DOCUMENT/PKG/file.json").toString() /* open the file as string */
    let object = JSON.parse(data) /* parse the string to object */
    console.log(object)
    return JSON.stringify(object, false, 3) /* use 3 spaces of indentation */
}