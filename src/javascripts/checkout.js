// Are we on the checkout Page?
if ($('#basket').length > 0){
    // We are on the checkout page.
    setTimeout(function() {
        var basketItems = window.locals.basket.getArticles();
        if (basketItems)
        {
            basketItems = Object.keys(basketItems).map(x => basketItems[x]);
            if (basketItems.length > 0){
                var $basket = $('#basket');
                basketItems.forEach(x => {
                    $basket.append(createElement(
                        window.locals.articles.filter(
                            function(article){
                                return article.id === x.id
                            }
                        )[0],
                        x.amount
                    ));
                });
            }
        }
        initFormElements();
        updateHiddenFormData();
        analyzePrice(); 
    }, 0);

    function createElement(article, amount) {
        setTimeout(function() {
            if (article.image.imageLoaded){
                $('#basketArticleImage_' + article.id).attr('style', `background-image: url(${article.imageUrl});` );
            }
            else {
                getURLFromFirebaseImage(article.image.imageName, function(error, result){
                    if (error) return;
                    $('#basketArticleImage_' + article.id).attr('style', `background-image: url(${result});`);
                })
            } 
        }, 0);
        
        

        return $(`<div id="basketArticle_${article.id}" class="well basketArticle">
            <button class="btn btn-danger btn-circle bucketRemoveButton" onclick="removeBucketArticle(${article.id})"><p>&times;</p></button>
            <a href="/articles/article?id=${article.id}">
            <div class="img articleCheckoutImage" id="basketArticleImage_${article.id}" style=""></div>
            </a>

            <div class="basePrice hidden">${article.price}</div>
            <div class="id hidden">${article.id}</div>

            <div class="info">
            <h3 class="title">${article.title}</h3>
            
            <p class="price"><small>Prijs: <span class="priceVal">${(article.price * amount).toFixed(2)}</span>€</small></p>
            <p class="amount"><small>Aantal: <input class="integer" value="${amount}" oninput="onAmountChange(event)" onchange="onAmountChange(event)"></input></small></p>
            </div>
            </div>`);

    }
    function removeBucketArticle(id) {
        id = parseInt(id);
        window.locals.basket.removeArticle(id);
        $(`#basketArticle_${id}`).remove();
        analyzePrice();
        updateHiddenFormData();
    }

    function updateHiddenFormData(){
        // I am not getting it from the basket object because i want the data in text form.
        $('#checkoutArticles').val(window.sessionStorage.getItem('basket') || '')
    }

    function onAmountChange(event){
        var $article = $(event.target).closest('.basketArticle');
        var id = parseInt($($article).find('.id').html());
        var basePrice = parseFloat($($article).find('.basePrice').html());
        var amount = parseInt($($article).find('.amount input').val());

        window.locals.basket.setAmount(id, amount);
        $($article).find('.priceVal').html((basePrice * amount).toFixed(2));
        analyzePrice();
        updateHiddenFormData();
    }

    function analyzePrice (){
        var sum = 0;
        $('.basketArticle .priceVal').each((i, elem) => {
            sum += parseFloat(elem.innerHTML);
        });

        if (sum > 0){
            $('#orderButton').removeAttr('disabled');
        } else {
            $('#orderButton').attr('disabled', '');
        }
        var btw = sum * 0.21
        // TODO :
        var delivery = 5.00;
        var totalPrice = sum + btw + delivery;


        $('#checkoutDeliveryCosts').html(delivery.toFixed(2));
        $('#checkoutArticlesPrice').html(sum.toFixed(2))
        $('#checkoutBtw').html(btw.toFixed(2));
        $('#checkoutTotal').html(totalPrice.toFixed(2));
    }

    function onCheckoutSubmit(event){
        var elements = $('#checkoutForm').get(0).elements
        for (var i = 0, formElem; formElem = elements[i]; i++) {
            formElem.value = localStorage.getItem(formElem.name) || formElem.value;
        }
    }

    function initFormElements(){
        var elements = $('#checkoutForm').get(0).elements
        for (var i = 0, formElem; formElem = elements[i]; i++) {
            (function(_formElem){
                var formElem = _formElem;
                formElem.value = localStorage.getItem(formElem.name) || formElem.value;
                formElem.onfocusout = function(event){
                    localStorage.setItem(formElem.name, formElem.value.trim());
                }
            })(formElem);
            
        }
    }
}

