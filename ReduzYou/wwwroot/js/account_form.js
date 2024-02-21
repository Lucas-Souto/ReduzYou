const warningSign = document.getElementById("sign-warning");
const validUser = /^[a-zA-Z0-9-_]+$/, validPass = /^[a-zA-Z0-9-_!?]+$/;

function formSubmit(url, form, warning, success = empty_action)
{
    const formData = new FormData(form);
    const username = formData.get("username"), password = formData.get("password");
    warning.innerHTML = "";

    if (username.length < 3) warning.innerHTML += "O nome de usuário deve conter pelo menos três caracteres!<br />";
    else if (!validUser.test(username)) warning.innerHTML += "O nome de usuário só pode conter letras, números, \"-\" e \"_\".<br />";

    if (password.length < 7) warning.innerHTML += "A senha deve conter pelo menos sete caracteres!";
    else if (!validPass.test(password)) warning.innerHTML += "A senha só pode conter letras, números, \"-\", \"_\", \"!\" e \"?\".";

    if (warning.innerHTML.length == 0) request(url, "post", formData, false, success, (request) => warning.innerHTML = `Ocorreu um erro (${request.status}).`);
}

document.getElementById("sign-form").addEventListener("submit", (e) =>
{
    e.preventDefault();

    formSubmit("api/create_account", e.target, warningSign, (request) =>
    {
        switch (request.responseText)
        {
            case '0': warningSign.innerHTML = "Este nome de usuário já foi pego!"; break;
            case '1': location.reload(); break;
            case '2': warningSign.innerHTML = "Nome ou senha inválidos!"; break;
        }
    });
});