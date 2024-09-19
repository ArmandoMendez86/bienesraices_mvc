import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { nombre, email, token } = datos;

  //Enviar email
  await transport.sendMail({
    from: "Bienes raices.com",
    to: email,
    subject: "Confirma tu cuenta en bienesraices.com",
    text: "Confirma tu cuenta en bienesraices.com",
    html: `
        <p>Hola ${nombre}, comprueba tu cuenta en bienesRaices.com<p/>
        <p>Tu cuenta ya esta lista, solo debes confirmar en el siguiente enlace
            <a href='${process.env.BACKEND_URL}:${
      process.env.PORT ?? 3000
    }/auth/confirmar/${token}'>Confirma tu cuenta<a/>
        <p/>
        <p>Si tu no creaste la cuenta, puedes hacer caso omiso a este mensaje<p/>

    `,
  });
};
const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { nombre, email, token } = datos;

  //Enviar email
  await transport.sendMail({
    from: "Bienes raices.com",
    to: email,
    subject: "Restablece tu password en bienesraices.com",
    text: "Restablece tu password en bienesraices.com",
    html: `
        <p>Hola ${nombre}, has solicitado restablecer tu password en bienesRaices.com<p/>
        <p>Tu cuenta ya esta lista, solo debes confirmar en el siguiente enlace
            <a href='${process.env.BACKEND_URL}:${
      process.env.PORT ?? 3000
    }/auth/olvide-password/${token}'>Restablecer password<a/>
        <p/>
        <p>Si tu no solicitaste el cambio de password, ignora el mensaje!<p/>

    `,
  });
};

export { emailRegistro,
  emailOlvidePassword
 };
