
const API_URL = "http://127.0.0.1:8000";


// ============================================
// NAVIGATION
// ============================================

function showSection(sectionId) {

    const sections = [
        "productsSection",
        "ordersSection",
        "addSection"
    ];


    sections.forEach(id => {

        document
            .getElementById(id)
            .classList.add("hidden");

    });


    document
        .getElementById(sectionId)
        .classList.remove("hidden");


    const buttons =
        document.querySelectorAll(".nav-btn");


    buttons.forEach(button => {

        button.classList.remove("active");

    });


    if (sectionId === "productsSection") {

        buttons[0].classList.add("active");

        loadProducts();

    }


    else if (sectionId === "ordersSection") {

        buttons[1].classList.add("active");

        loadOrders();

    }


    else if (sectionId === "addSection") {

        buttons[2].classList.add("active");

    }

}


// ============================================
// ADD PRODUCT
// ============================================

async function addProduct() {

    const name =
        document
            .getElementById("name")
            .value
            .trim();


    const category =
        document
            .getElementById("category")
            .value;


    const price =
        document
            .getElementById("price")
            .value;


    const stock =
        document
            .getElementById("stock")
            .value;


    const description =
        document
            .getElementById("description")
            .value
            .trim();


    if (!name) {

        alert("Please enter product name.");

        return;

    }


    if (!price || Number(price) <= 0) {

        alert("Please enter a valid price.");

        return;

    }


    if (stock === "" || Number(stock) < 0) {

        alert("Please enter valid stock.");

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

                        name: name,

                        category: category,

                        price: Number(price),

                        stock: Number(stock),

                        description: description

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to add product."
            );

            return;

        }


        alert(
            "Product added successfully!"
        );


        clearForm();


        await loadProducts();


        showSection(
            "productsSection"
        );

    }


    catch (error) {

        console.error(error);

        alert(
            "Backend server is not running."
        );

    }

}


// ============================================
// CLEAR FORM
// ============================================

function clearForm() {

    document.getElementById("name").value = "";

    document.getElementById("category").value =
        "electronics";

    document.getElementById("price").value = "";

    document.getElementById("stock").value = "";

    document.getElementById("description").value = "";

}


// ============================================
// LOAD PRODUCTS
// ============================================

async function loadProducts() {

    const container =
        document.getElementById("products");


    container.innerHTML =
        `<div class="loading">
            Loading products...
        </div>`;


    try {

        const response =
            await fetch(
                `${API_URL}/products`
            );


        const products =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Failed to load products"
            );

        }


        updateProductCounts(
            products
        );


        if (products.length === 0) {

            container.innerHTML =
                `<div class="empty">
                    No products found.
                </div>`;

            return;

        }


        container.innerHTML = "";


        products.forEach(product => {

            const div =
                document.createElement("div");


            div.className =
                "product-item";


            div.innerHTML = `

                <div class="product-info">

                    <h3>
                        ${escapeHTML(product.name)}
                    </h3>

                    <span class="category">
                        ${escapeHTML(product.category)}
                    </span>

                    <p>
                        💰 Price:
                        ₹${product.price}
                    </p>

                    <p>
                        📦 Stock:
                        ${product.stock}
                    </p>

                    <p>
                        ${escapeHTML(
                product.description || ""
            )}
                    </p>

                </div>


                <button
                    class="delete-btn"
                    onclick="deleteProduct(${product.id})">

                    🗑 Delete

                </button>

            `;


            container.appendChild(div);

        });

    }


    catch (error) {

        console.error(error);

        container.innerHTML =
            `<div class="empty">
                ❌ Unable to connect to backend.
            </div>`;

    }

}


// ============================================
// PRODUCT COUNTS
// ============================================

function updateProductCounts(products) {

    const electronics =
        products.filter(product =>

            product.category &&
            product.category.toLowerCase() ===
            "electronics"

        ).length;


    const furniture =
        products.filter(product =>

            product.category &&
            product.category.toLowerCase() ===
            "furniture"

        ).length;


    document.getElementById(
        "productCount"
    ).innerText =
        products.length;


    document.getElementById(
        "electronicsCount"
    ).innerText =
        electronics;


    document.getElementById(
        "furnitureCount"
    ).innerText =
        furniture;

}


// ============================================
// DELETE PRODUCT
// ============================================

async function deleteProduct(id) {

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
                `${API_URL}/products/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to delete product."
            );

            return;

        }


        alert(
            "Product deleted successfully."
        );


        loadProducts();

    }


    catch (error) {

        console.error(error);

        alert(
            "Backend server is not running."
        );

    }

}


// ============================================
// LOAD ORDERS
// ============================================

async function loadOrders() {

    const container =
        document.getElementById("orders");


    container.innerHTML =
        `<div class="loading">
            Loading orders...
        </div>`;


    try {

        const response =
            await fetch(
                `${API_URL}/orders`
            );


        const orders =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Failed to load orders"
            );

        }


        document.getElementById(
            "orderCount"
        ).innerText =
            orders.length;


        if (orders.length === 0) {

            container.innerHTML =
                `<div class="empty">
                    No orders found.
                </div>`;

            return;

        }


        container.innerHTML = "";


        orders.forEach(order => {

            const div =
                document.createElement("div");


            div.className =
                "order-item";


            div.innerHTML = `

                <h3>
                    🛍 Order #${order.id}
                </h3>

                <div class="order-grid">

                    <div class="order-field">

                        <span>
                            Customer
                        </span>

                        <strong>
                            ${escapeHTML(
                order.customer_name
            )}
                        </strong>

                    </div>


                    <div class="order-field">

                        <span>
                            Product
                        </span>

                        <strong>
                            ${escapeHTML(
                order.product_name
            )}
                        </strong>

                    </div>


                    <div class="order-field">

                        <span>
                            Quantity
                        </span>

                        <strong>
                            ${order.quantity}
                        </strong>

                    </div>


                    <div class="order-field">

                        <span>
                            Total
                        </span>

                        <strong>
                            ₹${order.total_price}
                        </strong>

                    </div>


                    <div class="order-field">

                        <span>
                            Status
                        </span>

                        <span class="status">
                            ${escapeHTML(
                order.status
            )}
                        </span>

                    </div>

                </div>

            `;


            container.appendChild(div);

        });

    }


    catch (error) {

        console.error(error);

        container.innerHTML =
            `<div class="empty">
                ❌ Unable to load orders.
            </div>`;

    }

}


// ============================================
// LOAD ALL DATA
// ============================================

function loadAllData() {

    loadProducts();

    loadOrders();

}


// ============================================
// BACK TO CHATBOT
// ============================================

function goToChatbot() {

    window.location.href =
        "../frontend/index.html";

}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHTML(value) {

    if (!value) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ============================================
// INITIAL LOAD
// ============================================

loadAllData();

