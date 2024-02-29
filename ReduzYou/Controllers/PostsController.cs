using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Drawing;
using System.Drawing.Imaging;
using System.ComponentModel.DataAnnotations;
using ReduzYou.Data;

namespace ReduzYou.Controllers
{
    [Route("api/[action]")]
    [ApiController]
    public class PostsController : ControllerBase
    {
        [HttpPost]
        [ActionName("get_feed")]
        public IEnumerable<Post> GetFeed([FromForm] string order, [FromForm] string tags, [FromForm] string tickDate)
        {
            Post[] posts = new Post[10];
            Order parsedOrder = Order.Newest;

            if (Enum.TryParse(order, out Order selectedOrder)) parsedOrder = selectedOrder;

            DataBase.FillFeed(posts, parsedOrder, tags.Length == 1 ? Array.Empty<string>() : tags.Split(','), long.Parse(tickDate));

            return posts;
        }
        [HttpPost]
        [ActionName("post_save")]
        public byte PostSave([FromForm] string title, [FromForm] string action)
        {
            string username = HttpContext.Session.GetString("_Username");

            if (string.IsNullOrEmpty(username)) return 0;

            return 0;
        }
    }
}