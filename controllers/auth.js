const { response } = require('express');
// const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const { generarJWT } = require('../helpers/jwt');

const crearUsuario = async(req, res = response ) => {
    // console.log(req.body);
    // const { name, email, password } = req.body;
    const { email, password } = req.body;

    // if ( name.length < 5 ) {
    //     return res.status(400).json({
    //         ok: false,
    //         msg: 'El nombre debe de ser de 5 letras'
    //     });
    // }

    // // manejo de errores
    // const errors = validationResult( req );
    // // console.log(errors);
    // if ( !errors.isEmpty() ) {
    //     return res.status(400).json({
    //         ok: false,
    //         errors: errors.mapped()
    //     });
    // }

    try {
        let usuario = await Usuario.findOne({ email });
        // console.log(usuario);

        if ( usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe'
            });
        }

        usuario = new Usuario( req.body );

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );


        await usuario.save();

        // Generar JWT
        const token = await generarJWT( usuario.id, usuario.name );
        
        res.status(201).json({
            ok:true,
            uid: usuario.id,
            name: usuario.name,
            token
            // msg: 'registro',
            // name,
            // email,
            // password
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
}

const loginUsuario = async(req, res = response ) => {

    const { email, password } = req.body;

    // // manejo de errores
    // const errors = validationResult( req );
    // if ( !errors.isEmpty() ) {
    //     return res.status(400).json({
    //         ok: false,
    //         errors: errors.mapped()
    //     });
    // }

    try {
        
        const usuario = await Usuario.findOne({ email });

        if ( !usuario ) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese email'
            });
        }

        // Confirmar los passwords
        const validPassword = bcrypt.compareSync( password, usuario.password );

        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'Password incorrecto'
            });
        }

        // Generar nuestro JWT
        const token = await generarJWT( usuario.id, usuario.name );

        res.json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        })


    } catch (error){
        console.log(error);
        res.status(500).json({
            ok: falseº,
            msg: 'Por favor hable con el administrador'
            // email,
            // password
        });
    }
}

const revalidarToken = async(req, res = response ) => {

    const { uid, name } = req;

    // generar un nuevo JWT y retornarlo en esta petición    
    const token = await generarJWT( uid, name );
    
    res.json({
        ok: true,
        uid, name,
        token
    })
}


module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken
};