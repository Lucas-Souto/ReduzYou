using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ReduzYou.Pages
{
    public class CreateModel : PageModel
    {
        public string PostId = string.Empty;

        public void OnGet()
        {
            if (RouteData.Values.TryGetValue("post", out object postId)) PostId = postId.ToString();
        }
    }
}