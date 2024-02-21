using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace ReduzYou.Controllers
{
    [Route("api/[action]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        public static readonly Regex ValidUser = new Regex("^[a-zA-Z0-9-_]+$"), ValidPassword = new Regex("^[a-zA-Z0-9-_!?]+$");

        [HttpPost]
        [ActionName("create_account")]
        public byte CreateAccount([FromForm]string username, [FromForm]string password)
        {
            if (username.Length < 3 || username.Length > 32 || password.Length < 7 || password.Length > 32 ||
                !ValidUser.IsMatch(username) || !ValidPassword.IsMatch(password)) return 2;

            if (DataBase.UserExists(username)) return 0;
            else
            {
                DataBase.InsertUser(username, password);

                return 1;
            }
        }
    }
}