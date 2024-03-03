const starsContainer = document.getElementById("post-stars");

for (let i = 0; i < 5; i++)
{
    starsContainer.insertAdjacentHTML("beforeend", `
        <div id=star-${i} class="star">
            <img class="empty-star" src="/img/empty_star.svg" />
            <img class="full-star" src="/img/full_star.svg" />
        </div>
    `);
}

const stars = document.querySelectorAll(".star");
const medium = starCount != 0 ? (totalValue / starCount) / 10 : 0;
let calc;

for (let i = 0; i < stars.length; i++)
{
    if (medium == 0) stars[i].querySelector(".full-star").style["clip-path"] = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
    else if (medium < i + 1)
    {
        calc = 1 - (i + 1 - medium);
        stars[i].querySelector(".full-star").style["clip-path"] = `polygon(0% 0%, ${calc * 100}% 0%, ${calc * 100}% 100%, 0% 100%)`;
    }

    stars[i].addEventListener("click", (e) =>
    {
        const body = new FormData();
        const split = window.location.pathname.split("/");

        body.set("stars", i + 1);
        body.set("postAuthor", split[split.length - 2]);
        body.set("postLink", split[split.length - 1]);
        request("/api/give_star", "post", body, true, () => window.location.reload());
    });
}