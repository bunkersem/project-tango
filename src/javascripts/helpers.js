$('.content-switch').each(function(index, elem) {
    $(elem).find('.content-switch-btn').each(function(index, btn){
        $(btn).on('click', function(event){
            $(elem).find('.content-switch-btn').each(function(index, btn){
                var $target = $(`#${$(btn).attr('data-target')}`)
                $target.slideUp(200);
            });
            var $mainTarget = $(`#${$(btn).attr('data-target')}`);
            $mainTarget.slideDown(200);
        })
    });
});
$('.btn-load').on('click', function(event){
    $(event.target).button('loading');
    setTimeout(function() {
        $(event.target).button('reset');
    }, 120000);
});
try {
    if (("" + window.localStorage.getItem("sidebar-toggled")) !== "false"){
        $("#wrapper").addClass("toggled");
    } 
} catch (ex) { console.error(ex) }
$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
    if ($('#wrapper').hasClass("toggled")){
        window.localStorage.setItem("sidebar-toggled", true);
    } else {
        window.localStorage.setItem("sidebar-toggled", false);
    }
});

var $submitters = $('form[no-redirect]').find('[type="submit"]');
$submitters.attr('type', 'button');
$submitters.on('click', function(e){
    ajaxRequest(
        $(e).closest('form')
    );
})

function ajaxRequest($form){
    $.ajax({
        url: $form.attr('action'),
        data: $form.serialize(),
        processData: false,
        contentType: false,
        type: $form.attr('method'),
        success: function(data){
            alert(data);
        }
    });
}

$('input.integer').on('input', function(event){
    var $target = $(event.target).closest('input.integer');
    $target.val($target.val().split('').filter(function(x){return /[0-9]/.test(x)}).join('').slice(0,4));
})