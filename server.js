const {createPool} = require('mysql2')
const pool = createPool({
    host: 'localhost',
    port: 3306,
    database: 'RACING',
    user: 'root',
    password: 'uf]hgohgr'
})


pool.query('select * from horse',(err,res)=>{
    if(err) throw err;
    console.log(res);
}
)



