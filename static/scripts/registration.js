const taskForm = document.querySelector('.form-signin');

taskForm.addEventListener('submit', registration)

function registration(e){
    e.preventDefault(); 

    const email = document.querySelector('#exampleInputEmail').value;
    const password = document.querySelector('#exampleInputPassword').value;
    const repeatPassword = document.querySelector('#repeatPasswordPassword').value;

    if(email == 'user@mail.com' || email == 'admin@mail.com' ){
        window.alert("This email is already in use");
    } 
    if(password != repeatPassword){
        window.alert("Password and repeated password don't match");
    }

    if(email != 'user@mail.com' && email != 'admin@mail.com' && password == repeatPassword){
        const userSelection = document.querySelector('.user-selection').value;
        if(userSelection == 'user'){
            window.location = '../user_view.html';

        } else {
            window.location = '../admin_view.html';

        }
    }
    


}