import express from 'express';
import { isAuthenticated, login, logout, register } from '../controllers/authControllers.js';
const router = express.Router();

// router para las vistaas
router.get('/',  isAuthenticated,(req,res)=> {
res.render('index' , {user:req.user})
})

router.get('/login', (req,res)=> {
    res.render('login')
})

router.get('/register', (req,res)=> {
    res.render('register')
})

//router para el controllers
router.post('/register',  register)
router.post('/login', login)
router.get('/logout', logout)

export default router