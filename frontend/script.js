const API_URL = "https://ai-e-commerce-chatbot.onrender.com";


// ==================================================
// OPEN ADMIN PANEL
// ==================================================

function openAdmin() {
    window.location.href = "/admin/";
}


// ==================================================
// SEND MESSAGE
// ==================================================

async function sendMessage() {

    const input =
        document.getElementById("question");

    const chatBox =
        document.getElementById("chatBox");

    const question =
        input.value.trim();


    if (!question) {

        return;

    }


    // ==============================================
    // USER MESSAGE
    // ==============================================

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "message user";

    userMessage.innerText =
        question;

    chatBox.appendChild(
        userMessage
    );


    input.value = "";


    chatBox.scrollTop =
        chatBox.scrollHeight;


    // ==============================================
    // LOADING
    // ==============================================

    const loadingMessage =
        document.createElement("div");

    loadingMessage.className =
        "message bot";

    loadingMessage.innerText =
        "Searching products... 🔎";

    chatBox.appendChild(
        loadingMessage
    );


    try {

        // ==========================================
        // CHAT API
        // ==========================================

        const response =
            await fetch(
                `${API_URL}/chat?question=${encodeURIComponent(question)}`
            );


        const data =
            await response.json();


        loadingMessage.remove();


        // ==========================================
        // API ERROR
        // ==========================================

        if (!response.ok) {

            showBotMessage(
                data.detail ||
                "Something went wrong."
            );

            return;

        }


        // ==========================================
        // NEGATIVE / NOT FOUND
        // ==========================================

        if (
            data.type === "negative" ||
            data.type === "not_found" ||
            data.type === "message"
        ) {

            showBotMessage(
                data.message
            );

        }


        // ==========================================
        // PRODUCTS
        // ==========================================

        else if (
            data.type === "products"
        ) {

            showBotMessage(
                data.message
            );


            data.products.forEach(
                product => {

                    createProductCard(
                        product
                    );

                }
            );

        }


        // ==========================================
        // UNKNOWN
        // ==========================================

        else {

            showBotMessage(
                data.message ||
                "I couldn't understand your request."
            );

        }


        chatBox.scrollTop =
            chatBox.scrollHeight;

    }


    catch (error) {

        console.error(
            "Chat error:",
            error
        );


        loadingMessage.remove();


        showBotMessage(
            "❌ Backend server is not running."
        );

    }

}


// ==================================================
// CREATE PRODUCT CARD
// ==================================================

function createProductCard(product) {

    const chatBox =
        document.getElementById(
            "chatBox"
        );


    const productDiv =
        document.createElement(
            "div"
        );


    productDiv.className =
        "product";


    let imageHTML = "";


    if (product.image) {

        imageHTML = `

            <img
                src="${product.image}"
                alt="${escapeHTML(product.name)}"
                onerror="this.style.display='none'"
            >

        `;

    }


    let ratingHTML = "";


    if (
        product.rating !== null &&
        product.rating !== undefined
    ) {

        ratingHTML = `

            <p>
                ⭐ Rating:
                ${product.rating}
            </p>

        `;

    }


    productDiv.innerHTML = `

        ${imageHTML}


        <div class="product-info">

            <h3>
                ${escapeHTML(product.name)}
            </h3>


            <p class="price">

                ₹${product.price}

            </p>


            <p>

                Category:
                ${escapeHTML(product.category)}

            </p>


            <p>

                📦 Stock:
                ${product.stock}

            </p>


            ${ratingHTML}


            <p class="description">

                ${escapeHTML(
        product.description || ""
    )}

            </p>


            <button
                class="order-button"
                onclick="orderProduct(
                    ${product.id},
                    '${escapeJS(product.name)}',
                    ${product.price},
                    ${product.stock}
                )">

                🛒 Order Now

            </button>

        </div>

    `;


    chatBox.appendChild(
        productDiv
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// ==================================================
// ORDER PRODUCT
// ==================================================

async function orderProduct(
    productId,
    productName,
    price,
    stock
) {

    // ==============================================
    // CHECK STOCK
    // ==============================================

    if (stock <= 0) {

        showBotMessage(
            "❌ Sorry, this product is out of stock."
        );

        return;

    }


    // ==============================================
    // CUSTOMER NAME
    // ==============================================

    const customerName =
        prompt(
            "Enter your name:"
        );


    if (
        customerName === null ||
        customerName.trim() === ""
    ) {

        return;

    }


    // ==============================================
    // QUANTITY
    // ==============================================

    const quantityInput =
        prompt(
            `How many ${productName} do you want?\n\nAvailable stock: ${stock}`
        );


    if (
        quantityInput === null
    ) {

        return;

    }


    const quantity =
        Number(quantityInput);


    // ==============================================
    // VALIDATE QUANTITY
    // ==============================================

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        showBotMessage(
            "❌ Please enter a valid quantity."
        );

        return;

    }


    if (
        quantity > stock
    ) {

        showBotMessage(
            `❌ Only ${stock} items are available.`
        );

        return;

    }


    // ==============================================
    // CONFIRM ORDER
    // ==============================================

    const total =
        price * quantity;


    const confirmOrder =
        confirm(
            `Confirm Order\n\n` +

            `Product: ${productName}\n` +

            `Price: ₹${price}\n` +

            `Quantity: ${quantity}\n` +

            `Total: ₹${total}\n\n` +

            `Customer: ${customerName}`
        );


    if (!confirmOrder) {

        return;

    }


    // ==============================================
    // CREATE ORDER API
    // ==============================================

    try {

        const response =
            await fetch(
                `${API_URL}/orders`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        customer_name:
                            customerName.trim(),

                        product_id:
                            productId,

                        quantity:
                            quantity

                    })

                }
            );


        const data =
            await response.json();


        // ==========================================
        // ORDER ERROR
        // ==========================================

        if (!response.ok) {

            showBotMessage(
                `❌ ${data.detail || "Order failed."}`
            );

            return;

        }


        // ==========================================
        // ORDER SUCCESS
        // ==========================================

        showBotMessage(

            `✅ Order confirmed!\n\n` +

            `Order ID: #${data.order_id}\n` +

            `Customer: ${data.customer_name}\n` +

            `Product: ${data.product}\n` +

            `Quantity: ${data.quantity}\n` +

            `Total: ₹${data.total_price}\n\n` +

            `Status: ${data.status}`

        );


        // ==========================================
        // REFRESH PRODUCT LIST
        // ==========================================

        console.log(
            "Order created:",
            data
        );

    }


    catch (error) {

        console.error(
            "Order error:",
            error
        );


        showBotMessage(
            "❌ Unable to create order. Please check backend."
        );

    }

}


// ==================================================
// SHOW BOT MESSAGE
// ==================================================

function showBotMessage(message) {

    const chatBox =
        document.getElementById(
            "chatBox"
        );


    const botMessage =
        document.createElement(
            "div"
        );


    botMessage.className =
        "message bot";


    botMessage.innerText =
        message;


    chatBox.appendChild(
        botMessage
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// ==================================================
// ENTER KEY
// ==================================================

function handleEnter(event) {

    if (
        event.key === "Enter"
    ) {

        sendMessage();

    }

}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==================================================
// ESCAPE JAVASCRIPT
// ==================================================

function escapeJS(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /"/g,
            '\\"'
        );

}