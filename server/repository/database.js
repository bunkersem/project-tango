var pool;

module.exports = {
    query: function (query, data) {
        console.log('query:', query, data);
        return new Promise((res, rej) => {
            pool.query(query, data, function(err, result){
                if (err) 
                    return rej({name: err.name, message: err.message, stack: err.stack, status: 500})
                return res(result.rows)
            });
        });
    },
    intialize: function(pgPool) {
        pool = pgPool;
        pool.on('error', function(err,client){
            console.error('idle client error', err.message, err.stack);
        })
    }
}