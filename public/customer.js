// customer.js

document.addEventListener('DOMContentLoaded', function () {
    const usernameDisplayElement = document.getElementById('usernamePlaceholder');
    const userID = localStorage.getItem("userID");
    const storedUsername = localStorage.getItem('username');
    
    if (usernameDisplayElement && storedUsername) {
        usernameDisplayElement.textContent = storedUsername;
    }
    

    const placeOrderForm = document.getElementById('place-order-form');
    const productAvailabilityTable = document.getElementById('product-availability-table');
    const productNameInput = placeOrderForm.querySelector('input[name="productName"]');
    const productSuggestionsList = document.getElementById('productSuggestions');

    // Fetch product suggestions and populate datalist
    fetch('/get-products')
        .then((response) => response.json())
        .then((products) => {
            products.forEach((product) => {
                const option = document.createElement('option');
                option.value = product.name;
                option.setAttribute('data-value', product.product_id)
                productSuggestionsList.appendChild(option);
            });
        })
        .catch((error) => console.error(error));

    placeOrderForm.addEventListener('submit', function (e) {
        e.preventDefault();
        

        const productName = placeOrderForm.querySelector('input[name="productName"]').value;
        const quantity = placeOrderForm.querySelector('input[name="quantity"]').value;
               
        

        // Check if the product is available before placing the order
        checkProductAvailability(productName, quantity);
    });

    function checkProductAvailability(productName, quantity) {
        // Fetch the product availability from the server
        fetch('/get-product-availability')
            .then((response) => response.json())
            .then((availability) => {
                // Find the selected product's availability
                const selectedProductAvailability = availability.find((product) => product.name === productName);
    
                if (selectedProductAvailability && selectedProductAvailability.availability === "In Stock") {
                    // If the product is available, proceed to place the order
                    placeOrder(productName, quantity, userID);
                } else {
                    // If the product is not available or out of stock, show a pop-up message
                    alert(`${productName} is Out of Stock`);
                }
            })
            .catch((error) => console.error(error));
    }
    

    function placeOrder(productName, quantity, userID) {
        // Call the server to place the order
        userID = JSON.parse(localStorage.getItem('userId'))

        const datalist= document.querySelector('#productSuggestions')

        const option = datalist.querySelector(`option[value="${productName}"]`)

        const productId = option.getAttribute('data-value')
       
        fetch('/place-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Include the userID in the body of the request
            body: JSON.stringify({ productName, quantity, userID,productId }),
        })
            .then((response) => response.text())
            .then((message) => {
                console.log("message-placein orders table");
                // Assuming the order was successfully placed, you can update the order list on the customer page
                // Optionally, you can redirect to the orders page or update the orders dynamically
                // For simplicity, let's reload the page
                window.location.reload();
            })
            .catch((error) => console.error(error));
    }

    // Load and display product availability table
    fetch('/get-product-availability')
    .then((response) => response.json())
    .then((availability) => {
        displayProductAvailabilityTable(availability);
    })
    .catch((error) => console.error(error));

    function displayProductAvailabilityTable(availability) {
        const tableBody = productAvailabilityTable.querySelector('tbody');
        tableBody.innerHTML = '';

        availability.forEach((product) => {
            const tr = document.createElement('tr');
            // Corrected template literals usage
            tr.innerHTML = `<td>${product.product_id}</td><td>${product.name}</td><td>${product.availability}</td>`;
            tableBody.appendChild(tr);
        });
    }
});