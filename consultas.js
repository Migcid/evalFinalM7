import pg from 'pg';
const { Pool } = pg;

import pgCursorPkg from 'pg-cursor';
const { Cursor } = pgCursorPkg;

const pool = new Pool({
    host: 'localhost',
    database: 'DB_EvalM7',
    user: 'postgres',
    password: '123456',
    port: 5432,
    max: 5,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 1000,
});

export const addPais = (nombre, continente, poblacion, pib_2019, pib_2020) => {
    
    return new Promise(async (resolve, reject) => {
        try {

            await pool.query('BEGIN');
        
            
            await pool.query(`
                INSERT INTO paises (nombre, continente, poblacion) VALUES($1, $2, $3)
            `, [nombre, continente, poblacion]);
        
            
            await pool.query(`
                INSERT INTO paises_pib (nombre, pib_2019, pib_2020) VALUES($1, $2, $3)
            `, [nombre, pib_2019, pib_2020]);

           
            let paisData = await pool.query("SELECT * FROM paises_data_web WHERE nombre_pais = $1", [nombre]);
            if(paisData.rows.length == 0){
            
                await pool.query(`
                    INSERT INTO paises_data_web (nombre_pais, accion) VALUES($1, $2)
                `, [nombre, 1]);
            }else {
                

                await pool.query(`
                    UPDATE paises_data_web SET accion = 1 WHERE nombre_pais = $1
                `, [nombre])
            }
    
        
           
            await pool.query('COMMIT')
            resolve("País agregado correctamente.")
            
           } catch (error) {
            await pool.query('ROLLBACK')
            reject("Error al ingresar el país.")
           }
    })
}


export const deletePais = (nombre) => {
    return new Promise(async (resolve, reject) => {
        try {

         
            await pool.query('BEGIN');

            
            let pais = await pool.query("SELECT * FROM paises WHERE nombre = $1", [nombre]);
            if(pais.rows.length == 0) throw new Error("No existe registrado el país: " + nombre);
        
           
            await pool.query(`
            DELETE FROM paises_pib WHERE nombre = $1
            `, [nombre]);

           
            await pool.query(`
                DELETE FROM paises WHERE nombre = $1
            `, [nombre]);
        

           

           
            let paisData = await pool.query("SELECT * FROM paises_data_web WHERE nombre_pais = $1", [nombre]);
            if(paisData.rows.length == 0){
              

                await pool.query(`
                INSERT INTO paises_data_web (nombre_pais, accion) VALUES($1, $2)
                `, [nombre, 0])
            }else{
                

                await pool.query(`
                    UPDATE paises_data_web SET accion = 0 WHERE nombre_pais = $1
                `, [nombre])
            }
        
            
            await pool.query('COMMIT')
            resolve("País eliminado correctamente.")
            
           } catch (error) {
            await pool.query('ROLLBACK')
            console.log(error)
            reject("error al eliminar el pais: "+nombre)
           }
    })
}


export const filtrarPaises = (limit, offset) => {
    console.log(limit, offset)
    return new Promise(async (resolve, reject) => {

        let query = `
            SELECT p.nombre, p.continente, p.poblacion, pp.pib_2019, pp.pib_2020 FROM paises p
            join paises_pib pp
            on p.nombre = pp.nombre
            limit ${limit} offset ${offset}
            `
            console.log(query)
        try {
            let paises = await pool.query(query)
            resolve(paises.rows)
            
           } catch (error) {
            reject("Error al filtrar los países")
           }
    })
}