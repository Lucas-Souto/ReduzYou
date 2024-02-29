using Microsoft.AspNetCore.Mvc;
using ReduzYou.Data;
using System.Drawing.Imaging;
using System.Drawing;

namespace ReduzYou.Controllers
{
    [Route("api/[action]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        public const string FrontImageFormat = "/images/{0}/{1}.jpg";

        [HttpGet]
        [Route("~/images/{username}/{link}")]
        public ActionResult ViewImage()
        {
            string userId = DataBase.GetUserId(Request.RouteValues["username"].ToString());
            string path = string.Format("Images/{0}/{1}", userId, Request.RouteValues["link"].ToString());

            return new FileStreamResult(new System.IO.FileStream(path, FileMode.Open), "image/jpeg");
        }
        [HttpPost]
        [ActionName("get_images")]
        public IEnumerable<string> GetImages()
        {
            List<string> links = new List<string>();
            string userId = HttpContext.Session.GetString("_Id");

            if (!string.IsNullOrEmpty(userId)) DataBase.GetImagesLink(links, userId);

            return links;
        }
        [HttpPost]
        [ActionName("save_image")]
        public IEnumerable<string> SaveImage(IEnumerable<IFormFile> images)
        {
            string userId = HttpContext.Session.GetString("_Id"), username = HttpContext.Session.GetString("_Username");
            List<string> links = new List<string>();
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(username)) return links;

            string extension;

            foreach (IFormFile file in images)
            {
                extension = file.FileName.ToLower().Split('.').Last();

                if (extension != "png" && extension != "jpg" && extension != "jpeg") continue;

                Image image = Image.FromStream(file.OpenReadStream());
                Bitmap resized = image.Width > 1000 || image.Height > 1000 ? new Bitmap(image, GetClampedSize(image.Size)) : new Bitmap(image);
                string directory = string.Format("Images/{0}", userId);

                if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);

                string id = DataBase.InsertImage(userId);
                System.IO.FileStream stream = System.IO.File.Create(string.Format("{0}/{1}.jpg", directory, id));

                resized.Save(stream, ImageFormat.Jpeg);
                stream.Close();
                links.Add(string.Format(FrontImageFormat, username, id));
            }

            return links;
        }
        [NonAction]
        private Size GetClampedSize(Size originalSize)
        {
            Size size = new Size(Math.Min(originalSize.Width, 1000), 0);
            size.Height = (int)Math.Min((double)size.Width / originalSize.Width * originalSize.Height, 1000);

            return size;
        }
    }
}