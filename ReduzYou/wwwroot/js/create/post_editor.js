const maxLength = 65535;
const editorContent = document.getElementById("editor-content"), counter = document.getElementById("counter");
const editorTools = document.getElementById("editor-tools");

function updateCounter()
{
    if (editorContent.innerHTML.length <= maxLength) counter.innerHTML = `${editorContent.innerHTML.length}/${maxLength}`;
    else counter.innerHTML = `<span style="color: var(--main2)">${editorContent.innerHTML.length}</span>/${maxLength}`;
}

updateCounter();
editorContent.addEventListener("input", updateCounter);
editorContent.addEventListener("keydown", (e) =>
{
    if (e.key == "Enter")
    {
        e.preventDefault();
    }
    else if (e.key.length == 1 && !e.ctrlKey)
    {
        if (editorContent.innerHTML.length == 0)
        {
            e.preventDefault();

            editorContent.innerHTML = `<p>${e.key}</p>`;
        }
    }
});

const allTools = document.querySelectorAll(".tool");

for (let i = 0; i < allTools.length; i++) allTools[i].addEventListener("click", (e) => toolClick(e.target.id));

function toolClick(id)
{
    const selection = document.getSelection();

    switch (id)
    {
        case "ttitle":

            break;
        case "tbold":

            break;
        case "titalic":

            break;
        case "tlist":

            break;
        case "tlink":

            break;
        case "timage":

            break;
    }
}

editorTools.style.top = `${document.querySelector("header").clientHeight}px`;