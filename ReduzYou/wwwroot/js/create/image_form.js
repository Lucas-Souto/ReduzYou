const addImages = document.getElementById("add-images"),
    images = document.getElementById("images");
const availableImages = [];

images.addEventListener("change", () => addImages.requestSubmit());

addImages.addEventListener("submit", (e) =>
{
    e.preventDefault();

    const formData = new FormData(addImages);
    
    request("api/save_image", "post", formData, false, (request) => availableImages.push(JSON.parse(request.responseText)));

    addImages.reset();
});

request("api/get_images", "post", {}, false, (request) => availableImages.push(JSON.parse(request.responseText)));