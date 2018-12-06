const userSettingsForm = document.querySelector('#accountEdit');
userSettingsForm.addEventListener('submit', accountEdit);

const validateEmail = (email) => {
    const expression = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;

    return expression.test(String(email).toLowerCase())
}

function accountEdit(e){
    e.preventDefault();

    const email = document.querySelector('#exampleInputEmail').value;
    const newPassword = document.querySelector('#newPassword').value;
    const repeatPassword = document.querySelector('#repeatPassword').value;

    if(validateEmail(email)){
        if(newPassword.length > 5 && repeatPassword.length > 5 && newPassword === repeatPassword){
                const accountUpdateRequestBody = {
                    password: newPassword,
                    email: email
                }
                const accountUpdateRequest = new Request('/change_account_details', {
                    method: 'PATCH',
                    body: accountUpdateRequestBody,
                    headers: constantHeaders,
                });
                fetch(accountUpdateRequest).then((res) => {
                    if(res.status === 200){
                        alert("Account updated!");
                    }else{
                        throw new Error(res.json());
                    }
                }).catch((e) => {
                    alert("Error updating account!");
                })
        }else{
            alert("Passwords are either too short or not matching")
        }
    }else{
        alert("Email cannot be invalid");
    }
}