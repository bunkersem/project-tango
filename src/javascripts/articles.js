window.locals = window.locals || {};
refreshArticles();
function refreshArticles(){

    window.locals.skeletonFilled = false;
    if (window.sessionStorage.getItem('articles'))
        articlesLoaded(JSON.parse(window.sessionStorage.getItem('articles')));
    else
        $.getJSON('/articles', articlesLoaded);
    function articlesLoaded (articles) {
        if (!window.sessionStorage.getItem('articles'))
            window.sessionStorage.setItem('articles', JSON.stringify(articles));
        articles = articles || [];
        // Loop through all articles.
        articles.forEach(function(article) {
            // Process main image if exists
            if (article.image && article.image.imageName)
            {
                imagesRef.child(article.image.imageName).getDownloadURL()
                .then(function(result){
                    console.log('done');
                    article.image.imageUrl = result;
                    article.image.imageLoaded && article.image.imageLoaded();
                    article.image.imageLoaded = true;
                })
                .catch(function(error){
                    console.error(error);
                })
            }
            // Loop through all images of an article
            article.images.forEach(function(image){
                imagesRef.child(image.imageName).getDownloadURL()
                .then(function(result){
                    console.log('done');
                    image.imageUrl = result;
                    image.imageLoaded && image.imageLoaded();
                    image.imageLoaded = true;
                })
                .catch(function(error){
                    console.error(error)
                })
            })
        })
        if (window.locals.articlesReady !== undefined) {
            window.locals.articlesReady.forEach(x => {
                x();
            });
        }
        
        window.locals.articles = articles;
        if (testArticlesReady())
            articlesReadyHandler();
    }
}

$(function(){
    if (testArticlesReady())
        articlesReadyHandler();
})

function testArticlesReady (){
    if ($('.article-container').length > 0 || $('#article').length > 0) {
        if (window.locals.articles === undefined || window.locals.skeletonFilled === true)
            return false;
        // Else
        window.locals.skeletonFilled = true;
        return true;
    }
}

function articlesReadyHandler(){
    if ($('.article-container').length > 0) {
        fillSkeletonArticles();
    }
    else if ($('#article').length > 0) {
        // Resides in article.js
        fillSingleSkeletonArticle();
    }
}

function getURLFromFirebaseImage(imageName, callback) {
    imagesRef.child(imageName).getDownloadURL()
    .then(function(result){
        callback(undefined, result)
    })
    .catch(function(error){
        callback(error)
    })
}



// Article offset is used when trying to display for example, the second page of articles. You want to offset the result, so to not display the same content twice.
function fillSkeletonArticles (){
    // Only fill skeleton articles if the page is loaded and if we have the data.
    
    // Find description dropdown. (for when a user hovers over an article, it will show the description)
    var $dropdown = $('#articleDescriptionDropdown')

    function memberSort(member){
        return function(a, b){
            if(a[member] < b[member]) return 1;
            if(a[member] > b[member]) return -1;
            return 0;
        }
    }
     
    
    // This page will not render articles.
    $('.article-container').each(function(index, container){
        var sortBy = $(container).attr('sort-by') || 'title';
        var catagory = $(container).attr('catagory') || '*';
        var limit = parseInt($(container).attr('limit')) || 12;
        var search = $(container).attr('search') || '*';
        var offset = parseInt($(container).attr('offset')) || 0;
        var searchRegex;
        if (search === '*')
            searchRegex = new RegExp(".*", 'i');
        else
            searchRegex = new RegExp(`.*${search}.*`);

        // New array with same objects being referenced:
        var articles = window.locals.articles.slice();
        if (catagory !== "*"){
            // Filter by catagory string
            articles = articles.filter(function(article){
                return article.catagory === catagory;
            });
        }
        
        // Filter by search string
        articles = articles.filter(function(article){
            return searchRegex.test(article.title);
        });
        // Limit
        articles = articles.slice(offset, offset + limit);

        // Sort
        articles.sort(memberSort(sortBy || 'title'));

        // Check if there are any articles else stop.
        if (articles.length < 1) {
            $('.article-container').prepend($(`
                <p class="lead ml-2">
                    <strong>Oops</strong> niets gevonden.
                </p>
            `));
            return;
        }

        $(container).find('.article').each(function(index, articleElem){
            if (articles[index + offset] === undefined) {
                return;
            } // Else
            $(articleElem).find('.article-title').text(articles[index + offset].title)
            // Use this selector in case an article listing item does include a description of the article.
            $(articleElem).find('.article-description').text(articles[index + offset].description) 
            $(articleElem).find('.article-id').html(articles[index + offset].id)
            $(articleElem).find('.article-more').attr('href', '/articles/article?id=' + articles[index + offset].id)


            // If this article has an image. Try to display it, or display it when the picture is available.
            if (articles[index + offset].image !== undefined && articles[index + offset].image !== null) {
                function setImage() {
                    $(articleElem).find('.article-image').css('background-image', `url(${articles[index].image.imageUrl})`)
                }
                // If the main image (thumbnail) is loaded:
                if (articles[index + offset].image.imageLoaded === true) {
                    setImage();
                }
                // Else wait for the image to load.
                // imageLoaded() will be called when the image is ready to display.
                // It will be called when the firebase download URL has been retrieved.
                else {
                    articles[index + offset].image.imageLoaded = function(){
                        setImage();
                    }
                }
            }
            // Diplay article
            $(articleElem).css('visibility', 'visible');
            $(articleElem).on('mouseenter', function(){

                //Dropdown
                var pos = $(articleElem).offset();
                var height = $(articleElem).outerHeight(true);
                $dropdown.css({ left:pos.left, top: pos.top + height });
                $dropdown.text(articles[index + offset].description);
                $dropdown.show();
            })
            $(articleElem).on('mouseleave', function(){
                $dropdown.hide(100);
            })
            

            
        })
    })
}