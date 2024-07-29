import Usuario from "../models/Usuario.js";
import { check, validationResult } from "express-validator";

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
      usuario:{
        nombre:req.body.nombre,
        email:req.body.email
      }
    });
  }
  const usuario = await Usuario.create(req.body);
  resp.json(usuario);
};

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
};
