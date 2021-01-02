const express = require('express'),
cors = require('cors'),
multer = require('multer'),
bodyParser = require('body-parser');
const shell = require('shelljs')
var mongoose=require('mongoose')
var paginate = require('jw-paginate');
var MongoClient = require('mongodb').MongoClient

const app = express();
app.use(cors({origin :"*"}))
app.use(bodyParser.json());

app.listen(8080, () =>{
  console.log("server running")
})



app.get('/api/items', (req, res, next) => {
  
    // example array of 150 items to be paged

    MongoClient.connect('mongodb://192.168.4.63:27017/demo', function (err, client) {
          if (err) throw err

          var db = client.db('demo')

          db.collection('d4').find().toArray(function (err, result) {
            if (err) throw err

            console.log(result)
         
       
    const items =result
    console.log(req.query.page)
    // get page from query params or default to first page
    const page = parseInt(req.query.page) || 1;;

    // get pager object for specified page
    const pageSize = 5;
    const pager = paginate(items.length, page, pageSize);
    

    // get page of items from items array
    const pageOfItems = items.slice(pager.startIndex, pager.endIndex + 1);
    console.log(pager.startIndex)
    return res.json({ pager, pageOfItems });
  })
  })
});



