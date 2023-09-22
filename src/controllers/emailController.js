// Nos conectamos a la bd
const connection = require('../config/database.js');
// Función para enviar correos
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

exports.sendMail = async (req, res) => {
    try {
        // Configura el transporte de correo
        let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST, // Servidor SMTP
            port: 587, // Puerto SMTP
            secure: false, // true para 465, false para otros puertos
            auth: {
                user: process.env.EMAIL_AUTH_USER, // Usuario del servidor SMTP
                pass: process.env.EMAIL_AUTH_PASSWORD // Contraseña del servidor SMTP
            },
            tls: "SSLv3"
        });

        // Configura los detalles del correo
        let mailOptions = {
            from: process.env.EMAIL_OPTIONS_FROM, // Dirección del remitente
            to: 'gabrielvallejo2000@gmail.com', // Lista de destinatarios separar por , en el mismo string
            subject: 'Hello ✔', // Asunto del correo
            text: 'Hello world?', // Cuerpo del correo en texto plano
            html: '<b>Hello world?</b>' // Cuerpo del correo en HTML
        };

        // Envia el correo
        let info = await transporter.sendMail(mailOptions);
        
        res.status(200).send({
            success: true,
            message: 'Correo enviado exitosamente!',
            info: info
        });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).send({
            success: false,
            message: 'Error al enviar el correo',
            error: error.toString()
        });
    }
};
