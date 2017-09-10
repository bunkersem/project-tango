// Will be called by articlesReadyHandler() in articles.js when on the article page.
function fillSingleSkeletonArticle() {

    var articleId = parseInt(getParameterByName('id'));
    var article = window.locals.articles.filter(x => x.id === articleId)[0]
    if (article === undefined) {
        alert('Sorry dit product bestaat niet.');
        return;
    }
    var $articleElem = $('#article');
    $articleElem.find('#article-catagory').text(article.catagory);
    $articleElem.find('#article-title').text(article.title);
    $articleElem.find('#article-created').text(new Date(parseInt(article.created)).toLocaleDateString())
    $articleElem.find('#article-id').html(article.id);
    $articleElem.find('#article-description').text(article.description);
    $articleElem.find('#article-stock').text(article.stock);
    $articleElem.find('#article-price').text(article.price);

    if (article.image !== undefined && article.image !== null) {
        function setImage() {
            $articleElem.find('#article-image').css('background-image', `url(${article.image.imageUrl})`)
        }
        // If the main image (thumbnail) is loaded:
        if (article.image.imageLoaded === true) {
            setImage();
        }
        // Else wait for the image to load.
        // imageLoaded() will be called when the image is ready to display.
        // It will be called when the firebase download URL has been retrieved.
        else {
            article.image.imageLoaded = function(){
                setImage();
            }
        }
    }

}

// em#article-catagory
// h1#article-title
// small#article-created
// #article-id.hidden
// p#article-description

// If we are on the articles page.
if ($('#article').length > 0) {
    window.addArticleToBasket = function(event){
        var amount = parseInt($('#article #amount').val() || 0);
        var id = parseInt($('#article #article-id').html());
        
        var article = window.locals.articles.filter(function(x){ return x.id == id })[0];
        window.locals.basket.addArticle(article.id, amount);

        $('#articleWillOrder #message').text(`${article.title} is toegevoegd aan het winkel wagentje.`);
        $('#articleWillOrder').modal('show');
    }
}

window.locals = window.locals || {};
window.locals.basket = {
    getArticles: function(){
        return window.sessionStorage.getItem('basket') 
        && JSON.parse(window.sessionStorage.getItem('basket'));
    },
    addArticle: function(id, amount){
        var currentArticles = window.locals.basket.getArticles() || {};
        currentArticles[id] = currentArticles[id] || {id:id, amount:0};
        currentArticles[id].amount += amount;
        window.sessionStorage.setItem('basket', JSON.stringify(currentArticles));
    },
    removeArticle: function(id){
        var currentArticles = window.locals.basket.getArticles() || {};
        delete currentArticles[id];
        window.sessionStorage.setItem('basket', JSON.stringify(currentArticles));
    },
    setAmount: function(id, amount){
        var currentArticles = window.locals.basket.getArticles() || {};
        if(currentArticles[id]){
            currentArticles[id].amount = amount;
            window.sessionStorage.setItem('basket', JSON.stringify(currentArticles));
        } 
        else {
            console.error('could not find article with id: ', id)
        }
    }
}