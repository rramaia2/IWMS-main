// Populate the month dropdown
const monthDropdown = document.getElementById('monthDropdown');
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index + 1; // Assuming your database uses month numbers
    option.textContent = month;
    monthDropdown.appendChild(option);
});
const usernameDisplayElement = document.getElementById('usernamePlaceholder');
    const userID = localStorage.getItem("userID");
    const storedUsername = localStorage.getItem('username');
    
    if (usernameDisplayElement && storedUsername) {
        usernameDisplayElement.textContent = storedUsername;
    }
// Function to fetch and display orders
function fetchAndDisplayOrders(month) {
    fetch('/sorted-orders?month=' + month)
    .then(response => response.json())
    .then(data => {
        const ordersTableBody = document.getElementById('ordersTable').getElementsByTagName('tbody')[0];
        ordersTableBody.innerHTML = ''; // Clear existing table data

        // Populate table with new data
        data.forEach(order => {
            const row = ordersTableBody.insertRow();
            const productNameCell = row.insertCell(0);
            const orderCountCell = row.insertCell(1);
            productNameCell.textContent = order.product_name;
            orderCountCell.textContent = order.order_count;
        });
    })
    .catch(error => console.error('Error fetching sorted orders:', error));
}

// Event listener for when the month changes
monthDropdown.addEventListener('change', (event) => {
    const selectedMonth = event.target.value;
    fetchAndDisplayOrders(selectedMonth);
});

// Initial fetch for the current month
fetchAndDisplayOrders(new Date().getMonth() + 1);