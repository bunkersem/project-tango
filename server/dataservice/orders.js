var models = require('../models')
var db = require('../repository/database');


exports.addOrder = addOrder;
function addOrder(order){
    return db.query(
    `INSERT INTO orders(article_ids, created, user_id, 
        fname, mname, lname, business_name, tel, email, street_name, 
        place_residence, province, postal_code, street_num, country, remarks, 
        btw, delivery, article_costs, total, code)
        
    VALUES(
        $1::INTEGER[], -- article_ids
        $2::BIGINT, -- created
        $3::INTEGER, -- user_id
        $4::VARCHAR, -- fname
        $5::VARCHAR, -- mname
        $6::VARCHAR, -- lname
        $7::VARCHAR, -- business_name
        $8::VARCHAR, -- tel
        $9::VARCHAR, -- email
        $10::VARCHAR, -- street_name
        $11::VARCHAR, -- place_residence
        $12::VARCHAR, -- province
        $13::VARCHAR, -- postal_code
        $14::VARCHAR, -- street_num
        $15::VARCHAR, -- country
        $16::TEXT, -- remarks
        $17::DECIMAL, -- btw
        $18::DECIMAL, -- delivery
        $19::DECIMAL, -- article_costs
        $20::DECIMAL, -- total
        left(md5(currval('orders_id_seq')::text),8) -- code
    )
    RETURNING id, code;`, 
    [
        order.articleIds,
        order.created,
        order.userId,
        order.fName,
        order.mName,
        order.lName,
        order.businessName,
        order.tel,
        order.email,
        order.streetName,
        order.placeOfResidence,
        order.province,
        order.postalCode,
        order.streetNumber,
        order.country,
        order.remarks,
        order.btw,
        order.delivery,
        order.articleCosts,
        order.total
    ]);
}


exports.getOrders = function getOrders(userId) {
    return promiseOrder(db.query(
        `SELECT * FROM orders
        WHERE user_id = $1::INTEGER`,
        [userId]
    ));
}

exports.getAllOrders = function getAllOrders(limit) {
    limit = limit || 10
    return promiseOrder(db.query(
        `SELECT * FROM orders LIMIT $1::INTEGER`,
        [limit]
    ));
}


function promiseOrder(dbOrderPromise){
    return new Promise((res, rej) => {
        dbOrderPromise
        .then(result => {
            if (result.length > 0) {
                return res(result.map(x => new models.Order(x.id, x.article_ids, x.created, x.user_id, x.fname, x.mname, x.lname, x.business_name, 
                x.tel, x.email, x.street_name, x.place_residence, x.province, x.postal_code, x.street_num, x.country, x.remarks, 
                x.btw, x.delivery, x.article_costs, x.total, x.code)));
            }
            else {
                return res(undefined) // Return empty array.
            }
        })
        .catch(err => {
            return rej(err);
        })
    })
}