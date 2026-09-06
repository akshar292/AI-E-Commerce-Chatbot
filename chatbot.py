import requests

from database import get_connection


DUMMY_API = "https://dummyjson.com"


# =========================================================
# KEYWORDS
# =========================================================

ELECTRONICS_KEYWORDS = [

    "phone",
    "mobile",
    "iphone",
    "samsung",
    "galaxy",
    "laptop",
    "computer",
    "tablet",
    "headphone",
    "headphones",
    "airpods",
    "camera",
    "tv",
    "television",
    "electronics",
    "macbook"

]


FURNITURE_KEYWORDS = [

    "sofa",
    "chair",
    "table",
    "bed",
    "furniture",
    "dining",
    "wardrobe",
    "desk",
    "cupboard"

]


# =========================================================
# LOCAL DATABASE SEARCH
# =========================================================

def search_local_products(question):

    connection = get_connection()

    cursor = connection.cursor()

    search = f"%{question}%"

    cursor.execute(
        """
        SELECT *
        FROM products
        WHERE
            LOWER(name) LIKE ?
            OR LOWER(category) LIKE ?
            OR LOWER(description) LIKE ?
        ORDER BY id DESC
        """,
        (
            search,
            search,
            search
        )
    )

    products = cursor.fetchall()

    connection.close()

    return [
        dict(product)
        for product in products
    ]


# =========================================================
# EXTERNAL API SEARCH
# =========================================================

def search_external_products(query):

    url = f"{DUMMY_API}/products/search"

    try:

        response = requests.get(
            url,
            params={
                "q": query
            },
            timeout=10
        )

        if response.status_code == 200:

            return response.json().get(
                "products",
                []
            )

    except requests.RequestException:

        pass

    return []


# =========================================================
# FORMAT LOCAL PRODUCTS
# =========================================================

def format_local_products(products):

    result = []

    for product in products[:5]:

        result.append({

            "id": product["id"],

            "name": product["name"],

            "price": product["price"],

            "category": product["category"],

            "stock": product["stock"],

            "description": product["description"],

            "rating": None,

            "image": None

        })

    return result


# =========================================================
# FORMAT EXTERNAL PRODUCTS
# =========================================================

def format_external_products(
    products,
    category
):

    result = []

    for product in products[:5]:

        result.append({

            "id": product.get("id"),

            "name": product.get("title"),

            "price": product.get("price"),

            "category": category,

            "stock": product.get("stock"),

            "rating": product.get("rating"),

            "description": product.get(
                "description"
            ),

            "image": product.get(
                "thumbnail"
            )

        })

    return result


# =========================================================
# CHATBOT
# =========================================================

def chatbot_response(question):

    question = question.lower().strip()

    category = None

    search_word = None

    # ---------------------------------------------
    # Electronics
    # ---------------------------------------------

    for word in ELECTRONICS_KEYWORDS:

        if word in question:

            category = "electronics"

            search_word = word

            break

    # ---------------------------------------------
    # Furniture
    # ---------------------------------------------

    if category is None:

        for word in FURNITURE_KEYWORDS:

            if word in question:

                category = "furniture"

                search_word = word

                break

    # ---------------------------------------------
    # Category not found
    # ---------------------------------------------

    if category is None:

        return {

            "type": "message",

            "message": (
                "Please ask me about an "
                "electronics or furniture product."
            )

        }

    # ---------------------------------------------
    # Search local database
    # ---------------------------------------------

    local_products = search_local_products(
        search_word
    )

    if local_products:

        products = format_local_products(
            local_products
        )

        return {

            "type": "products",

            "source": "local_database",

            "category": category,

            "message": (
                f"Here are the {category} "
                "products from our store:"
            ),

            "products": products

        }

    # ---------------------------------------------
    # Search external API
    # ---------------------------------------------

    external_products = search_external_products(
        search_word
    )

    products = format_external_products(
        external_products,
        category
    )

    # ---------------------------------------------
    # Not found
    # ---------------------------------------------

    if not products:

        return {

            "type": "not_found",

            "message": (
                f"Sorry, I couldn't find any "
                f"{category} product matching "
                f"'{search_word}'."
            )

        }

    # ---------------------------------------------
    # Return
    # ---------------------------------------------

    return {

        "type": "products",

        "source": "external_api",

        "category": category,

        "message": (
            f"Here are the {category} "
            "products I found:"
        ),

        "products": products

    }