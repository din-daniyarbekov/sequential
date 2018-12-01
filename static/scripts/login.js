const taskForm = document.querySelector('.form-signin');

taskForm.addEventListener('submit', passwordCheck)

function passwordCheck(e){
    e.preventDefault(); 

    const email = document.querySelector('#exampleInputEmail').value;
    const password = document.querySelector('#exampleInputPassword').value;


    if(email === "user@mail.com"){
        if(password == "12345"){
            window.location = '../static/user_view.html';
        } else{
            window.alert("Invalid Login Credentials");
        }
    } else if(email === "admin@mail.com"){
        if(password == "6789"){
            window.location = '../static/admin_view.html';

        } else{
            window.alert("Invalid Login Credentials");
        }
    } else{
        window.alert("Invalid Login Credentials");
    }


}