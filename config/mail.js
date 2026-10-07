import nodemailer from "nodemailer";
 const transport = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"chethankumar7516@gmail.com",
        pass:"rsrq diys bmya mopf"
    }
 })

 export const sendEmail = async (to, subject, text) =>{
      try {
        transport.sendMail({
            from:"chethankumar7516@gmail.com",
            to,
            subject,
            text,
        })
        console.log("email sent successfully")
      } catch (error) {
        console.log(error.message)
      }
 }