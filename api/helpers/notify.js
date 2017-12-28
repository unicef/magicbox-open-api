import config from '../../config'
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

/**
 * Returns ip, path and query of the request
 * @param  {object} request request object
 * @return {object} object with ip, path and query of the request
 */
module.exports = (subject, message) => {
  return new Promise((resolve, reject)=>  {
    var mailOptions = {
      from: config.email.from,
      to: config.email.to,
      subject: subject,
      text: JSON.stringify(message)
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        return reject(error)
      } else {
        console.log('Email sent: ' + info.response);
        return resolve(error)
      }
    });

  })
}
