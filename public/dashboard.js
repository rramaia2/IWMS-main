// dashboard.js

document.addEventListener('DOMContentLoaded', function () {
    const productList = document.getElementById('product-list');
    const barGraphCanvas = document.getElementById('barGraph');
    const pieChartCanvas = document.getElementById('pieChart');

    const usernameDisplayElement = document.getElementById('usernamePlaceholder');
    const storedUsername = localStorage.getItem('username');
    if (usernameDisplayElement && storedUsername) {
        usernameDisplayElement.textContent = storedUsername;
    }

    function addProductToTable(product) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${product.product_id}</td><td>${product.name}</td><td>$${product.price}</td>`;

        productList.appendChild(tr);
    }

    function createBarGraph(products) {
        const productPrices = products.map(product => product.price);
        const ctx = barGraphCanvas.getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: products.map(product => product.name),
                datasets: [{
                    label: 'Product Prices',
                    data: productPrices,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function createPieChart(products) {
        const productPrices = products.map(product => product.price);
        const ctx = pieChartCanvas.getContext('2d');

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: products.map(product => product.name),
                datasets: [{
                    data: productPrices,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    hoverOffset: 4
                }]
            }
        });
    }

    async function getProductsFromServer() {
        const response = await fetch('/get-products');
        const products = await response.json();

        productList.innerHTML = '';

        products.forEach(product => {
            addProductToTable(product);
        });

        // Create the graphs
        createBarGraph(products);
        createPieChart(products);
    }

    getProductsFromServer();
});
