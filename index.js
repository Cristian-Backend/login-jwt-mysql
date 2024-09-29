import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import routerIndex from './routes/router.js'
import conexion from './database/db.js'

dotenv.config();

const app = express();

// Motor de plantillas
app.set('view engine', 'ejs');

// Carpeta public
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware de cookies
app.use(cookieParser());

// Puerto
const port = process.env.PORT || 3000;

// rutas
app.use('/', routerIndex)

// Para eliminar cache
app.use(function(req, res, next) {
  if (!req.user)
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});

// Iniciar servidor
app.listen(port, () => {
  conexion()
  console.log('Server is running on port', port);
});
