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
    if (e.key == "Backspace")
    {
        backspace();
        e.preventDefault();
    }
    else if (e.key == "Enter")
    {
        breakLine();
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

function backspace()
{
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parent = container.parentElement;

    if (container.nodeName == "#text")
    {
        let startOffset = range.startOffset, endOffset = range.endOffset;

        if (startOffset == endOffset) startOffset -= 1;

        const endString = parent.innerText.substring(endOffset);
        parent.innerText = parent.innerText.substring(0, startOffset);
        const start = parent.innerText.length;

        if (endString > 0) parent.innerText += endString;

        if (parent.innerHTML.length == 0) parent.innerHTML = "<br />";
        else
        {
            range.setStart(parent.childNodes[0], startOffset);
            range.collapse(true);
        }
    }
    else if (container != editorContent)
    {
        if (container.parentElement.tagName == "UL" && container.parentElement.childNodes.length == 1) editorContent.removeChild(container.parentElement);
        else container.parentElement.removeChild(container);
    }
    else
    {
        if (range.startOffset != range.endOffset) range.extractContents();
        else if (range.startOffset != 0)
        {
            const element = editorContent.childNodes[range.startOffset - 1];
            
            switch (element.tagName)
            {
                case "IMG": case "UL": editorContent.removeChild(element); break;
                default:
                    if (element.childNodes[0].tagName == "BR") editorContent.removeChild(element);
                    else
                    {
                        element.innerText = element.innerText.substring(0, element.innerText.length - 1);

                        if (element.innerText.length == 0) editorContent.removeChild(element);
                    }
                    break;
            }
        }
    }
}
function breakLine()
{
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parent = container.parentElement;
    let add = document.createElement("p");
    add.innerHTML = "<br />";

    if (container.nodeName == "#text")
    {
        if (range.startOffset == 0 && range.endOffset == 0)
        {
            if (parent.tagName != "LI") editorContent.insertBefore(add, parent);
            else
            {
                add = document.createElement("li");
                add.innerHTML = "<br />";

                parent.parentElement.insertBefore(add, parent);
            }
        }
        else if (range.startOffset == container.length && range.endOffset == container.length)
        {
            if (parent.tagName == "LI")
            {
                add = document.createElement("li");
                add.innerHTML = "<br />";

                parent.parentElement.insertBefore(add, parent.nextElementSibling);
            }
            else editorContent.insertBefore(add, parent.nextSibling);

            range.setStart(add, 0);
        }
        else
        {
            add = document.createElement(parent.tagName);
            add.innerHTML = parent.innerHTML.substring(range.endOffset);
            parent.innerHTML = parent.innerHTML.substring(0, range.startOffset);

            editorContent.insertBefore(add, parent.nextSibling);
            range.setStart(add, 0);
        }
    }
    else
    {
        if (container.tagName == "LI")
        {
            parent.removeChild(container);
            editorContent.insertBefore(add, parent.nextElementSibling);
            range.setStart(add, 0);
        }
        else insert(add);
    }
}
function insert(element, incorporateSelection = false)
{
    editorContent.focus();

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    if (selection.baseOffset == selection.extentOffset)
    {
        if (element.tagName == "IMG")
        {
            if (range.commonAncestorContainer.nodeName == "DIV") range.insertNode(element);
            else
            {
                let parent = range.commonAncestorContainer;
                
                if (parent.nodeName == "#text") parent = parent.parentElement;
                
                const endText = document.createElement(parent.tagName);
                endText.innerHTML = parent.innerHTML.substring(range.endOffset);
                parent.innerHTML = parent.innerHTML.substring(0, range.startOffset);

                editorContent.insertBefore(element, parent.nextSibling);

                if (endText.innerHTML.length > 0) editorContent.insertBefore(endText, element.nextSibling);
            }
        }
        else
        {
            if (element.innerHTML.length == 0) element.innerHTML = "<br />";

            range.insertNode(element);
        }
        
        range.setStartAfter(element);
        range.setEndAfter(element);
    }
    else
    {
        if (incorporateSelection)
        {
            if (element.tagName == "UL") { }
            else { }
        }
        else { }
    }
}

editorTools.style.top = `${document.querySelector("header").clientHeight}px`;