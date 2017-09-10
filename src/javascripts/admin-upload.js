// Open Signin Window
$(function(){
    if ($('#upload-form').length) {
        $('#loginModal').modal({
            backdrop: 'static',
            keyboard: false
        }).modal('show');
    }
    
})
function AdminSignin(email, password){
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(){
        console.log('login succesfull');
        $('#admin-password').parent().removeClass('has-error');
        $('#admin-password').parent().children('.help-block').text('')
        $('#loginModal').modal('hide');
    })
    .catch(function(error) {
        // Handle Errors here.
        console.log('login failed');
        var errorCode = error.code;
        var errorMessage = error.message;
        $('#admin-password').parent().addClass('has-error');
        $('#admin-password').parent().children('.help-block').text('Inloggen niet gelukt.')
    });
}
function uploadArticle(event){
    var form = $('#upload-form').serializeArray();
    // Google Storage segement
    // TODO add window exit event listener end act accordingly.

    // Article Name
    var timeStamp = (new Date()).getTime();
    var folderName = form.filter(x => x.name === 'title')[0].value + '_' + timeStamp;

    //Prevent awkward situations.
    if ($('#article-main-image').get(0).files.length === 0){
        alert('Er is geen hoofd afbeelding geselecteerd');
        return false;
    }
    for(var i = 0; i < form.length; i++) {
        if (form[i].name === 'title' && form[i].value.length < 2){
            alert('De title is niet lang genoeg.')
            return false;
        }
        if (form[i].name === 'description' && form[i].value.length < 2){
            alert('De omschrijving is niet lang genoeg.')
            return false;
        }
        if (form[i].name === 'voorraad' && parseInt(form[i].value) < 0){
            alert('De voorraad kan niet kleiner zijn dan 0');
            return false;
        }
        if (form[i].name === 'prijs' && parseFloat(form[i].value) < 0){
            alert('De prijs kan niet kleiner zijn dan 0');
            return false;
        } 
    }

    var images = [];
    var mainImage;
    // Form append.
    form.push( {name:'name', value:folderName} );

    //Loading Effect
    $('#article-submit').button('loading')
    setTimeout(function() {
        $('#article-submit').button('reset');
    }, 120000);

    uploadImages(function(err, recover)
    {
        if (err){
            // Should already haver recovered.
            alert("Uploaden van afbeeldingen mislukt");
            $('#article-submit').button('reset');
            return;
        } // Else
        uploadToLocalServer(function(err){
            $('#article-submit').button('reset');
            if (err){
                recover();
                alert("Uploaden naar lokale server mislukt");
            }
            else {
                refreshArticles();
                alert("Het uploaden was succesvol");
            }
        })
    })
    function uploadToLocalServer(callback){
        form.push({name:'images', value: JSON.stringify(images)});
        form.push({name:'imageName', value: mainImage});

        $.ajax({    
            type: 'POST',
            url: '/admin/upload',
            data: form,
            success: function(request) {
                callback(undefined); // Callback without error.
            },
            error: function(error) { 
                callback(error); 
            }
        })
    }

    function uploadImages(callback)
    {

        // Images
        var ins = $('#article-images').get(0).files.length
        var imagesToUpload = ins + 1; // add 1 for the main image.
        var uploadTasks = [];

        // Upload main Image
        var mainImageFile = $('#article-main-image').get(0).files[0];
        mainImage = folderName + '/' + mainImageFile.name;
        var uploadMainImageTask = imagesRef.child(mainImage).put(mainImageFile)
        uploadMainImageTask.then(function(snapshot){
            if (--imagesToUpload <= 0) { // If Done
                return finish();
            }
            console.log('Uploaded a file')
        }).catch(function(err){
            uploadMainImageTask.cancel();
            console.error(err);
            return imageUploadError(err);
        })


        // Upload other images
        for(var i = 0; i < ins; i++)
        {
            var img = $('#article-images').get(0).files[i]
            var filePath = folderName + '/' + img.name;
            console.log(img);
            images.push(filePath);
            //From main.js/storage script.
            var uploadTask = imagesRef.child(filePath).put(img)
            uploadTasks.push(uploadTask);
            uploadTask.then(function(snapshot){
                if (--imagesToUpload <= 0) { // If Done
                    return finish();
                }
                console.log('Uploaded a file')
            }).catch(function(err){
                uploadTask.cancel();
                console.error(err);
                return imageUploadError(err);
            })
        }
        if (ins == 0)
            finish(); // No images where uploaded so finish immidiatelly.
        
        var recover = function(){
            
            var deleteMainTask = imagesRef.child(mainImage).delete();
            deleteMainTask.then(function(){return;}).catch(error)
            images.forEach(function(image) {
                var deleteTask = imagesRef.child(image).delete();
                deleteTask.then(function(){
                    return;
                }).catch(error)
            })
            function error (err){
                if (handleRecoveryError(deleteTask, error)){
                    // This error is unrecoverable.
                    alert(`Er is iets misgegaan\nHet noteren van de volgende errors zou heel fijn zijn.
                    Error Code: ${error.code}
                    Error message: ${error.message}
                    File Name: ${image}`);
                }
            }
        }

        function imageUploadError(err){
            uploadMainImageTask.cancel();
            uploadTasks.forEach(uploadTask => {
                uploadTask.cancel();
            })
            recover();   
            callback(err);           
        }
        // Failed to recover from error.
        function handleRecoveryError(task, error){
            switch(error.code){
                case "storage/object-not-found": //This might occur for the because the error occured before the file was added to the database. Just continue
                return false;
                
                default:
                return true;
            }
        }

        function finish(){
            console.log('Uploading Done');
            return callback(undefined, recover);
        }
    }
}