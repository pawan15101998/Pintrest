const nodemailer = require("nodemailer");
const {google} = require("googleapis");

const CLIENT_ID = `526457305665-0t82ins3cmfvcg9bparmp3g07q0lg7g1.apps.googleusercontent.com`;

const CLIENT_SECRET = `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`;
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const REFRESH_TOKEN = `1//04D9lFrIW4UyDCgYIARAAGAQSNwF-L9IrUSHAz8Zgorz37NP-wae5wtCsnAB4xmojeGnD1HB1nsnfSlgE30ZRJfzD_Cp0UeBEcvE`;

const oauthclient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauthclient.setCredentials({refresh_token: REFRESH_TOKEN});

async function sendMail(receiver, text){ 
  try{
    const access_token = await oauthclient.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user: "ku1510998@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: access_token
      }
    })

    const mailOpts = {
      from: "ku1510998@gmail.com",
      to: receiver,
      subject: "ashcasd",
      text: "ascbasc",
      html: text
    }

    const result = await transport.sendMail(mailOpts);
    return result;
  }
  catch(err){
    return err;
  }
}

module.exports = sendMail;