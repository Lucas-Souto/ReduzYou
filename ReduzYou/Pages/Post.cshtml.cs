using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ReduzYou.Pages
{
    public class PostModel : PageModel
    {
        public string User, Post;

        public void OnGet()
		{
			if (RouteData.Values.TryGetValue("user", out object user)) User = user.ToString();
            else User = string.Empty;

			if (RouteData.Values.TryGetValue("post", out object post)) Post = post.ToString();
            else Post = string.Empty;
		}
    }
}