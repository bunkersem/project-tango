$(function(){
    // Page Tester
    if ($('#register-username').length <= 0){
        return;
    } //Else if we are on the registration page.
    var passwordValid = true;
    var usernameValid = true;
    var emailValid = true;

    function checkValidUsername(){
        passwordValid = true;
        // Length
        if ($('#register-username').val().length < 4){
            formElemInvalid('username', 'Gebruikersnaam moet minimaal 4 characters lang zijn');
            passwordValid = false;
        }
        if ($('#register-username').val().length > 20){
            formElemInvalid('username', 'Gebruikersnaam is te lang');
            passwordValid = false;
        }
        // Semantics
        var re = /[^A-Za-z0-9]/
        if (re.test($('#register-username').val())) {
            formElemInvalid('username', 'Gebruikersnaam mag alleen uit letters en cijfers bestaan.');
            passwordValid = false;
        }
        if (passwordValid) formElemValid('username');
        setFormState(usernameValid && emailValid && passwordValid);
    }
    function checkValidEmail(){
        emailValid = true;
        // Length
        if ($('#register-email').val().length < 4) {
            formElemInvalid('email', 'Email adres moet minimaal 4 characters lang zijn.');
            emailValid = false;
        }
        if ($('#register-email').val().length > 254) {
            formElemInvalid('email', 'Email adres is te lang.')
            emailValid = false;
        }
        // Semantics
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test($('#register-email').val())){
            formElemInvalid('email', 'Vul een geldig email adres in.');
            emailValid = false;
        }
        if (emailValid) formElemValid('email');
        setFormState(usernameValid && emailValid && passwordValid);
    }
    function checkValidPasswords(){
        passwordValid = true;
        //Password length
        if ($('#register-password').val().length < 8) {
            formElemInvalid('password', 'Wachtwoord moet minimaal 8 characters lang zijn.');
            passwordValid = false;
        }
        // Passwords equal
        if ($('#register-password').val() !== $('#register-reenterpassword').val()){
            formElemInvalid('password', 'Wachtwoorden komen niet overeen.');
            passwordValid = false;
        } 
        if (passwordValid) formElemValid('password');
        setFormState(usernameValid && emailValid && passwordValid);
    }

    
    
    $('#register-username').on('input', checkValidUsername)
    $('#register-email').on('input', checkValidEmail)
    $('#register-password').on('input', checkValidPasswords)
    $('#register-reenterpassword').on('input', checkValidPasswords)
    checkValidUsername();
    checkValidEmail();
    checkValidPasswords();

        function formElemValid(name){
        $(`#register-${name}-group`).removeClass('has-error');
        $(`#register-${name}-group`).addClass('has-success');
        $(`#register-${name}`).get(0).setCustomValidity('');
        $(`#register-${name}-group .help-block`).text('');
    }

    function formElemInvalid(name, message){
        $(`#register-${name}-group`).addClass('has-error');
        $(`#register-${name}-group`).removeClass('has-success');
        $(`#register-${name}`).get(0).setCustomValidity(message);
        $(`#register-${name}-group .help-block`).text(message);
    }

    function setFormState(valid) {
        if (valid){
            $('#register-submit').removeClass('btn-warning');
            $('#register-submit').removeClass('disabled');
            $('#register-submit').addClass('btn-success');
            $('#register-submit').removeAttr('disabled', '');
        }
        else {
            $('#register-submit').removeClass('btn-success')
            $('#register-submit').addClass('disabled')
            $('#register-submit').addClass('btn-warning')
            $('#register-submit').attr('disabled', '')
            
        }
    }
})