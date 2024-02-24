const accountForm = document.getElementById("account-form"),
    accountWarning = document.getElementById("account-warning"),
    accountFormTitle = document.getElementById("account-form-title"), accountReverse = document.getElementById("account-reverse"),
    accountFormCancel = document.getElementById("account-cancel");
const log = document.getElementById("log"), sign = document.getElementById("sign");
const validUser = /^[a-zA-Z0-9-_]+$/, validPass = /^[a-zA-Z0-9-_!?]+$/;
const signTitle = "Cadastrar", logTitle = "Entrar";

accountForm.addEventListener("submit", (e) =>
{
    e.preventDefault();

    const formData = new FormData(accountForm);
    const username = formData.get("username"), password = formData.get("password");
    accountWarning.innerHTML = "";

    if (username.length < 3) accountWarning.innerHTML += "O nome de usuário deve conter pelo menos três caracteres!<br />";
    else if (!validUser.test(username)) accountWarning.innerHTML += "O nome de usuário só pode conter letras, números, \"-\" e \"_\".<br />";

    if (password.length < 7) accountWarning.innerHTML += "A senha deve conter pelo menos sete caracteres!";
    else if (!validPass.test(password)) accountWarning.innerHTML += "A senha só pode conter letras, números, \"-\", \"_\", \"!\" e \"?\".";

    if (accountWarning.innerHTML.length == 0) request(accountForm.getAttribute("action"), accountForm.getAttribute("method"), formData, false, (request) =>
    {
        switch (request.responseText.toLowerCase())
        {
            case '0': accountWarning.innerHTML = "Este nome de usuário já foi pego!"; break;
            case '1': case 'true': location.reload(); break;
            case '2': accountWarning.innerHTML = "Nome ou senha inválidos!"; break;
            case 'false': accountWarning.innerHTML = "Nome de usuário ou senha incorretos!"; break;
        }
    }, (request) => accountWarning.innerHTML = `Ocorreu um erro (${request.status}).`);

    if (accountWarning.innerHTML.length == 0) accountWarning.setAttribute("hidden", true);
    else accountWarning.removeAttribute("hidden");
});

window.addEventListener("click", (e) =>
{
    if ((accountForm.classList.contains("show") && !accountForm.contains(e.target)) || accountFormCancel.contains(e.target))
    {
        accountForm.classList.remove("show");

        if (accountFormCancel.contains(e.target)) accountWarning.setAttribute("hidden", true);
    }
    else if (log.contains(e.target) || (accountReverse.contains(e.target) && accountFormTitle.innerText == signTitle))
    {
        accountForm.setAttribute("action", "api/enter_account");
        accountForm.classList.add("show");
        
        accountFormTitle.innerText = logTitle;
        accountReverse.innerText = "Não tem uma conta?";
    }
    else if (sign.contains(e.target) || (accountReverse.contains(e.target) && accountFormTitle.innerText == logTitle))
    {
        accountForm.setAttribute("action", "api/create_account");
        accountForm.classList.add("show");

        accountFormTitle.innerText = signTitle;
        accountReverse.innerText = "Já tem uma conta?";
    }
});