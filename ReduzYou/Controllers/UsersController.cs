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
            if (!ValidateUserData(username, password)) return 2;

            if (DataBase.UserExists(username)) return 0;
            else
            {
                DataBase.InsertUser(username, password);
                CreateSection(DataBase.GetUserId(username), username);

                return 1;
            }
        }
        [HttpPost]
        [ActionName("enter_account")]
        public bool EnterAccount([FromForm] string username, [FromForm] string password)
        {
            if (!ValidateUserData(username, password)) return false;

            string result = DataBase.ValidateLogin(username, password);

            CreateSection(result, username);

            return result.Length > 0;
        }
        [HttpGet]
        [ActionName("exit_account")]
        public void ExitAccount() => HttpContext.Session.Clear();

        [NonAction]
        private void CreateSection(string id, string username)
        {
            if (string.IsNullOrEmpty(HttpContext.Session.GetString("_Id")))
            {
                HttpContext.Session.SetString("_Id", id);
                HttpContext.Session.SetString("_Username", username);
            }
        }
        [NonAction]
        private bool ValidateUserData(string username, string password) => username.Length >= 3 && username.Length <= 32 && password.Length >= 7 && password.Length <= 32 && ValidUser.IsMatch(username) && ValidPassword.IsMatch(password);
    }
}