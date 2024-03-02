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
        insert(document.createElement("p"));
        e.preventDefault();
    }
    else if (editorContent.innerHTML.length == 0 && e.key.length == 1 && !e.ctrlKey)
    {
        const p = document.createElement("p");
        p.innerText = e.key;

        insert(p);
        e.preventDefault();
    }
});

const allTools = document.querySelectorAll(".tool");

for (let i = 0; i < allTools.length; i++) allTools[i].addEventListener("click", (e) => toolClick(e.target.id));

function toolClick(id)
{
    switch (id)
    {
        case "ttitle": insert(document.createElement("h2"), true); break;
        case "tbold": insert(document.createElement("strong"), true); break;
        case "titalic": insert(document.createElement("em"), true); break;
        case "tlist":
            const list = document.createElement("ul");
            list.innerHTML = "<li><br /></li>"

            insert(list, true);
            break;
        case "timage":
            openSelector((link) =>
            {
                const img = document.createElement("img");

                img.setAttribute("src", link);
                insert(img);
            });
            break;
    }
}

function insert(element, incorporateSelection = false)
{
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    if (!editorContent.contains(selection.anchorNode)) return;

    // !! Corrigir ponto de inserção (está criando dentro dos elementos, ao invés de fora) !!
    // !! Posicionar cursor ao inserir elemento !!
    if (selection.baseOffset == selection.extentOffset)
    {
        if (element.tagName != "IMG" && element.innerHTML.length == 0) element.innerHTML = "<br />";

        range.insertNode(element);
    }
    else
    {
        if (incorporateSelection) { }
        else { }
    }

    selection.removeAllRanges();
}

editorTools.style.top = `${document.querySelector("header").clientHeight}px`;