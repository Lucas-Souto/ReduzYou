const filterWrapper = document.getElementById("filter-wrapper"),
    filterTop = document.getElementById("filter").getBoundingClientRect().top,
    headerHeight = document.querySelector("header").clientHeight;
const order = document.getElementById("order");
const materialsCheckList = document.getElementById("materials"), allCheck = document.getElementById("all-materials");
const main = document.querySelector("main");

function getOrder()
{
    const selected = order.querySelector(".filter-item input[type='radio']:checked");

    return selected.value;
}

function getMaterials()
{
    const result = [];

    for (let i = 0; i < materials.length; i++)
    {
        if (allCheck.checked) result[i] = true;
        else result[i] = document.getElementById(`material${i}`).checked;
    }

    return result;
}

for (let i = 0; i < materials.length; i++)
{
    const id = `material${i}`;

    materialsCheckList.insertAdjacentHTML('beforeend', `
        <div class="filter-item">
            <input id="${id}" type="checkbox" />
            <label for="${id}">${materials[i]}</label>
        </div>
    `);
}

allCheck.checked = true;

function checkAll()
{
    for (let i = 0; i < materials.length; i++)
    {
        const material = document.getElementById(`material${i}`);

        if (allCheck.checked) material.setAttribute("disabled", true);
        else material.removeAttribute("disabled");
    }
}

allCheck.addEventListener("click", checkAll);
checkAll();

function addPost(post)
{
    main.insertAdjacentHTML('beforeend', `
        <a class="post" href="/${post.fullLink}">
            <img class="post-img" src=${post.cover} />
            <div class="post-bottom">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-stars">
                    <h4 class="star-number">${(post.totalValue / post.starCount) / 10}</h4>
                    <img class="star-icon" src="/img/full_star.svg" />
                </div>
            </div>
        </a>
    `);
}

for (let i = 0; i < 30; i++) addPost({ cover: "https://picsum.photos/200/300", fullLink: "meu_login/coiso_2", title: "Coiso 2", totalValue: 48, starCount: 1 });

function getFilterMargin()
{
    return Math.max(0, window.scrollY - filterTop + headerHeight).toString() + "px";
}

filterWrapper.style["margin-top"] = getFilterMargin();

window.addEventListener("scroll", () =>
{
    if (window.innerWidth > 550) filterWrapper.style["margin-top"] = getFilterMargin();
    else filterWrapper.style["margin-top"] = "unset";
});