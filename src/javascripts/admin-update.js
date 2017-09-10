// Check if we are on the admin page,
// otherwise dont bother executing this script.
if ($('#article-edit-submit').length > 0) {

    $('#article-edit-submit').on('click', function(event){
        // Efect
        $('#article-edit-submit').button('loading')
        setTimeout(function() {
            $('#article-edit-submit').button('reset');
        }, 120000);
    });

    $('.article').on('click', function(event){
        var $article = $(event.target).closest('.article');
        var id = parseInt( $article.children('.article-id').html() );
        var article = window.locals.articles.filter(function(art){return art.id === id})[0];
        if (!article)
            return;
        window.locals.articleinedit = article;
        console.log(article);
        //clear alerts
        $('#admin-edit').find('.alert').remove();


        $('#article-edit-id').val(article.id);
        $('#article-edit-title').val(article.title);
        $('#article-edit-description').val(article.description);
        $('#article-edit-catagory').val(article.catagory);
        $('#article-edit-modal').modal('show');
    });
    $('#article-edit-submit').on('click', function(event){
        updateArticle(window.locals.articleinedit, function(error, request){
            $('#article-edit-submit').button('reset');
            $('#admin-edit').find('.alert').remove();
            refreshArticles();
            if (error){
                $('#admin-edit').prepend('<div class="alert alert-danger">Er is iets foutgegaan tijdens het updaten van dit artikel.</div>')
                return;
            }
            console.log(request);
            $('#admin-edit').prepend('<div class="alert alert-success">Artikel is geupdate.</div>')
        });
    });



    function updateArticle(article, callback){
        return new Promise(function(res, rej){
            var form = new FormData(document.getElementById('admin-edit-form'));
            $.ajax({    
                type: 'POST',
                url: '/admin/edit',
                cache: false,
                processData: false,
                contentType: false,
                data: form,
                success: function(request) {
                    callback(undefined, request); // Callback without error.
                },
                error: function(error) { 
                    callback(error); 
                }
            })
        })
    }
}