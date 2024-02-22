using MySql.Data.MySqlClient;

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

            "CREATE TABLE IF NOT EXISTS users(id VARCHAR(36), username VARCHAR(32), password VARCHAR(255) NOT NULL, PRIMARY KEY (id, username))".Run();
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