import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import conexionDB from '../database/db.js';
import { promisify } from 'util';


const register = async (req, res) => {
  try {
    const { name, user, pass } = req.body;
    const passHash = await bcryptjs.hash(pass, 8);

    // Obtén la conexión
    const conexion = await conexionDB();

    // Inserción en la base de datos
    const [rows] = await conexion.query('INSERT INTO users (name, user, pass) VALUES (?, ?, ?)', [name, user, passHash]);

    // Verificar si la inserción fue exitosa
    if (rows.affectedRows > 0) {
      return res.redirect('/'); // Redirige si el registro es exitoso
    } else {
      return res.status(500).json({ msg: 'Hubo un error en el registro' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: 'Error al procesar la solicitud' });
  }
};

const login = async (req, res) => {
    try {
      const { user, pass } = req.body;
  
      if (!user || !pass) {
       return  res.render('login', {
          alert: true,
          alertTitle: "Advertencia",
          alertMessage: "Ingrese un usuario y contraseña",
          alertIcon: 'info',
          showConfirmButton: true,
          timer: false,
          ruta: 'login'
        });
      }
  
      // Obtén la conexión
      const conexion = await conexionDB();
  
      // Consulta en la base de datos
      const [results] = await conexion.query('SELECT * FROM users WHERE user = ?', [user]);
  
      // Verifica si el usuario existe y la contraseña
      if (results.length === 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
        return res.render('login', {
          alert: true,
          alertTitle: "Error",
          alertMessage: "Usuario y/o contraseña incorrectas",
          alertIcon: 'error',
          showConfirmButton: true,
          timer: false,
          ruta: 'login'
        });
      }
  
      // Inicio de sesión OK
      const id = results[0].id;
      const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TIEMPO_EXPIRE
      });
  
      console.log(`TOKEN: ${token} para el USUARIO: ${user}`);
  
      const cookiesOptions = {
        expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES, 10) * 24 * 60 * 60 * 1000), // Asegúrate de que sea un número
        httpOnly: true
      };
      res.cookie('jwt', token, cookiesOptions);
  
     return  res.render('login', {
        alert: true,
        alertTitle: "Conexión exitosa",
        alertMessage: "¡LOGIN CORRECTO!",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 800,
        ruta: ''
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Error al procesar la solicitud' }); // Manejo de errores más robusto
    }
  };

  const isAuthenticated = async (req, res, next) => {
    if (req.cookies.jwt) { // Cambiado a req.cookies.jwt
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET); 
            const conexion = await conexionDB();
            const [results] = await conexion.query('SELECT * FROM users WHERE id = ?', [decoded.id]);  //decodificar
            
            if (!results.length) {
                return next(); 
            }
            req.user = results[0]; // Asigna el usuario decodificado a req.user
            return next(); // Continúa al siguiente middleware
        } catch (error) {
            console.error(error); // Manejo de errores
            return next()
        }
    } else {
       res.redirect('/login')
    }
};

const logout = (req, res) => {
    res.clearCookie('jwt')
    return res.redirect('/');
};


export { register, login, isAuthenticated, logout };
