﻿const postMaterials = document.getElementById("post-materials");
const postForm = document.getElementById("post-form");
const editLink = document.getElementById("edit-link");
const postContent = document.getElementById("editor-content");
const coverInput = document.getElementById("cover-input"), coverImage = document.getElementById("cover-image"),
    coverButton = document.getElementById("cover-button");

function getMaterials()
{
    const result = [];

    for (let i = 0; i < materials.length; i++)
    {
        if (document.getElementById(`material${i}`).checked) result.push(materials[i]);
    }

    return result;
}
function checkMaterials(check = [])
{
    let index;

    for (let i = 0; i < check.length; i++)
    {
        index = materials.indexOf(check[i]);

        if (index != -1) document.getElementById(`material${index}`).checked = true;
    }
}

for (let i = 0; i < materials.length; i++)
{
    const id = `material${i}`;

    postMaterials.insertAdjacentHTML('beforeend', `
        <div class="materials-item">
            <input id="${id}" type="checkbox" />
            <label for="${id}">${materials[i]}</label>
        </div>
    `);
}

postForm.addEventListener("submit", (e) =>
{
    e.preventDefault();

    const body = new FormData(postForm);
    const materials = getMaterials();

    body.set("tags", materials.length > 0 ? materials : ",");
    body.set("action", e.submitter.getAttribute("name"));
    body.set("content", postContent.innerHTML)

    request("/api/post_save", "post", body, false, (request) =>
    {
        if (request.responseText[0] == "/")
        {
            if (body.get("action") == "publish") window.location = request.responseText;
            else
            {
                editLink.value = request.responseText.split("/")[2];

                window.alert("Salvo!");
            }
        }
        else window.alert(request.responseText);
    });
});

coverButton.addEventListener("click", (e) =>
{
    openSelector((link) =>
    {
        if (link.length > 0)
        {
            coverImage.setAttribute("src", link);
            coverInput.value = link;
        }
    });
});

initializeTags();