using MySql.Data.MySqlClient;
using ReduzYou.Data;
using System.Text;
using System.Text.RegularExpressions;

public enum Order { Newest, Oldest, Star }

internal static class DataBase
{
    public static bool IsConnected { get; private set; }
    private static MySqlConnection? Connection;

    public static void Connect(string connectionString)
    {
        try
        {
            Connection = new MySqlConnection(connectionString);

            Connection.Open();

            IsConnected = true;

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
                content LONGTEXT NOT NULL,
                cover VARCHAR(255),
                tag VARCHAR(20) NOT NULL,
                date DATETIME,
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
            );".Run();
        }
        catch (MySqlException e)
        {
            Console.WriteLine(e.Message);
        }
    }
    public static void Disconnect()
    {
        if (!IsConnected) return;

        Connection?.Close();

        IsConnected = false;
        Connection = null;
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
    public static string GetId(string username)
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
    public static void FillFeed(Post[] feed, Order order, string[] tags, long lastTickDate)
    {
        int index = 0;
        StringBuilder sql = new StringBuilder(@"SELECT posts.id, posts.title, posts.author, posts.link, posts.cover, posts.date,
            count(stars.value) AS starCount, COALESCE(sum(stars.value), 0) AS totalValue FROM posts
            LEFT JOIN stars ON posts.id = stars.post");
        string add = string.Empty;

        if (tags.Length > 0)
        {
            sql.Append(" WHERE posts.tag = @tag");

            if (lastTickDate != 0) sql.Append(" AND");
        }
        else if (lastTickDate != 0) sql.Append(" WHERE");

        switch (order)
        {
            case Order.Newest:
                if (lastTickDate != 0) sql.Append(" posts.date < @lastDate");

                sql.Append($" GROUP BY posts.id ORDER BY posts.date DESC LIMIT @limit");
                break;
            case Order.Oldest:
                if (lastTickDate != 0) sql.Append(" posts.date > @lastDate");

                sql.Append(" GROUP BY posts.id ORDER BY posts.date ASC LIMIT @limit");
                break;
            case Order.Star:
                if (lastTickDate != 0) sql.Append(" posts.date < @lastDate");

                sql.Append(" GROUP BY posts.id ORDER BY starCount DESC LIMIT @limit");
                break;
        }

        sql.ToString().Query((reader) =>
        {
            while (reader.Read())
            {
                if (index >= feed.Length) return;

                feed[index] = new Post()
                {
                    id = reader.GetString("id"),
                    title = reader.GetString("title"),
                    author = reader.GetString("author"),
                    link = reader.GetString("link"),
                    cover = reader.GetString("cover"),
                    dateTicks = reader.GetDateTime("date").Ticks.ToString(),
                    starCount = reader.GetUInt32("starCount"),
                    totalValue = reader.GetUInt32("totalValue")
                };
                index++;
            }
        }, ("@tag", Post.MakeTagValue(tags)), ("@lastDate", new DateTime(lastTickDate)), ("@limit", feed.Length));
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

    private static int Run(this string sql, params (string name, object value)[] args)
    {
        if (!IsConnected) return 0;

        MySqlCommand command = new MySqlCommand(sql, Connection);

        for (int i = 0; i < args.Length; i++) command.Parameters.AddWithValue(args[i].name, args[i].value);

        int rows = command.ExecuteNonQuery();

        return rows;
    }
    private static void Query(this string sql, Action<MySqlDataReader> callback, params (string name, object value)[] args)
    {
        if (!IsConnected) return;

        MySqlCommand command = new MySqlCommand(sql, Connection);

        for (int i = 0; i < args.Length; i++) command.Parameters.AddWithValue(args[i].name, args[i].value);

        MySqlDataReader reader = command.ExecuteReader();

        callback?.Invoke(reader);
        reader.Close();
    }
}