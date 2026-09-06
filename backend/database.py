import sqlite3

DATABASE = "shop.db"


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def create_tables():

    connection = get_connection()
    cursor = connection.cursor()

    # Products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            description TEXT
        )
    """)

    # Orders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'confirmed'
        )
    """)

    connection.commit()
    connection.close()