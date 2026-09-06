// =========================================================
// CONFIG
// =========================================================

const API_URL =
    "https://ai-e-commerce-chatbot.onrender.com";


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAllData();

    }
);


// =========================================================
// LOAD EVERYTHING
// =========================================================

async function loadAllData() {

    await loadProducts();

    await loadOrders();

}


// =========================================================
// SHOW SECTION
// =========================================================

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(
            ".section"
        );


    sections.forEach(
        section => {

            section.classList.add(
                "hidden"
            );

        }
    );


    document
        .getElementById(sectionId)
        .classList.remove(
            "hidden"
        );


    const buttons =
        document.querySelectorAll(
            ".nav-btn"
        );


    buttons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    event.currentTarget.classList.add(
        "active"
    );

}


// =========================================================
// LOAD PRODUCTS
// =========================================================

async function loadProducts() {

    const container =
        document.getElementById(
            "products"
        );


    container.innerHTML =
        `
        <div class="loading">
            Loading products...
        </div>
        `;


    try {

        const response =
            await fetch(
                `${API_URL}/products`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load products"
            );

        }


        const products =
            await response.json();


        displayProducts(
            products
        );


        updateProductStats(
            products
        );

    }

    catch (error) {

        console.error(error);


        container.innerHTML =
            `
            <div class="empty">

                ❌ Unable to load products.

                <br><br>

                Please check the Render backend.

            </div>
            `;

    }

}


// =========================================================
// DISPLAY PRODUCTS
// =========================================================

function displayProducts(
    products
) {

    const container =
        document.getElementById(
            "products"
        );


    if (
        !products ||
        products.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty">
                No products found.
            </div>
            `;

        return;

    }


    container.innerHTML = "";


    products.forEach(
        product => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "product-item";


            item.innerHTML = `

                <div class="product-info">

                    <h3>
                        ${product.name}
                    </h3>

                    <p>

                        <span class="category">
                            ${product.category}
                        </span>

                    </p>

                    <p>
                        💰 ₹${product.price}
                    </p>

                    <p>
                        📦 Stock:
                        ${product.stock}
                    </p>

                    <p>
                        ${product.description || ""}
                    </p>

                </div>


                <button
                    class="delete-btn"
                    onclick="deleteProduct(${product.id})"
                >
                    🗑 Delete
                </button>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// =========================================================
// PRODUCT STATS
// =========================================================

function updateProductStats(
    products
) {

    document.getElementById(
        "productCount"
    ).textContent =
        products.length;


    const electronics =
        products.filter(
            product =>
                product.category ===
                "electronics"
        );


    const furniture =
        products.filter(
            product =>
                product.category ===
                "furniture"
        );


    document.getElementById(
        "electronicsCount"
    ).textContent =
        electronics.length;


    document.getElementById(
        "furnitureCount"
    ).textContent =
        furniture.length;

}


// =========================================================
// DELETE PRODUCT
// =========================================================

async function deleteProduct(
    productId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/products/${productId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Delete failed"
            );

        }


        alert(
            "Product deleted successfully."
        );


        loadProducts();

    }

    catch (error) {

        alert(
            error.message
        );

    }

}


// =========================================================
// ADD PRODUCT
// =========================================================

async function addProduct() {

    const name =
        document.getElementById(
            "name"
        ).value.trim();


    const category =
        document.getElementById(
            "category"
        ).value;


    const price =
        parseFloat(
            document.getElementById(
                "price"
            ).value
        );


    const stock =
        parseInt(
            document.getElementById(
                "stock"
            ).value
        );


    const description =
        document.getElementById(
            "description"
        ).value.trim();


    // ---------------------------------------------
    // Validation
    // ---------------------------------------------

    if (!name) {

        alert(
            "Please enter product name."
        );

        return;

    }


    if (
        isNaN(price) ||
        price < 0
    ) {

        alert(
            "Please enter a valid price."
        );

        return;

    }


    if (
        isNaN(stock) ||
        stock < 0
    ) {

        alert(
            "Please enter a valid stock."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/products`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        name:
                            name,

                        category:
                            category,

                        price:
                            price,

                        stock:
                            stock,

                        description:
                            description

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Failed to add product"
            );

        }


        alert(
            "Product added successfully! 🎉"
        );


        clearForm();


        await loadProducts();


        showSection(
            "productsSection"
        );

    }

    catch (error) {

        alert(
            error.message
        );

    }

}


// =========================================================
// CLEAR FORM
// =========================================================

function clearForm() {

    document.getElementById(
        "name"
    ).value = "";


    document.getElementById(
        "price"
    ).value = "";


    document.getElementById(
        "stock"
    ).value = "";


    document.getElementById(
        "description"
    ).value = "";

}


// =========================================================
// LOAD ORDERS
// =========================================================

async function loadOrders() {

    const container =
        document.getElementById(
            "orders"
        );


    container.innerHTML =
        `
        <div class="loading">
            Loading orders...
        </div>
        `;


    try {

        const response =
            await fetch(
                `${API_URL}/orders`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load orders"
            );

        }


        const orders =
            await response.json();


        displayOrders(
            orders
        );


        document.getElementById(
            "orderCount"
        ).textContent =
            orders.length;

    }

    catch (error) {

        console.error(error);


        container.innerHTML =
            `
            <div class="empty">

                ❌ Unable to load orders.

            </div>
            `;

    }

}


// =========================================================
// DISPLAY ORDERS
// =========================================================

function displayOrders(
    orders
) {

    const container =
        document.getElementById(
            "orders"
        );


    if (
        !orders ||
        orders.length === 0
    ) {

        container.innerHTML =
            `
            <div class="empty">
                No orders yet.
            </div>
            `;

        return;

    }


    container.innerHTML = "";


    orders.forEach(
        order => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "order-item";


            item.innerHTML = `

                <h3>
                    🛍 Order #${order.id}
                </h3>


                <div class="order-grid">


                    <div class="order-field">

                        <span>
                            Customer
                        </span>

                        ${order.customer_name}

                    </div>


                    <div class="order-field">

                        <span>
                            Product
                        </span>

                        ${order.product_name}

                    </div>


                    <div class="order-field">

                        <span>
                            Category
                        </span>

                        ${order.category}

                    </div>


                    <div class="order-field">

                        <span>
                            Quantity
                        </span>

                        ${order.quantity}

                    </div>


                    <div class="order-field">

                        <span>
                            Total
                        </span>

                        ₹${order.total_price}

                    </div>


                    <div class="order-field">

                        <span>
                            Status
                        </span>

                        <span class="status">
                            ${order.status}
                        </span>

                    </div>


                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// =========================================================
// BACK TO CHATBOT
// =========================================================

function goToChatbot() {

    window.location.href =
        "index.html";

}