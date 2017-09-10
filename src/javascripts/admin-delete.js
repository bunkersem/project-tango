
$('.remove-article').on('click', function(event){
    event.stopPropagation();
    var $article = $(event.target).closest('.article');
    var id = parseInt( $article.children('.article-id').html() );
    var article = window.locals.articles.filter(function(art){return art.id === id})[0];

    console.log(article);
    if (!article) {
        alert("Cannot find the article with id: " + id);
        return;
    }

    removeImagesFromFireBase(article)
    .then(removeFromDatabase)
    .then(function(result){
         $article.remove();
    })
    .catch(function(error){
        alert(`Failed to remove article
        Aritcle Name: ${article.name}
        Aritcle Id: ${article.id}
        Aritcle Title: ${article.title}`);
        return;
    });
});

function removeImagesFromFireBase(article){
    return new Promise(function(res, rej){
        var count = article.images.length + (article.image ? 1 : 0);
        var error = false;
        // Delete main image
        if (article.image) {
            var mainImageDeletionTask = imagesRef.child(article.image.imageName).delete()
            .then(imageDeleteTaskDone)
            .catch(function(err){
                if (err.code !== "storage/object-not-found") // If it is a 404 ignore the error.
                {
                    error = true;
                    alert(`Unable to remove the main image:
                    ${article.image.imageName}
                    ${article.image.imageUrl}
                    Error Message: ${err.message}
                    Error Code: ${err.code}`);
                }
                imageDeleteTaskDone();
            });
        }
        // Delete article images
        article.images.forEach(function(image){
            var imageDeletionTask = imagesRef.child(image.imageName).delete()
            .then(imageDeleteTaskDone)
            .catch(function(err){
                
                if (err.code !== "storage/object-not-found") // If it is a 404 ignore the error.
                {
                    alert(`Unable to remove the main image:
                    ${image.imageName}
                    ${image.imageUrl}
                    Error Message: ${err.message}
                    Error Code: ${err.code}`);
                    error = true;
                }
                imageDeleteTaskDone();
            });
        });
        function imageDeleteTaskDone(){
            count--;
            if (count <= 0) {
                // Done
                if (error) return rej();
                else return res(article);
            }
        }
    })
}

function removeFromDatabase(article){
    return new Promise(function(res, rej){
        $.ajax({    
            type: 'POST',
            url: '/admin/delete',
            cache: false,
            processData: false,
            contentType: "application/json",
            data: JSON.stringify(article),
            success: res,
            error: rej
        });
    });
}