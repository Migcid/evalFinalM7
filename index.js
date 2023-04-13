import express from "express";
import { create } from "express-handlebars";
import * as path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import {addPais, deletePais, filtrarPaises } from './consultas.js';


let PORT = process.env.PORT || 3000;

const app = express();

//MIDDLEWARE

app.use(express.json())
app.use(express.urlencoded({extended:false}));

const hbs = create({
	partialsDir: [
		"views/partials/",
	],
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));

app.listen(PORT, () => console.log("http://localhost:3000"));


//RUTAS DE VISTAS
app.get(["/", "/home"], async (req, res) => {
    let limit = Number(req.query.limit) || 2;
    let offset = Number(req.query.offset) || 0;
    filtrarPaises(limit, offset).then(paises => {
        console.log(paises);
        let disableSiguiente = paises.length < limit;
        res.render("home", {
            paises,
            ultimoOffset: offset,
            disableSiguiente,
        });
    }).catch(error => {
        res.render("home", {
            error
        });
    })
});



//RUTA AGREGAR PAIS
app.get("/add/pais", (req, res) => {
    res.render("addPais")
});

//RUTA RECIBE DATOS DE PAISES
app.post("/add/pais", async (req, res) => {
    let {nombre, continente, poblacion, pib_2019, pib_2020} = req.body;
    addPais(nombre, continente, poblacion, pib_2019, pib_2020).then(respuesta => {
        res.send("<p>Registro salío bien: <a href='http://localhost:3000'>Volver al inicio</a></p>")
    }).catch(error => {
        res.send("<p>no se pudo realizar el Registro: <a href='http://localhost:3000/add/pais'>Volver</a></p>")
    })
});

//RUTA ELIMINAR PAIS VISTA
app.get("/delete/pais", async (req, res) => {
    res.render("deletePais");
});

//RUTA ELIMINAR PAIS ENDPOINT
app.delete("/delete/pais/:nombre", async (req, res) => {
    let nombre = req.params.nombre;
    deletePais(nombre).then(respuesta => {
        res.json({code: 200, message: respuesta})
    }).catch(error => {
        res.status(500).json({code: 500, error})
    })

});