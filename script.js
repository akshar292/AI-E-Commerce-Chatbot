// =========================================================
// CONFIG
// =========================================================

const API_URL =
    "https://ai-e-commerce-chatbot.onrender.com";


// =========================================================
// OPEN ADMIN
// =========================================================

function openAdmin() {

    window.location.href = "admin.html";

}


// =========================================================
// ENTER KEY
// =========================================================

function handleEnter(event) {

    if (event.key === "Enter") {

        sendMessage();

    }

}


// =========================================================
// SEND MESSAGE
// =========================================================

async function sendMessage() {

    const input =
        document.getElementById("question");

    const question =
        input.value.trim();

    if (!question) {

        return;

    }


    addMessage(
        question,
        "user"
    );


    input.value = "";


    addMessage(
        "Searching for products... 🔎",
        "bot"
    );


    try {

        const response =
            await fetch(
                `${API_URL}/chat?question=${encodeURIComponent(question)}`
            );


        if (!response.ok) {

            throw new Error(
                "API request failed"
            );

        }


        const data =
            await response.json();


        removeLastBotMessage();


        displayResponse(data);


    }

    catch (error) {

        console.error(error);


        removeLastBotMessage();


        addMessage(
            "Sorry, something went wrong while connecting to the server. Please try again.",
            "bot"
        );

    }

}


// =========================================================
// DISPLAY RESPONSE
// =========================================================

function displayResponse(data) {

    if (data.type === "message") {

        addMessage(
            data.message,
            "bot"
        );

        return;

    }


    if (data.type === "not_found") {

        addMessage(
            data.message,
            "bot"
        );

        return;

    }


    if (data.type === "products") {

        addMessage(
            data.message,
            "bot"
        );


        data.products.forEach(
            product => {

                addProductCard(product);

            }
        );

    }

}


// =========================================================
// ADD MESSAGE
// =========================================================

function addMessage(
    text,
    sender
) {

    const chatBox =
        document.getElementById("chatBox");


    const message =
        document.createElement("div");


    message.className =
        `${sender} message`;


    message.innerHTML =
        text;


    chatBox.appendChild(
        message
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// =========================================================
// REMOVE LAST BOT MESSAGE
// =========================================================

function removeLastBotMessage() {

    const chatBox =
        document.getElementById("chatBox");


    const messages =
        chatBox.querySelectorAll(".bot");


    if (messages.length > 0) {

        messages[
            messages.length - 1
        ].remove();

    }

}


// =========================================================
// ADD PRODUCT CARD
// =========================================================

function addProductCard(product) {

    const chatBox =
        document.getElementById("chatBox");


    const card =
        document.createElement("div");


    card.className =
        "product";


    let imageHTML = "";


    if (product.image) {

        imageHTML = `
            <img
                src="${product.image}"
                alt="${product.name}"
            >
        `;

    }


    card.innerHTML = `

        ${imageHTML}

        <div class="product-info">

            <h3>
                ${product.name}
            </h3>

            <p class="price">
                ₹${product.price}
            </p>

            <p>
                Category:
                ${product.category}
            </p>

            <p>
                Stock:
                ${product.stock ?? "Available"}
            </p>

            <p class="description">
                ${product.description ?? ""}
            </p>

            ${product.rating
            ?
            `<p>⭐ ${product.rating}</p>`
            :
            ""
        }

            <button
                class="order-button"
                onclick="orderProduct(${product.id}, '${escapeQuotes(product.name)}')"
            >
                🛒 Order
            </button>

        </div>

    `;


    chatBox.appendChild(
        card
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;

}


// =========================================================
// ESCAPE QUOTES
// =========================================================

function escapeQuotes(text) {

    return String(text)
        .replace(/'/g, "\\'");

}


// =========================================================
// ORDER PRODUCT
// =========================================================

async function orderProduct(
    productId,
    productName
) {

    const customerName =
        prompt(
            `Enter your name to order ${productName}:`
        );


    if (!customerName) {

        return;

    }


    const quantityInput =
        prompt(
            "Enter quantity:",
            "1"
        );


    if (!quantityInput) {

        return;

    }


    const quantity =
        parseInt(
            quantityInput
        );


    if (
        isNaN(quantity) ||
        quantity <= 0
    ) {

        alert(
            "Please enter a valid quantity."
        );

        return;

    }


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
                            customerName,

                        product_id:
                            productId,

                        quantity:
                            quantity

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Order failed"
            );

        }


        alert(
            `Order confirmed!\n\nOrder ID: ${data.order_id}\nProduct: ${data.product}\nQuantity: ${data.quantity}\nTotal: ₹${data.total_price}`
        );


    }

    catch (error) {

        alert(
            error.message
        );

    }

}