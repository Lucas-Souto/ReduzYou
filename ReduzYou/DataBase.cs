using MySql.Data.MySqlClient;
using NuGet.Protocol.Plugins;
using ReduzYou.Controllers;
using ReduzYou.Data;
using System.Text;
using System.Text.RegularExpressions;

public enum Order { Newest, Oldest, Star }

internal static class DataBase
{
    private static string ConnectionString;

    public static void Initialize(string connectionString)
    {
        try
        {
            ConnectionString = connectionString;

			@"CREATE TABLE IF NOT EXISTS users
            (
                id VARCHAR(36) PRIMARY KEY,
                username VARCHAR(32) UNIQUE,
                password VARCHAR(255) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS posts
            (
                id VARCHAR(36) PRIMARY KEY,
                link VARCHAR(255) NOT NULL,
                author VARCHAR(32) NOT NULL,
                title VARCHAR(64) NOT NULL,
                content TEXT NOT NULL,
                cover VARCHAR(255) NOT NULL,
                tag VARCHAR(20) NOT NULL,
                date DATETIME NOT NULL,
                isDraft BOOLEAN NOT NULL DEFAULT 1,
                FOREIGN KEY (author) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS stars
            (
                post VARCHAR(36) NOT NULL,
                user VARCHAR(32) NOT NULL,
                value TINYINT UNSIGNED NOT NULL,
                FOREIGN KEY (post) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS images
            (
                id VARCHAR(64) NOT NULL,
                userId VARCHAR(36) NOT NULL,
                FOREIGN KEY (userId) REFERENCES users(id)
            )".Run();
        }
        catch (MySqlException e)
        {
            Console.WriteLine(e.Message);
        }
    }

    #region Users
    public static void InsertUser(string username, string password) => "INSERT INTO users (id, username, password) VALUES (uuid(), @username, @password)".Run(("@username", username), ("@password", BCrypt.Net.BCrypt.HashPassword(password)));
    public static string ValidateLogin(string username, string password)
    {
        string result = string.Empty;

        "SELECT id, username, password FROM users WHERE username = @username".Query((reader) =>
        {
            if (reader.Read())
            {
                if (BCrypt.Net.BCrypt.Verify(password, reader.GetString("password"))) result = reader.GetString("id");
            }
        }, ("@username", username));

        return result;
    }
    public static bool UserExists(string username)
    {
        bool result = false;

        "SELECT username FROM users WHERE username = @username".Query((reader) =>
        {
            if (reader.Read()) result = true;
        }, ("@username", username));

        return result;
    }
    public static string GetUserId(string username)
    {
        string result = string.Empty;

        "SELECT id FROM users WHERE username = @username".Query((reader) =>
        {
            if (reader.Read()) result = reader.GetString("id");
        }, ("@username", username));

        return result;
    }
    #endregion
    #region Posts
    public static void InsertPost(string author, string title, string content, string cover, string[] tags, DateTime date, bool isDraft)
    {
        "INSERT INTO posts (id, link, author, title, content, cover, tag, date, isDraft) VALUES (uuid(), @link, @author, @title, @content, @cover, @tag, @date, @isDraft)"
            .Run(("@link", GetLink(author, Post.MakeLink(title))), ("@author", author), ("@title", title), ("@content", content), 
                ("@cover", cover), ("@tag", Post.MakeTagValue(tags)), ("@date", date), ("@isDraft", isDraft));
    }
    public static void UpdatePost(string author, string originalLink, string title, string content, string cover, string[] tags, DateTime date, bool isDraft)
    {
        @"UPDATE posts SET
            link = @link,
            title = @title,
            content = @content,
            cover = @cover,
            tag = @tag,
            date = @date,
            isDraft = @isDraft
            WHERE author = @author AND link = @originalLink"
            .Run(("@author", author), ("@originalLink", originalLink), ("@link", Post.MakeLink(title)), ("@title", title), ("@content", content), ("@cover", cover), ("@tag", Post.MakeTagValue(tags)), 
                ("@date", date), ("@isDraft", isDraft));
    }
    public static void FillFeed(Post[] feed, Order order, string[] tags, long lastTickDate)
    {
        int index = 0;
        StringBuilder sql = new StringBuilder(@"SELECT posts.title, posts.author, posts.link, posts.cover, posts.date,
            count(stars.value) AS starCount, COALESCE(sum(stars.value), 0) AS totalValue FROM posts
            LEFT JOIN stars ON posts.id = stars.post
            WHERE isDraft = 0");
        string add = string.Empty;

        if (tags.Length > 0) sql.Append(" AND posts.tag = @tag");

        switch (order)
        {
            case Order.Newest:
                if (lastTickDate != 0) sql.Append(" AND posts.date < @lastDate");

                sql.Append($" GROUP BY posts.id ORDER BY posts.date DESC LIMIT @limit");
                break;
            case Order.Oldest:
                if (lastTickDate != 0) sql.Append(" AND posts.date > @lastDate");

                sql.Append(" GROUP BY posts.id ORDER BY posts.date ASC LIMIT @limit");
                break;
            case Order.Star:
                if (lastTickDate != 0) sql.Append(" AND posts.date < @lastDate");

                sql.Append(" GROUP BY posts.id ORDER BY totalValue DESC LIMIT @limit");
                break;
        }

        sql.ToString().Query((reader) =>
        {
            while (reader.Read())
            {
                if (index >= feed.Length) return;

                feed[index] = new Post()
                {
                    title = reader.GetString("title"),
                    author = reader.GetString("author"),
                    link = reader.GetString("link"),
                    cover = reader.GetString("cover"),
                    dateTicks = reader.GetDateTime("date").Ticks,
                    starCount = reader.GetUInt32("starCount"),
                    totalValue = reader.GetUInt32("totalValue")
                };
                index++;
            }
        }, ("@tag", Post.MakeTagValue(tags)), ("@lastDate", new DateTime(lastTickDate)), ("@limit", feed.Length));
    }
    public static Post FindDraft(string username)
    {
        Post result = null;

        "SELECT link, title, content, cover, tag FROM posts WHERE author = @author AND isDraft = 1".Query((reader) =>
        {
            if (reader.Read())
            {
                result = new Post()
                {
                    isDraft = true,
                    link = reader.GetString("link"),
                    title = reader.IsDBNull(reader.GetOrdinal("title")) ? "" : reader.GetString("title"),
                    content = reader.IsDBNull(reader.GetOrdinal("content")) ? "" : reader.GetString("content"),
                    cover = reader.IsDBNull(reader.GetOrdinal("cover")) ? "" : reader.GetString("cover"),
                    tags = Post.GetTags(Convert.ToInt32(reader.GetString("tag")))
                };
            }
        }, ("@author", username));

        return result;
    }
    public static Post GetPostEdit(string author, string link)
    {
        Post result = null;

        "SELECT title, content, cover, tag, date, isDraft FROM posts WHERE author = @author AND link = @link".Query((reader) =>
        {
            if (reader.Read())
            {
                result = new Post()
                {
                    author = author,
                    link = link,
                    title = reader.GetString("title"),
                    content = reader.GetString("content"),
                    cover = reader.GetString("cover"),
                    tags = Post.GetTags(Convert.ToInt32(reader.GetString("tag"))),
                    dateTicks = reader.GetDateTime("date").Ticks,
                    isDraft = reader.GetBoolean("isDraft")
                };
            }
        }, ("@author", author), ("@link", link));

        return result;
    }
	public static Post GetPost(string author, string link)
	{
		Post result = null;

		@"SELECT posts.title, posts.content, posts.cover, posts.tag, posts.date,
            count(stars.value) AS starCount, COALESCE(sum(stars.value), 0) AS totalValue FROM posts
            LEFT JOIN stars ON posts.id = stars.post
            WHERE author = @author AND link = @link AND isDraft = 0
            GROUP BY posts.id"
		.Query((reader) =>
		{
			if (reader.Read())
			{
				result = new Post()
				{
					author = author,
					link = link,
					title = reader.GetString("title"),
					content = reader.GetString("content"),
					cover = reader.GetString("cover"),
					tags = Post.GetTags(Convert.ToInt32(reader.GetString("tag"))),
					dateTicks = reader.GetDateTime("date").Ticks,
					starCount = reader.GetUInt32("starCount"),
					totalValue = reader.GetUInt32("totalValue")
				};
			}
		}, ("@author", author), ("@link", link));

		return result;
	}
	private static string GetLink(string author, string link)
    {
        int count = 0;

        "SELECT count(link) AS repeated FROM posts WHERE author = @author AND link LIKE @start".Query((reader) =>
        {
            if (reader.Read()) count = reader.GetInt32("repeated");
        }, ("@author", author), ("@start", string.Format("{0}%", link)));

        return count != 0 ? string.Format("{0}{1}", link, count) : link;
    }
	#endregion
	#region Stars
    public static void GiveStar(int stars, string username, string postAuthor, string postLink)
    {
		stars = Math.Max(Math.Min(stars, 5), 1) * 10;
        string postId = string.Empty;
        
        "SELECT id FROM posts WHERE author = @author AND link = @link".Query((reader) =>
        {
            if (reader.Read()) postId = reader.GetString("id");
        }, ("@author", postAuthor), ("@link", postLink));

        if (postId.Length > 0)
        {
			int rows = "UPDATE stars SET value = @stars WHERE post = @post AND user = @user".Run(("@stars", stars), ("@post", postId), ("@user", username));

            if (rows == 0) "INSERT INTO stars (post, user, value) VALUES(@post, @user, @stars)".Run(("@post", postId), ("@user", username), ("@stars", stars));
		}
	}
	#endregion
	#region Images
	public static string InsertImage(string userId)
    {
        string id = "0";
        
        "SELECT COUNT(id) AS imageCount FROM images WHERE userId = @userId".Query((reader) =>
        {
            if (reader.Read()) id = reader.GetUInt64("imageCount").ToString();
        }, ("@userId", userId));

        "INSERT INTO images (id, userId) VALUES(@id, @userId)".Run(("@id", id), ("@userId", userId));

        return id;
    }
    public static void GetImagesLink(List<string> links, string userId, string username)
    {
        "SELECT id FROM images WHERE userId = @userId".Query((reader) =>
        {
            while (reader.Read()) links.Add(string.Format(ImagesController.FrontImageFormat, username, reader.GetString("id")));
        }, ("@userId", userId));
    }
    #endregion

    private static int Run(this string sql, params (string name, object value)[] args)
    {
        MySqlConnection connection = new MySqlConnection(ConnectionString);

        connection.Open();

        MySqlCommand command = new MySqlCommand(sql, connection);

        for (int i = 0; i < args.Length; i++) command.Parameters.AddWithValue(args[i].name, args[i].value);

        int rows = command.ExecuteNonQuery();

        connection.Close();

        return rows;
    }
    private static void Query(this string sql, Action<MySqlDataReader> callback, params (string name, object value)[] args)
    {
        MySqlConnection connection = new MySqlConnection(ConnectionString);

        connection.Open();

        MySqlCommand command = new MySqlCommand(sql, connection);

        for (int i = 0; i < args.Length; i++) command.Parameters.AddWithValue(args[i].name, args[i].value);

        MySqlDataReader reader = command.ExecuteReader();

        callback?.Invoke(reader);
        reader.Close();
        connection.Close();
    }
}