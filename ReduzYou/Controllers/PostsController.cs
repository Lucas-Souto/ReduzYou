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
        public string PostSave([FromForm] string action, [FromForm] string link = "", [FromForm] string cover = "", [FromForm] string title = "", [FromForm] string content = "", [FromForm] string tags = "")
        {
            string username = HttpContext.Session.GetString("_Username");

            if (string.IsNullOrEmpty(username) || title.Length > 64 || cover.Length > 255 || link.Length > 255 || content.Length > 65_535) return "Ocorreu um erro! Tente novamente mais tarde.";
            else if (action == "publish" && (title.Length < 10 || content.Length < 100)) return "O título e/ou o conteúdo estão muito curtos!";

            if (link.Length == 0)
            {
                switch (action)
                {
                    case "save":
                        Post draft = DataBase.FindDraft(username);

                        if (draft == null) DataBase.InsertPost(username, title, content, cover, tags.Split(','), new DateTime(0), true);
                        else DataBase.UpdatePost(username, draft.link, title, content, cover, tags.Split(','), new DateTime(0), true);
                        break;
                    case "publish": DataBase.InsertPost(username, title, content, cover, tags.Split(','), DateTime.Now, false); break;
                }
            }
            else
            {
                Post edit = DataBase.GetPostEdit(username, link);

                if (edit == null) return "Ocorreu um erro! Tente novamente mais tarde.";
                else if (!edit.isDraft && (title.Length < 10 || content.Length < 100)) return "O título e/ou o conteúdo estão muito curtos!";

                switch (action)
                {
                    case "save": DataBase.UpdatePost(username, link, title, content, cover, tags.Split(','), new DateTime(Convert.ToInt64(edit.dateTicks)), edit.isDraft); break;
                    case "publish":
                        DateTime date = edit.isDraft ? DateTime.Now : new DateTime(Convert.ToInt64(edit.dateTicks));

                        DataBase.UpdatePost(username, link, title, content, cover, tags.Split(','), date, false);
                        break;
                }
            }
            
            return string.Format("/{0}/{1}", username, Post.MakeLink(title));
        }

        [NonAction]
        private static bool StringToBool(string @string) => string.IsNullOrEmpty(@string) || @string.ToLower() != "true" ? false : true;
    }
}