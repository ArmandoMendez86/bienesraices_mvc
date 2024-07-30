import Usuario from "../models/Usuario.js";
import { check, validationResult } from "express-validator";
import { generarId } from "../helpers/tokens.js";
import { emailRegistro } from "../helpers/emails.js";

const formularioLogin = (req, resp) => {
  resp.render("auth/login", {
    pagina: "Iniciar sesión",
  });
};

const formularioRegistro = (req, resp) => {
  resp.render("auth/registro", {
    pagina: "Crear cuenta",
  });
};
const registrar = async (req, resp) => {
  //Validación
  await check("nombre")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio")
    .run(req);
  await check("email")
    .isEmail()
    .withMessage("No parece un email valido")
    .run(req);
  await check("password")
    .isLength({ min: 6 })
    .withMessage("El password debe tener minimo de 6 caracteres")
    .notEmpty()
    .withMessage("El password no puede ir vacio")
    .run(req);
  await check("repetir_password")
    .equals(req.body.password)
    .withMessage("Los password no son iguales")
    .run(req);

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return resp.render("auth/registro", {
      pagina: "Crear cuenta",
      errores: resultado.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //Extraer datos
  const { nombre, email, password } = req.body;

  //Verificar que el usuario existe
  const existeUsuario = await Usuario.findOne({
    where: { email },
  });

  if (existeUsuario) {
    return resp.render("auth/registro", {
      pagina: "Crear cuenta",
      errores: [{ msg: "El usuario ya esta registrado" }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //almacenar en la base de datos
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  //Enviar email de confirmación
  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  //Mensaje de confirmación de cuenta
  resp.render("templates/mensaje", {
    pagina: "Cuenta creada correctamente",
    mensaje: "Hemos enviado un email de confirmación, presiona en el enlace",
  });
}

//Comprobando la cuenta
const confirmar = (req, res)=>{
  const {token}= req.params;

  //Verificar si el token es valido

  //Confirmar la cuenta
}

const formularioRecuperarPassword = (req, resp) => {
  resp.render("auth/olvide-password", {
    pagina: "Recuperar cuenta",
  });
};

export {
  formularioLogin,
  formularioRegistro,
  formularioRecuperarPassword,
  registrar,
  confirmar
};
