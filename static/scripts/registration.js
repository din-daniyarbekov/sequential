const taskForm = document.querySelector('#formSignIn');

taskForm.addEventListener('submit', registration)

function registration(e){
    e.preventDefault(); 


    const name = document.querySelector('#exampleInputName').value;
    const email = document.querySelector('#exampleInputEmail').value;
    const password = document.querySelector('#exampleInputPassword').value;
    const repeatPassword = document.querySelector('#repeatPasswordPassword').value;

    if (name) {
        if (email){
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
                                sessionStorage.setItem("token", res.tokens[1])   
                                // if(isAdmin){
                                //     window.location = '../admin_view.html';
                                // } else {
                                //     window.location = '../user_view.html';
                                // }
                            } else {
                                window.alert(res.status, res.body)
                                window.alert('There was an error when attempting to create your account')
                            }
                            console.log(res)
                        }).catch((error) => {
                            console.log(error)
                        })
                    } else {
                        window.alert('Password entries do not match')
                    }
                } else {
                    window.alert ('Passwords must contain at least 5 characters')
                }
            } else {
                window.alert ('A password must be entered')
            }
        } else {
            window.alert ('Email cannot be left out')
        }
    } else {
        window.alert('User name cannot be left blank')
    }
}