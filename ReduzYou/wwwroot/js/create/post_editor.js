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

function removeEmpty()
{
    const elements = document.querySelectorAll("#editor-content > *:empty");

    for (let i = 0; i < elements.length; i++)
    {
        if (elements[i].tagName != "IMG") editorContent.removeChild(elements[i]);
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

    removeEmpty();
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
    let parent = range.commonAncestorContainer;

    if (parent.nodeName == "#text") parent = parent.parentElement;
    
    if (selection.baseOffset == selection.extentOffset)
    {
        switch (element.tagName)
        {
            case "IMG": case "UL":
                if (parent.nodeName == "DIV") range.insertNode(element);
                else
                {
                    const endText = document.createElement(parent.tagName);
                    endText.innerHTML = parent.innerHTML.substring(range.endOffset);
                    parent.innerHTML = parent.innerHTML.substring(0, range.startOffset);

                    editorContent.insertBefore(element, parent.nextSibling);

                    if (endText.innerHTML.length > 0) editorContent.insertBefore(endText, element.nextSibling);
                }
                break;
            case "P":
                if (element.innerHTML.length == 0) element.innerHTML = "<br />";

                range.insertNode(element);
                break;
            default:
                if (parent.nodeName == "DIV")
                {
                    element.innerHTML = "<br />";

                    if (element.tagName == "H2") range.insertNode(element);
                    else
                    {
                        const wrapper = document.createElement("p");

                        wrapper.appendChild(element);
                        range.insertNode(wrapper);

                        element = wrapper;
                    }
                }
                else if (element.tagName == "H2")
                {
                    element.innerText = parent.innerText;
                    
                    if (element.innerHTML.length == 0) element.innerHTML = "<br />";

                    editorContent.insertBefore(element, parent.nextSibling);
                    editorContent.removeChild(parent);
                }
                else
                {
                    const original = range.commonAncestorContainer;

                    element.appendChild(document.createTextNode(original.textContent));
                    parent.insertBefore(element, original);
                    parent.removeChild(original);
                }
                break;
        }
    }
    else
    {
        if (incorporateSelection)
        {
            const original = range.commonAncestorContainer;
            const content = range.cloneContents();
            let startText, endText;

            switch (element.tagName)
            {
                case "UL":

                    if (content.childNodes.length == 1)
                    {
                        startText = parent.innerHTML.substring(0, range.startOffset);
                        endText = parent.innerHTML.substring(range.endOffset);
                        element.childNodes[0].innerHTML = parent.innerHTML.substring(range.startOffset, range.endOffset);

                        original.textContent = startText = parent.innerHTML.substring(0, range.startOffset);
                        const endElement = document.createElement(parent.tagName);
                        endElement.innerHTML = endText;

                        editorContent.insertBefore(element, parent.nextSibling);
                        editorContent.insertBefore(endElement, element.nextSibling);
                    }
                    else
                    {
                        element.removeChild(element.childNodes[0]);
                        range.deleteContents();

                        let li;

                        for (let i = 0; i < content.childNodes.length; i++)
                        {
                            li = document.createElement("li");
                            li.innerHTML += content.childNodes[i].innerText;

                            element.appendChild(li);
                        }

                        editorContent.insertBefore(element, editorContent.childNodes[range.startOffset]);
                    }
                    break;
                case "H2":
                    if (content.childNodes.length == 1)
                    {
                        startText = parent.innerHTML.substring(0, range.startOffset);
                        endText = parent.innerHTML.substring(range.endOffset);
                        element.innerHTML = parent.innerHTML.substring(range.startOffset, range.endOffset);

                        original.textContent = startText = parent.innerHTML.substring(0, range.startOffset);
                        const endElement = document.createElement(parent.tagName);
                        endElement.innerHTML = endText;

                        editorContent.insertBefore(element, parent.nextSibling);
                        editorContent.insertBefore(endElement, element.nextSibling);
                    }
                    else
                    {
                        range.deleteContents();

                        for (let i = 0; i < content.childNodes.length; i++)
                        {
                            element.innerHTML += content.childNodes[i].innerText;

                            if (i != content.length - 1) element.innerHTML += "<br />";
                        }

                        editorContent.insertBefore(element, editorContent.childNodes[range.startOffset]);
                    }
                    break;
                default:
                    startText = document.createTextNode(parent.innerHTML.substring(0, range.startOffset));
                    endText = document.createTextNode(parent.innerHTML.substring(range.endOffset));
                    element.innerHTML = parent.innerHTML.substring(range.startOffset, range.endOffset);

                    parent.insertBefore(startText, original.nextSibling);
                    parent.insertBefore(element, startText.nextSibling);
                    parent.insertBefore(endText, element.nextSibling);
                    parent.removeChild(original);
                    break;
            }
        }
        else
        {
            if (parent.nodeName == "DIV") range.insertNode(element);
            else
            {
                const endText = document.createElement(parent.tagName);
                endText.innerHTML = parent.innerHTML.substring(range.endOffset);
                parent.innerHTML = parent.innerHTML.substring(0, range.startOffset);

                editorContent.insertBefore(element, parent.nextSibling);

                if (endText.innerHTML.length > 0) editorContent.insertBefore(endText, element.nextSibling);
            }
        }
    }

    removeEmpty();

    if (element.tagName == "IMG") range.setStartAfter(element);
    else range.setStart(element, 1);

    range.collapse(true);
}

editorTools.style.top = `${document.querySelector("header").clientHeight}px`;