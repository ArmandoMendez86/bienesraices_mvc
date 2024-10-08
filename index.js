import express from "express";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import db from './config/db.js';

//crear la app
const app = express();

//Habilitar lectura de datos en formulario
app.use(express.urlencoded({extended:true}));

//habilitar cookie parser
app.use(cookieParser())

//Habilitar CRSF manera global
app.use(csurf({cookie:true}))

//Conexion a la base de datos
try {
  await db.authenticate();
  db.sync()
  console.log('conexion exitosa');
} catch (error) {
  console.log(error)
}

//Routing
app.use("/auth", usuarioRoutes);

//Habilitar Pug
app.set("view engine", "pug");
app.set("views", "./views");

//Carpeta publica
app.use(express.static("public"));

//Definir puerto y arrancar proyecto
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`El servidor esta funcionando en el puerto ${port}`);
});
