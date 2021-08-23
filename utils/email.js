const nodemailer = require('nodemailer');
const pug = require('pug');
const HtmlToText = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.first_name;
    this.url = url;
    this.from = ` Run Automations <info@runautomations.com>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info.runautomations@gmail.com',
        pass: 'gyvomqwdqdlsdgje'
      }
    });
  }
  async send(template, subject) {
    //render html based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: HtmlToText.fromString(html),
      html
    };
    // this.newTransport()
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    console.log('reached jere');
    await this.send(
      'welcome',
      'Welcome to Run Automations Monitoring Platform'
    );
  }
  async sendPasswordReset() {
    await this.send('passwordReset', 'Request for password reset');
  }
};
const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: ' zac <hello@zac.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

// module.exports = Email;
