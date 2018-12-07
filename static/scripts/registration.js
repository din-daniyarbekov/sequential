const taskForm = document.querySelector('#formSignIn');

taskForm.addEventListener('submit', registration)


const validateEmail = (email) => {
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return expression.test(String(email).toLowerCase())
}

function registration(e){
    e.preventDefault(); 


    const name = document.querySelector('#exampleInputName').value;
    const email = document.querySelector('#exampleInputEmail').value;
    const password = document.querySelector('#exampleInputPassword').value;
    const repeatPassword = document.querySelector('#repeatPasswordPassword').value;

    if (name) {
        if (validateEmail(email)){
            if (password){
                if(password.length > 4){
                    if(password != repeatPassword){
                        window.alert("Password and repeated password don't match");
                    }
                    if(password == repeatPassword){
                        const isAdmin = (document.querySelector('#userTypeSelection').value === "admin") ? true : false;
                    
                        const url = "/registration";    

                        const data = {
                            name: name,
                            email: email,
                            password: password,
                            isAdmin: isAdmin
                        }
                        const request = new Request(url, {
                            method: 'post', 
                            body: JSON.stringify(data),
                            headers: {
                                'Accept': 'application/json, text/plain, */*',
                                'Content-Type': 'application/json'
                             },
                        });

                        fetch(request)
                        .then(function(res) {
                            
                            if (res.status === 200) {
                                return res.json();
                            } else {
                                window.alert(res.status, res.body)
                                window.alert('There was an error when attempting to create your account')
                            }
                        }).then(function(json){
                            sessionStorage.setItem("token",json.tokens[0].token);
                            if(isAdmin){
                                window.location = '/admin_view.html';
                            }else{
                                window.location = '/user_view.html';
                            }
                        }).catch((error) => {
                            console.log(error)
                        })
                    } 
               } else {
                    window.alert ('Passwords must contain at least 5 characters')
                }
            } else {
                window.alert ('A password must be entered')
            }
        } else {
            window.alert ('Email cannot be invalid')
        }
    } else {
        window.alert('User name cannot be left blank')
    }
}