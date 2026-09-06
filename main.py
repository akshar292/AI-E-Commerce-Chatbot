from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection, create_tables
from models import ProductCreate, OrderCreate
from chatbot import chatbot_response


app = FastAPI(
    title="AI E-Commerce Chatbot API",
    version="1.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE
# =========================================================

create_tables()


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "AI E-Commerce Chatbot API is running"
    }


# =========================================================
# CHATBOT
# =========================================================

@app.get("/chat")
def chat(question: str):

    return chatbot_response(question)


# =========================================================
# GET ALL PRODUCTS
# =========================================================

@app.get("/products")
def get_products():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM products
        ORDER BY id DESC
    """)

    products = [
        dict(row)
        for row in cursor.fetchall()
    ]

    connection.close()

    return products


# =========================================================
# GET SINGLE PRODUCT
# =========================================================

@app.get("/products/{product_id}")
def get_product(product_id: int):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM products
        WHERE id = ?
        """,
        (product_id,)
    )

    product = cursor.fetchone()

    connection.close()

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return dict(product)


# =========================================================
# ADD PRODUCT
# =========================================================

@app.post("/products")
def add_product(product: ProductCreate):

    category = product.category.lower().strip()

    allowed_categories = [
        "electronics",
        "furniture"
    ]

    if category not in allowed_categories:

        raise HTTPException(
            status_code=400,
            detail="Category must be electronics or furniture."
        )

    if product.price < 0:

        raise HTTPException(
            status_code=400,
            detail="Price cannot be negative."
        )

    if product.stock < 0:

        raise HTTPException(
            status_code=400,
            detail="Stock cannot be negative."
        )

    if not product.name.strip():

        raise HTTPException(
            status_code=400,
            detail="Product name is required."
        )

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
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
        (
            product.name.strip(),
            category,
            product.price,
            product.stock,
            product.description.strip()
        )
    )

    connection.commit()

    product_id = cursor.lastrowid

    connection.close()

    return {
        "message": "Product added successfully",
        "product_id": product_id
    }


# =========================================================
# DELETE PRODUCT
# =========================================================

@app.delete("/products/{product_id}")
def delete_product(product_id: int):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM products
        WHERE id = ?
        """,
        (product_id,)
    )

    deleted = cursor.rowcount

    connection.commit()
    connection.close()

    if deleted == 0:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "message": "Product deleted successfully"
    }


# =========================================================
# CREATE ORDER
# =========================================================

@app.post("/orders")
def create_order(order: OrderCreate):

    connection = get_connection()
    cursor = connection.cursor()

    # ---------------------------------------------
    # Quantity
    # ---------------------------------------------

    if order.quantity <= 0:

        connection.close()

        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0."
        )

    # ---------------------------------------------
    # Customer name
    # ---------------------------------------------

    if not order.customer_name.strip():

        connection.close()

        raise HTTPException(
            status_code=400,
            detail="Customer name is required."
        )

    # ---------------------------------------------
    # Find product
    # ---------------------------------------------

    cursor.execute(
        """
        SELECT *
        FROM products
        WHERE id = ?
        """,
        (order.product_id,)
    )

    product = cursor.fetchone()

    if not product:

        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    # ---------------------------------------------
    # Check stock
    # ---------------------------------------------

    if product["stock"] < order.quantity:

        connection.close()

        raise HTTPException(
            status_code=400,
            detail=(
                f"Only {product['stock']} "
                f"items available in stock."
            )
        )

    # ---------------------------------------------
    # Calculate total
    # ---------------------------------------------

    total_price = (
        product["price"] *
        order.quantity
    )

    # ---------------------------------------------
    # Create order
    # ---------------------------------------------

    cursor.execute(
        """
        INSERT INTO orders
        (
            customer_name,
            product_id,
            quantity,
            total_price,
            status
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            order.customer_name.strip(),
            order.product_id,
            order.quantity,
            total_price,
            "confirmed"
        )
    )

    order_id = cursor.lastrowid

    # ---------------------------------------------
    # Reduce stock
    # ---------------------------------------------

    cursor.execute(
        """
        UPDATE products
        SET stock = stock - ?
        WHERE id = ?
        """,
        (
            order.quantity,
            order.product_id
        )
    )

    connection.commit()
    connection.close()

    return {
        "message": "Order created successfully",
        "order_id": order_id,
        "customer_name": order.customer_name.strip(),
        "product": product["name"],
        "quantity": order.quantity,
        "price": product["price"],
        "total_price": total_price,
        "status": "confirmed"
    }


# =========================================================
# GET ALL ORDERS
# =========================================================

@app.get("/orders")
def get_orders():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            orders.id,
            orders.customer_name,
            orders.product_id,
            products.name AS product_name,
            products.category,
            orders.quantity,
            orders.total_price,
            orders.status
        FROM orders
        JOIN products
        ON orders.product_id = products.id
        ORDER BY orders.id DESC
        """
    )

    orders = [
        dict(row)
        for row in cursor.fetchall()
    ]

    connection.close()

    return orders