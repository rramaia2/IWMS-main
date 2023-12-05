// Product management JavaScript logic
document.addEventListener('DOMContentLoaded', function () {
    const usernameDisplayElement = document.getElementById('usernamePlaceholder');
    const storedUsername = localStorage.getItem('username');
    if (usernameDisplayElement && storedUsername) {
        usernameDisplayElement.textContent = storedUsername;
    }
    const addProductForm = document.getElementById('add-product-form');
    const productList = document.getElementById('product-list');

    // Function to add a new product to the table
// products.js


function addProductToTable(product) {
    const existingProductRow = Array.from(productList.getElementsByTagName('tr')).find(
        (row) =>
            row.cells[1].textContent === product.name &&
            row.cells[2].textContent === `$${product.price}`
    );

    if (existingProductRow) {
        // Product already exists, update quantity
        const existingQuantity = parseInt(existingProductRow.cells[3].textContent);
        existingProductRow.cells[3].textContent = existingQuantity + product.quantity;
    } else {
        // Product does not exist, add a new row
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${product.product_id}</td>
                        <td>${product.name}</td>
                        <td>$${product.price}</td>
                        <td>${product.quantity}</td>
                        <td><button class="delete-button" data-id="${product.product_id}">Delete</button></td>`;

        tr.querySelector('.delete-button').addEventListener('click', () => {
            // Call the server to remove the product
            const productId = tr.querySelector('.delete-button').getAttribute('data-id');
            deleteProduct(productId);
            tr.remove();
        });

        productList.appendChild(tr);
    }
}



    // Function to handle form submission
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const productName = addProductForm.querySelector('input[name="productName"]').value;
        const price = addProductForm.querySelector('input[name="price"]').value;
        const quantity = addProductForm.querySelector('input[name="quantity"]').value;

        // Call the server to add the product
        addProductToServer(productName, price, quantity);
        addProductForm.reset();
    });

    // Function to add a product to the server
    function addProductToServer(name, price, quantity) {
        fetch('/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productName: name, price: price, quantity: quantity }),
        })
            .then((response) => response.text())
            .then((message) => {
                console.log(message);
                // Assuming the product was successfully added, add it to the table
                getProductsFromServer();
            })
            .catch((error) => console.error(error));
    }

    // Function to delete a product on the server
    function deleteProduct(productId) {
        fetch(`/delete-product/${productId}`, {
            method: 'DELETE',
        })
            .then((response) => response.text())
            .then((message) => {
                console.log(message);
            })
            .catch((error) => console.error(error));
    }

    // Function to get products from the server and add them to the table
    function getProductsFromServer() {
        fetch('/get-products')
            .then((response) => response.json())
            .then((products) => {
                // Clear the existing table before adding products
                productList.innerHTML = '';

                products.forEach((product) => {
                    addProductToTable(product);
                });
            })
            .catch((error) => console.error(error));
    }

    // Load existing products from the server on page load
    getProductsFromServer();
});
