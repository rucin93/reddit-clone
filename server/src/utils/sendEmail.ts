import nodemailer from 'nodemailer'

export async function sendEmail(to: string, html: string) {
  let testAccount = {
    user: 'c55ymd4ywsw4yskv@ethereal.email',
    pass: 'A8PEQKu37YQWXnfKgX',
  }

  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  })

  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: to, // list of receivers
    subject: 'Change password', // Subject line
    html,
  })

  console.log('Message sent: %s', info.messageId)
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}
