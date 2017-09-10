const config = require('./config.json')



module.exports = new function(){
    this.Article = function Article (name, title, description, images, created, catagory, image, id, stock, price){
       
        this.name = name; // Used to look up images on the firebase database
        this.title = title;
        this.description = description;
        this.images = images;
        this.catagory = catagory;
        this.created = created;
        this.image = image;
        this.id = id;
        this.stock = stock;
        this.price = price;
    };
    const CoreUser = function CoreUser (id, name, paymentPostalCode, deliveryPostalCode, streetNumber, country, phoneNumber) {
        
        this.id = id;
        this.name = name,
        this.paymentPostalCode = paymentPostalCode,
        this.deliveryPostalCode = deliveryPostalCode,
        this.streetNumber = streetNumber,
        this.country = country,
        this.phoneNumber = phoneNumber
    };
    this.User = function (id, name, paymentPostalCode, deliveryPostalCode, streetNumber, country, phoneNumber,
        providerTableId, providerId, token, email, providername, providerUserName) {
        
        CoreUser.call(this, id, name, paymentPostalCode, deliveryPostalCode, streetNumber, country, phoneNumber)
        this.providerTableId = providerTableId;
        this.providerId = providerId;
        this.token = token;
        this.email = email;
        this.providername = providername;
        this.providerUserName = providerUserName
    };
    this.User.prototype = Object.create(CoreUser.prototype)
    this.ProviderUser = function ProviderUser (providerId, token, email, name, id) {
        
        this.providerId = providerId
        this.token = token;
        this.email = email;
        this.name = name;
        this.id = id;
    }
    this.Order = function Order(id, articleIds, created, userId, 
        fName, mName, lName, businessName, tel, email, streetName, 
        placeOfResidence, province, postalCode, streetNumber, 
        country, remarks, btw, delivery, articleCosts, total, code){

        this.id = id;
        this.articleIds = articleIds;
        this.created = created;
        this.userId = userId;
        this.fName = fName;
        this.mName = mName;
        this.lName = lName;
        this.businessName = businessName;
        this.tel = tel;
        this.email = email;
        this.streetName = streetName;
        this.placeOfResidence = placeOfResidence;
        this.province = province;
        this.postalCode = postalCode;
        this.streetNumber = streetNumber;
        this.country = country;
        this.remarks = remarks;
        this.btw = btw;
        this.delivery = delivery;
        this.articleCosts = articleCosts;
        this.total = total;
        this.code = code;
        
    }
};

function validateCatagory(catagory) {
    if (config.resouces.article.catagories.includes(catagory)){
        return catagory
    } else {
        if (process.env.NODE_ENV === 'PRODUCTION'){
            console.error(catagory + ' is not a valid catagory');
            return 'Overige'
        }
        else {
            throw Error(catagory + ' is not a valid catagory');
        }
    }
}

// Catagories

// Bordspel
// Kaartspel
// Baby speelgoed
// Educatief
// Creatief
// Overigen
// Lego
// Tech
// Playmobiel
// Puzzels (Volwassen)
// Puzzels (Kinderen)
// Onderdelen

