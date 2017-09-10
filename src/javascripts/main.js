console.log("hello world")

//=include  'firebase.js'

//=include  'admin-delete.js'
//=include  'admin-update.js'
//=include  'admin-upload.js'
//=include  'article.js'
//=include  'articles.js'
//=include  'checkout.js'
//=include  'core.js'
//=include  'helpers.js'
//=include  'registration.js'

// Cookie Notice
if (!localStorage.getItem('cookieAgreed')) {
    $('#cookieNotice').show();
}

// Shopping cart update
(function(){
    var basket = sessionStorage.getItem('basket');
    
    if (!basket)
        return;
    
    
    basket = JSON.parse(basket);
    console.log(basket);
    if (Object.keys(basket).length)
        $('#shopCartAmount').html(Object.keys(basket).length)
})();

(function(){
    // Orders.
    // Check if we are on the orders page.
    

    if ($('.orderArticlesItem').length > 0) {
        var articlesJSON = sessionStorage.getItem('articles')
        if (!articlesJSON) return;
        var articles = JSON.parse(articlesJSON);
        if (!articles || !articles.length) return;
        var articleRoot = {};
        articles.forEach(x => articleRoot[x.id] = x);


        console.log(articleRoot);
        var _id;
        $('.orderArticlesItem').each(function(i, elem) {
            _id = parseInt( $(elem).attr('data-id') );
            $(elem).text(articleRoot[_id].title);
        })
    }
})();




function cookieNoticeAgreed(event){
    $('#cookieNotice').hide(200);
    localStorage.setItem('cookieAgreed', true)
}

function enableContactSubmitBtn() {
    $('#contactSubmit').attr('disabled', false);
}


