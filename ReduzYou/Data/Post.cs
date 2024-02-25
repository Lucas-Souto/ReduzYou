using Microsoft.Extensions.Hosting;
using System.Text.RegularExpressions;

namespace ReduzYou.Data
{
    public class Post
    {
        public static readonly Dictionary<string, uint> MaterialsValue = new Dictionary<string, uint>()
        {
            { "Pet", 1 },
            { "Papelão", 5 },
            { "Papel", 10 },
            { "Tecido", 100 },
            { "Isopor", 500 },
            { "Vidro", 1_000 },
            { "Eletrônicos", 5_000 },
            { "Metal", 10_000 }
        };
        private static readonly Regex LinkRegex = new Regex("[^a-z0-9_]");
        public bool isDraft { get; set; }
        public uint starCount { get; set; }
        public uint totalValue { get; set; }
        public string dateTicks { get; set; }
        public string id { get; set; }
        public string author { get; set; }
        public string title { get; set; }
        public string link { get; set; }
        public string content { get; set; }
        public string cover { get; set; }
        public string[] tags { get; set; }

        public static string MakeLink(string title) => LinkRegex.Replace(title.ToLower().Replace(" ", "_"), "");
        public static uint MakeTagValue(string[] tags)
        {
            uint tag = 0;

            for (int i = 0; i < tags.Length; i++)
            {
                if (MaterialsValue.TryGetValue(tags[i], out uint value)) tag += value;
            }

            return tag;
        }
    }
}