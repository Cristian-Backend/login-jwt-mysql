// Importa el módulo de promesas de mysql2
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Crea la conexión utilizando el módulo de promesas
async function conexionDB() {
  try {
    const conexion = await mysql.createConnection({
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    console.log('Conexión exitosa a la base de datos!');
    return conexion;  // Devuelve la conexión para ser usada en otras partes de la aplicación.
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;  // Relanza el error para manejarlo más arriba o fallar si es necesario.
  }
}

// Exporta la función sin llamarla inmediatamente
export default conexionDB;
