import Usuario from "../models/Usuario.js";
import { check, validationResult } from "express-validator";
import { generarId } from "../helpers/tokens.js";
import { emailRegistro } from "../helpers/emails.js";


/*=============================================
	FORMULARIO DE LOGIN
	=============================================*/
const formularioLogin = (req, resp) => {
  resp.render("auth/login", {
    pagina: "Iniciar sesión",
  });
};

/*=============================================
	FORMULARIO DE REGISTRO
	=============================================*/
const formularioRegistro = (req, resp) => {
  resp.render("auth/registro", {
    pagina: "Crear cuenta",
    csrfToken: req.csrfToken()
  });
};

/*=============================================
	REGISTRAR USUARIO
	=============================================*/
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

  //Email de confirmación
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
};

/*=============================================
	COMPROBANDO CUENTA
	=============================================*/
const confirmar = async (req, res) => {
  const { token } = req.params;

  //Verificar si el token es valido
  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta", {
      pagina: "Error al confirmar tu cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta, intenta de nuevo",
      error: true,
    });
  }

  //Confirmar la cuenta
  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  res.render("auth/confirmar-cuenta", {
    pagina: "Cuenta confirmada",
    mensaje: "Cuenta confirmada conrrectamente!",
  });
};

/*=============================================
	RECUPERAR PASSWORD
	=============================================*/
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
  confirmar,
};
