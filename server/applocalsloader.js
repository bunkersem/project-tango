const config = require('./config.json');

module.exports = function(app) {
    app.locals.catagories = config.resources.article.catagories;
    app.locals.compileDebug = false;
    app.locals.facebook = config.contact.facebook;
    app.locals.twitter = config.contact.twitter;
    app.locals.twitterName = config.contact.twitterName;
    app.locals.kvk = config.payment.kvk;
    app.locals.btw = config.payment.btw;
    app.locals.contact = {};
    app.locals.contact.email = config.contact.email;
    app.locals.contact.tel = config.contact.tel;
    app.locals.description = config.resources.description;
    app.locals.keywords = config.resources.keywords;
}