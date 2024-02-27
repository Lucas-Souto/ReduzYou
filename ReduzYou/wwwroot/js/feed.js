const filterWrapper = document.getElementById("filter-wrapper"),
    filterTop = document.getElementById("filter").getBoundingClientRect().top,
    headerHeight = document.querySelector("header").clientHeight;
const order = document.getElementById("order");
const materialsCheckList = document.getElementById("materials"), allCheck = document.getElementById("all-materials");
const main = document.querySelector("main");

let lastTickDate = 0;
let getMore = true;
let lastOrder, lastMaterials;

function getOrder()
{
    const selected = order.querySelector(".filter-item input[type='radio']:checked");

    return selected.value;
}
function getMaterials()
{
    const result = [];

    if (!allCheck.checked)
    {
        for (let i = 0; i < materials.length; i++)
        {
            if (document.getElementById(`material${i}`).checked) result.push(materials[i]);
        }
    }

    return result;
}

function checkAll()
{
    for (let i = 0; i < materials.length; i++)
    {
        const material = document.getElementById(`material${i}`);

        if (allCheck.checked) material.setAttribute("disabled", true);
        else material.removeAttribute("disabled");
    }
}

function addPost(post)
{
    main.insertAdjacentHTML('beforeend', `
        <a class="post" href="/${post.author}/${post.link}">
            <img class="post-img" src=${post.cover} />
            <div class="post-bottom">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-stars">
                    <h4 class="star-number">${post.starCount == 0 ? 0 : (post.totalValue / post.starCount) / 10}</h4>
                    <img class="star-icon" src="/img/full_star.svg" />
                </div>
            </div>
        </a>
    `);
}
function getMorePosts()
{
    if (getMore)
    {
        const body = new FormData();
        const materials = getMaterials();

        body.set("order", getOrder());
        body.set("tags", materials.length > 0 ? materials : ",");
        body.set("tickDate", lastTickDate);

        request("api/get_feed", "post", body, false, (response) =>
        {
            let posts = JSON.parse(response.responseText);

            for (let i = 0; i < posts.length; i++)
            {
                if (posts[i] == null)
                {
                    getMore = false;

                    break;
                }

                lastTickDate = posts[i].dateTicks;

                addPost(posts[i]);
            }
        });
    }
}

function getFilterMargin()
{
    return Math.max(0, window.scrollY - filterTop + headerHeight).toString() + "px";
}

allCheck.addEventListener("click", checkAll);
window.addEventListener("scroll", () =>
{
    if (window.innerWidth > 550) filterWrapper.style["margin-top"] = getFilterMargin();
    else filterWrapper.style["margin-top"] = "unset";

    if (getMore && (window.innerHeight + window.scrollY) >= document.body.offsetHeight) getMorePosts();
});
filterWrapper.addEventListener("click", () =>
{
    const testOrder = getOrder(), testMaterials = getMaterials();

    if (testOrder != lastOrder || testMaterials != lastMaterials)
    {
        lastOrder = testOrder;
        lastMaterials = testMaterials;
        main.innerHTML = "";
        lastTickDate = 0;
        getMore = true;

        getMorePosts();
    }
});

filterWrapper.style["margin-top"] = getFilterMargin();
lastOrder = getOrder();
lastMaterials = getMaterials();

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

checkAll();
getMorePosts();