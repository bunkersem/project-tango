var models = require('../models')
const User = models.User;
var db = require('../repository/database');
module.exports = {
    getUserViaProvider: function(loginProvider, providerId) {
        var specs = providerSpecs(loginProvider);
        return promiseUser(db.query(
            `
            WITH provider_user AS(
                SELECT ${specs.name}_id AS provider_id, user_id, id AS provider_table_id, token, email, name AS provider_user_name FROM ${specs.tableName} 
                WHERE ${specs.name}_id=$1::DECIMAL(64, 0)
                LIMIT 1
            )
            SELECT id, name, payment_postal_code, delivery_postal_code, street_number, country, phone_number, provider_table_id, token, email, provider_user_name, provider_id FROM users
            FULL OUTER JOIN provider_user 
            ON users.id=provider_user.user_id
            WHERE users.id=provider_user.user_id`,
            [providerId]
        ));
    },


    getUser: function (userId) {
        
        return promiseUser(db.query(
        `
        WITH provider_user AS(
            SELECT id AS provider_table_id, token, email, name AS provider_user_name, twitter_id AS provider_id, user_id, 'twitter' as provider_name FROM twitter_users 
            WHERE user_id=$1::INTEGER
            UNION ALL
            SELECT id AS provider_table_id, token, email, name AS provider_user_name, facebook_id AS provider_id, user_id, 'facebook' as provider_name FROM facebook_users 
            WHERE user_id=$1::INTEGER
            UNION ALL
            SELECT id AS provider_table_id, token, email, name AS provider_user_name, google_id AS provider_id, user_id, 'google' as provider_name FROM google_users 
            WHERE user_id=$1::INTEGER
            LIMIT 1
        )

        SELECT id, name, payment_postal_code, delivery_postal_code, street_number, country, phone_number, provider_table_id, token, email, provider_user_name, provider_id FROM users
        FULL OUTER JOIN provider_user 
        ON users.id=provider_user.user_id
        WHERE users.id=$1::INTEGER`, 
        [userId]));
    },
    addUser: function(loginProvider, providerUser) {
        var specs = providerSpecs(loginProvider);
        return promiseUser(db.query(
        `WITH user_ins AS (
        INSERT INTO users (name, payment_postal_code, delivery_postal_code, street_number, country, phone_number)
        VALUES(null, null, null, null, null, null)
        RETURNING id AS user_id)

        INSERT INTO ${specs.tableName}(${specs.name}_id, token, name, email, user_id) 
        SELECT $1::DECIMAL(64, 0), $2::VARCHAR, $3::VARCHAR, $4::VARCHAR, user_id FROM user_ins
        RETURNING *
        
        -- SELECT user_id FROM user_ins`, // Return this for evalation.
        [providerUser.providerId, providerUser.token, providerUser.name, providerUser.email]));
    },
    
}

function providerSpecs(loginProvider){
    switch(loginProvider.toLowerCase()) {
        case 'google':
        return {name: 'google', tableName: 'google_users'};
        
        case 'facebook':
        return {name: 'facebook', tableName: 'facebook_users'};

        case 'twitter':
        return {name: 'twitter', tableName: 'twitter_users'};

        default:
        throw Error("An invalid login provider");
    }
}

function promiseUser(dbUserPromise){
    return new Promise((res, rej) => {
        dbUserPromise
        .then(result => {
            if (result.length > 0) {
                result = result[0]; // Get the first user
                return res(new User(result.id, result.name, result.payment_postal_code, result.delivery_postal_code, result.street_number, result.country, result.phone_number,
                result.provider_table_id, result.provider_id, result.token, result.email, result.provider_name, result.provider_user_name));
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