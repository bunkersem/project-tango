const path = require('path')
const jimp = require('jimp')
const models = require('./models')
const fs = require('fs')

exports.createArticle = function createArticle(title, description, imageBuffer, rotation) {
    return new Promise((res, err) => {
        var newId
        var articles
        var newarticle
        getArticles()
            .then(result => {
                articles = result
                var highestId = articles.length > 0 
                    ? articles.maxInt(x => x.id)
                    : -1
                newId = highestId + 1
                if (imageBuffer) return createImageFile(imageBuffer, rotation, newId)
                else return
            })
            .then(imgLocation => {
                newarticle = new models.Article(newId, title, description, imgLocation, (new Date).getTime())
                articles.push(newarticle)
                return saveArticles(articles)
            })
            .then(() => {
                res(newarticle)
            })
            .catch(error => err(error))
    })
}

function getArticles() {
    return new Promise((res, err) => {
        fs.readFile(path.join(__dirname, 'public', 'resources', 'articles.json'), 'utf-8', function (err, data) {
            if (err) throw err
            var articles = []
            const articlesObject = JSON.parse(data)
            Object.keys(articlesObject).forEach(a => { articles.push(articlesObject[a]) })
            res(articles)
        })
    })
}


function saveArticles(articles) {
    return new Promise((res, err) => {
        fs.writeFile(
            path.join(__dirname, 'public', 'resources', 'articles.json'),
            process.env.DEBUG 
                ? JSON.stringify(articles, null, 2)
                : JSON.stringify(articles),
            function (error) {
                if (error) err(error)
                else res()
            }
        )
    })
}

function createImageFile(imageBuffer, rotation, id) {
    return new Promise((result, error) => {
        var fileName = ((new Date).getTime()).toString(36) + '.jpg'
        jimp.read(imageBuffer).then(image => {
            image
                .scaleToFit(512, 512, jimp.AUTO)
                .quality(90)
                .rotate(rotation)
                .write(path.join(__dirname, 'public', 'resources', fileName), function (){
                    //Done
                    result(fileName)
                })
        }).catch(readErr => {
            error(readErr)
        })
    })

}
