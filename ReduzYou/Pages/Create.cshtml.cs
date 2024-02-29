using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ReduzYou.Pages
{
    public class CreateModel : PageModel
    {
        public string PostLink = string.Empty;

        public void OnGet()
        {
            if (RouteData.Values.TryGetValue("post", out object link)) PostLink = link.ToString();
        }
    }
}