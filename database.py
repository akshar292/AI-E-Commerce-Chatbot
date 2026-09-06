import sqlite3


DATABASE = "shop.db"


# =========================================================
# CONNECTION
# =========================================================

def get_connection():

    connection = sqlite3.connect(
        DATABASE
    )

    connection.row_factory = sqlite3.Row

    return connection


# =========================================================
# CREATE TABLES
# =========================================================

def create_tables():

    connection = get_connection()
    cursor = connection.cursor()

    # ---------------------------------------------
    # Products
    # ---------------------------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS products (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            category TEXT NOT NULL,

            price REAL NOT NULL,

            stock INTEGER NOT NULL,

            description TEXT

        )
        """
    )

    # ---------------------------------------------
    # Orders
    # ---------------------------------------------

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            customer_name TEXT NOT NULL,

            product_id INTEGER NOT NULL,

            quantity INTEGER NOT NULL,

            total_price REAL NOT NULL,

            status TEXT DEFAULT 'confirmed'

        )
        """
    )

    connection.commit()

    # ---------------------------------------------
    # Add sample products if database is empty
    # ---------------------------------------------

    cursor.execute(
        "SELECT COUNT(*) AS count FROM products"
    )

    count = cursor.fetchone()["count"]

    if count == 0:

        sample_products = [

            (
                "iPhone 13",
                "electronics",
                49999,
                20,
                "Apple iPhone with powerful performance"
            ),

            (
                "Samsung Galaxy S24",
                "electronics",
                69999,
                15,
                "Premium Samsung smartphone"
            ),

            (
                "Modern Sofa",
                "furniture",
                25000,
                10,
                "Modern 3 seater sofa"
            ),

            (
                "Office Chair",
                "furniture",
                8500,
                25,
                "Comfortable ergonomic office chair"
            ),

            (
                "Dining Table",
                "furniture",
                18000,
                8,
                "Modern wooden dining table"
            )

        ]

        cursor.executemany(
            """
            INSERT INTO products
            (
                name,
                category,
                price,
                stock,
                description
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            sample_products
        )

        connection.commit()

    connection.close()