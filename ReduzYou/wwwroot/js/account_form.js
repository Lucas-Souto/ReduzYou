const warningSign = document.getElementById("sign-warning");
const validUser = /^[a-zA-Z0-9-_]+$/, validPass = /^[a-zA-Z0-9-_!?]+$/;;

document.getElementById("sign-form").addEventListener("submit", (e) =>
{
    e.preventDefault();

    const form = new FormData(e.target);
    const username = form.get("username"), password = form.get("password");
    warningSign.innerHTML = "";

    if (username.length < 3) warningSign.innerHTML += "O nome de usuário deve conter pelo menos três caracteres!<br />";
    else if (!validUser.test(username)) warningSign.innerHTML += "O nome de usuário só pode conter letras, números, \"-\" e \"_\".<br />";

    if (password.length < 7) warningSign.innerHTML += "A senha deve conter pelo menos sete caracteres!";
    else if (!validPass.test(password)) warningSign.innerHTML += "A senha só pode conter letras, números, \"-\", \"_\", \"!\" e \"?\".";

    if (warningSign.innerHTML.length == 0)
    {
        request("api/create_account", "post", form, false, (request) =>
        {
            switch (request.responseText)
            {
                case '0': warningSign.innerHTML = "Este nome de usuário já foi pego!"; break;
                case '1': location.reload(); break;
                case '2': warningSign.innerHTML = "Nome ou senha inválidos!"; break;
            }
        });
    }
});