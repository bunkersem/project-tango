const accountsDataservice = require('./dataservice/accounts');
const ordersDataservice = require('./dataservice/orders');
const models = require('./models');
const User = models.User;
const ProviderUser = models.ProviderUser;
const query = require('./repository/database').query;

module.exports = function runTests(){

    try {

    // Test Add User
    query(`DELETE FROM google_users WHERE email='myfakeemaillkdfsklaasdklf'`).catch(err => {
        throw Error(JSON.stringify(err, null, 2));
    })
    accountsDataservice.addUser(
        'google',
        new ProviderUser( 424242, 'token', 'myfakeemaillkdfsklaasdklf', 'name')
    ).then(user => {
        var insertedUserId = user.id;
        query(`DELETE FROM users WHERE id=$1::INTEGER`, [insertedUserId]).catch(err => {
            throw Error(JSON.stringify(err, null, 2));
        })
    })
    .catch(error => {
        throw Error(JSON.stringify(err, null, 2));
    })

    // Run Order test.
    query('DELETE FROM orders WHERE tel = \'impossible tel numer\'');
    ordersDataservice.addOrder(new models.Order(null, [20,10,42], 1404242, 42, 'fname', 'mname', 'lname', 
    'businessName', 'impossible tel numer', 'fake@fakemail.com', 'steetname', 'faketown', 
    'fakestate', '9821FK', '42', 'NL', 
    'My super interesting remarks this should also work if this is null',
    42.42, 242.42, 4242.42, 24242.42))
    .then(res => {
        console.log('it worked!!',  res);
    }).catch(err => {
        throw Error(JSON.stringify(err, null, 2));
    })

    query('SELECT $1::text as message', ['PostgreSQL works!'])
    .then(res => {
        console.log(res[0].message)
    })
    .catch(err => {
        console.error('postgreSQL not working :(');
        console.error(JSON.stringify(err, null, 2));
    });

    ordersDataservice.getAllOrders(100)
    .then(res => {
        console.log('ordersDataservice.getAllOrders() is working.');
    })
    .catch(err => {
        console.error('ordersDataservice.getAllOrders() is failing!');
        throw JSON.stringify(err, null, 2);
    });

    // CsvOrders Tests:
    require('./admin').getCsvOrders()
    .then(result => {
        console.log('admin.getCsvOrders() is working with 0 parameters.');
    })
    .catch(err => {
        console.error('admin.getCsvOrders() is failing! with 0 parameters.');
        throw JSON.stringify(err, null, 2);
    })

    require('./admin').getCsvOrders(100)
    .then(result => {
        console.log('admin.getCsvOrders() is working with 1 parameter.');
    })
    .catch(err => {
        console.error('admin.getCsvOrders() is failing! with 1 parameter.');
        throw JSON.stringify(err, null, 2);
    })

    } catch (error) {
        throw error;
    }



}
