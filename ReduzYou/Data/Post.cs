using Microsoft.Extensions.Hosting;
using System.Text.RegularExpressions;

namespace ReduzYou.Data
{
    public class Post
    {
        /// <summary>
        /// Valores de cada tag em ordem reversa (para <see cref="GetTags(int)"/>).
        /// </summary>
        public static readonly Dictionary<string, int> MaterialsValue = new Dictionary<string, int>()
        {
            { "Metal", 10_000 },
            { "Eletrônicos", 5_000 },
            { "Vidro", 1_000 },
            { "Isopor", 500 },
            { "Tecido", 100 },
            { "Papel", 10 },
            { "Papelão", 5 },
            { "Pet", 1 }
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
        public List<string> tags { get; set; }

        public static string MakeLink(string title) => LinkRegex.Replace(title.ToLower().Replace(" ", "_"), "");
        public static int MakeTagValue(string[] tags)
        {
            int tag = 0;

            for (int i = 0; i < tags.Length; i++)
            {
                if (MaterialsValue.TryGetValue(tags[i], out int value)) tag += value;
            }

            return tag;
        }
        public static List<string> GetTags(int tagValue)
        {
            List<string> tags = new List<string>();

            foreach (KeyValuePair<string, int> pair in Post.MaterialsValue)
            {
                if (tagValue - pair.Value >= 0)
                {
                    tagValue -= pair.Value;

                    tags.Add(pair.Key);
                }
            }

            return tags;
        }
    }
}