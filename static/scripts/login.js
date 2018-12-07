const taskForm = document.querySelector('#formSignIn');

taskForm.addEventListener('submit', passwordCheck)

function passwordCheck(e){
    e.preventDefault(); 

    const email = document.querySelector('#exampleInputEmail').value;
    const password = document.querySelector('#exampleInputPassword').value;

    if (email){
        if (password){
            if(password.length > 4){
                const data = {
                    email: email,
                    password: password,
                }
                const url = '/users/login'

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
                        window.alert('Error, incorrect log in information');
                        throw new Error();
                    }
                }).then(function(json){
                    sessionStorage.setItem("token", json.token);
                    if(json.isAdmin){
                        window.location = "/admin_view.html";
                    }else{
                        window.location = "/user_view.html";
                    }
                }).catch((error) => {
                    alert(error)
                })
            } else {
                window.alert('Passwords must contain at least 5 characters')
            }
        } else {
            window.alert ('A password must be entered')
        }
    } else {
        window.alert('User name cannot be left blank')
    }
}