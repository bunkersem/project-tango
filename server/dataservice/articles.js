var models = require('../models')
var db = require('../repository/database');
module.exports = {
    addArticle,
    getArticleByName: (articleName) => getArticle('SELECT * FROM articles WHERE name = $1::VARCHAR', [articleName]),
    searchArticleByTitle: (title) => getArticle('SELECT * FROM articles WHERE name LIKE $1::VARCHAR', ['%' + title + '%']),
    searchArticleByDescription: (description) => getArticle('SELECT * FROM articles WHERE description LIKE $1::VARCHAR', ['%' + description + '%']),
    getAllArticles: () => getArticle('SELECT * FROM articles', []),
    updateArticle: (article) => db.query("UPDATE articles SET title = $2::VARCHAR, description = $3::VARCHAR, catagory = $4::VARCHAR WHERE id = $1::INTEGER", 
    [article.id, article.title, article.description, article.catagory]),
    deleteArticle: (article) => db.query("DELETE FROM articles WHERE name = $1::VARCHAR", [article.name])
    .then( db.query("DELETE FROM article_images WHERE article_name = $1::VARCHAR", [article.name])),
}

function getArticle (query, data) {
    return new Promise((res, rej) => {
        db.query(query, data)
        .then(result => {
            if (!result || result.length < 1)
                return res(null); // Return
            var count = 0;
            var articles = [];
            processRow();
            function processRow(){
                db.query('SELECT * FROM article_images WHERE article_name = $1::varchar', [result[count].name])
                .then(result2 => {
                    articles.push(new models.Article(
                        result[count].name,
                        result[count].title,
                        result[count].description,
                        result2.map(row => { return { imageName: row.image_name }}),
                        result[count].created,
                        result[count].catagory,
                        (result[count].image_name && { imageName: result[count].image_name }), //If exist include the image object.
                        result[count].id,
                        result[count].stock,
                        result[count].price
                    ));
                    if (++count < result.length)
                        processRow();
                    else {
                        return res(articles);
                    }
                })
                .catch(err => {
                    rej(err)
                })
            }
        })
        .catch(err => {
            rej(err)
        })
    })
}

function addImage(articleFilename, imageFilename) {
    return db.query('INSERT INTO article_images(article_name, image_name) values($1::varchar, $2::varchar)', [articleFilename, imageFilename]) 
}

function addArticle (article) {
    return new Promise((result, rej) => {
        db.query(
            `INSERT INTO articles(name, title, description, created, catagory, image_name, stock, price) 
            values($1::VARCHAR, $2::VARCHAR, $3::TEXT, $4::BIGINT, $5::VARCHAR, $6::VARCHAR, $7::INTEGER, $8::NUMERIC(12,2))`, 
            [article.name, article.title, article.description, article.created, article.catagory, article.image, article.stock, article.price]) 
        .then(res => {
            var count = 0;
            if (article.images)
                addAllImages();
            else // No images, so we are done
                return result();
            function addAllImages(){
                addImage(article.name, article.images[count++])
                .then(res => {
                    if (count < article.images.length)
                        addAllImages()
                    else // Done
                        return result();
                })
                .catch(err => {
                    console.error(err);
                    return rej({message: 'failed to save image data: ' + err, status: 500})
                })
            }
        })
        .catch(err => {
            console.error(err);
            return rej({message: 'failed to save article: ' + err, status: 500})
        })
    });
}

