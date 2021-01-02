var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'packiapraveen@gmail.com',
        pass: 'ramkumarprabaharan'
    }
    });


console.log('created');
transporter.sendMail({
from: 'packiapraveen@gmail.com',
  to: 'duraiseetha96@gmail.com',
  subject: 'hello world!',
  text: 'hello world!'
});