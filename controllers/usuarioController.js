import Usuario from "../models/Usuario.js";
import { check, validationResult } from "express-validator";
import { generarId } from "../helpers/tokens.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";
import bcrypt from "bcrypt";
import { where } from "sequelize";


/*=============================================
	FORMULARIO DE LOGIN
	=============================================*/
const formularioLogin = (req, resp) => {
  resp.render("auth/login", {
    pagina: "Iniciar sesión",
    csrfToken: req.csrfToken(),
  });
};

/*=============================================
	FORMULARIO DE REGISTRO
	=============================================*/
const formularioRegistro = (req, resp) => {
  resp.render("auth/registro", {
    pagina: "Crear cuenta",
    csrfToken: req.csrfToken(),
  });
};

/*=============================================
	REGISTRAR USUARIO
	=============================================*/
const registrar = async (req, resp) => {
  //Validación
  await check("nombre").notEmpty().withMessage("El nombre no puede ir vacio").run(req);
  await check("email").isEmail().withMessage("No parece un email valido").run(req);
  await check("password").isLength({ min: 6 }).withMessage("El password debe tener minimo de 6 caracteres").notEmpty().withMessage("El password no puede ir vacio").run(req);
  await check("repetir_password").equals(req.body.password).withMessage("Los password no son iguales").run(req);

  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return resp.render("auth/registro", {
      pagina: "Crear cuenta",
      csrfToken: req.csrfToken(),
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
      csrfToken: req.csrfToken(),
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
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, resp) => {

  //Validación
  await check("email").isEmail().withMessage("No parece un email valido").run(req);
  
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return resp.render("auth/olvide-password", {
      pagina: "Recuperar cuenta",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
     
    });
  }

  //Buscar al usuario

  const {email} = req.body;
  const usuario = await Usuario.findOne({where: {email}});

  if (!usuario) {
    return resp.render("auth/olvide-password", {
      pagina: "Recuperar cuenta",
      csrfToken: req.csrfToken(),
      errores: [{msg: "El email no esta registrado!"}],
     
    });
  }

  //Generar token y enviar email

  usuario.token = generarId();
  usuario.save();

  emailOlvidePassword({
    email: usuario.email,
    nombre:usuario.nombre,
    token:usuario.token
  });

  resp.render("templates/mensaje", {
    pagina: "Restablece tu password",
    mensaje: "Hemos enviado un email con las instrucciones.",
  });

}

const comprobarToken = async (req, resp)=>{

  const {token} = req.params;
  const usuario = await Usuario.findOne({where:{token}});

  if(!usuario){

    resp.render("auth/confirmar-cuenta", {
      pagina: "Restablece tu password",
      mensaje: "Hubo un error al validar tu información!",
      error:true
    });
  }

  //Mostrar formulario para modificar el password

  resp.render("auth/reset-password", {
    pagina:"Reestablece tu password",
    csrfToken: req.csrfToken(),
  })


}
const nuevoPassword = async (req, resp)=>{

  //Validar el password
  await check("password").isLength({ min: 6 }).withMessage("El password debe tener minimo de 6 caracteres").notEmpty().withMessage("El password no puede ir vacio").run(req);
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return resp.render("auth/reset-password", {
      pagina: "Reestablece tu password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
     
    });
  }

  const {token} = req.params;
  const {password} = req.body;

  //Identificar quien hace el cambio
  const usuario = await Usuario.findOne({where: {token}});

  //Hashear el nuevo password

  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;

  await usuario.save();

  resp.render("auth/confirmar-cuenta", {
    pagina: "Password reestablecido",
    mensaje: "El password se guardo correctamente"
  })
}

const autenticar = async (req, res) =>{
//Validar
await check("email").isEmail().withMessage("No parece un email valido").run(req);
await check("password").notEmpty().withMessage("El password es obligatorio").run(req);

let resultado = validationResult(req);

if (!resultado.isEmpty()) {
  return res.render("auth/login", {
    pagina: "Iniciar sesión",
    csrfToken: req.csrfToken(),
    errores: resultado.array(),
   
  });
}

const {email, password} = req.body;

//Comprobar si el usuario existe

const usuario = await Usuario.findOne({where:{email}});

if(!usuario){

  return res.render("auth/login", {
    pagina: "Iniciar sesión",
    csrfToken: req.csrfToken(),
    errores: [{msg:"El usuario no existe"}],
   
  });
}

//Comprobar si la cuenta esta confirmada

if(!usuario.confirmado){

  return res.render("auth/login", {
    pagina: "Iniciar sesión",
    csrfToken: req.csrfToken(),
    errores: [{msg:"Tu cuenta no ha sido confirmada"}],
   
  });
}






}


export {
  formularioLogin,
  formularioRegistro,
  formularioRecuperarPassword,
  registrar,
  confirmar,
  resetPassword,
  comprobarToken,
  nuevoPassword,
  autenticar
};
