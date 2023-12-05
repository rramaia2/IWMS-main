const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mysql = require("mysql");

const app = express();
const port = 3000;

// Use express-session middleware
app.use(
  session({
    secret: "your-secret-key", // replace with a strong secret
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Set EJS as the view engine
app.set("view engine", "ejs");

const db = mysql.createConnection({
  host: '127.0.0.1',
  port: '3306',
  user: 'raghava',
  password: 'Pqmz@1234567',
  database: 'iwms',
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database: ", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Route for user registration
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store the user in the database
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error registering user: ", err);
        res.status(500).send("Error registering user");
      } else {
        console.log("User registered successfully");
        res.status(200).send("User registered successfully");
      }
    });
  } catch (error) {
    console.error("Error hashing password: ", error);
    res.status(500).send("Error hashing password");
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql =
    "SELECT user_id, username, usertype, password FROM users WHERE username = ?";

  db.query(sql, [username], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      bcrypt.compare(password, results[0].password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          req.session.userID = results[0].user_id;
          req.session.username = results[0].username;
          req.session.usertype = results[0].usertype;

          res.json({
            userId: results[0].user_id,
            username: results[0].username,
            usertype: results[0].usertype,
          });
        } else {
          res.status(401).json({
            error: "Incorrect username and/or password!",
          });
        }
      });
    } else {
      res.status(401).json({
        error: "Incorrect username and/or password!",
      });
    }
  });
});


app.post("/dashboard", async (req, res) => {
  const { username, password } = req.body;

  // Check if the provided username exists
  const sql = "SELECT password,user_id FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("Error checking user credentials: ", err);
      res.status(500).send("Error checking user credentials");
    } else if (results.length > 0) {
      // Compare the provided password with the stored hashed password
      const match = await bcrypt.compare(password, results[0].password);

      if (match) {
        // Redirect to the dashboard and pass the username as a parameter
        // Additionally, pass the product data to the dashboard
        res.send({ username, userId: results[0].user_id }).status(200);
        // res.render('dashboard', { username, products: await getProductsFromDatabase() });
      } else {
        res.send("Login failed. Please check your credentials.");
      }
    } else {
      res.send("Login failed. Please check your credentials.");
    }
  });
});

// get dashboard
app.get("/dashboard", async (req, res) => {
  const username = req.query.username;
  res.render("dashboard", {
    username,
    products: await getProductsFromDatabase(),
  });
});

// Route for user logout
app.get("/logout", (req, res) => {
  // Redirect to the login page
  res.redirect("/public/index.html");
});

// Route to render the products page
app.get("/products", (req, res) => {
  res.sendFile(__dirname + "/public/products.html");
});

// Route to render the customer page
app.get("/customer", (req, res) => {
  res.sendFile(__dirname + "/public/customer.html");
});

// Route to render the orders page
app.get("/orders", (req, res) => {
  res.sendFile(__dirname + "/public/orders.html");
});

// Route to place an order
// Route to place an order
app.post("/place-order", (req, res) => {
  // Now including user_id in the destructuring assignment
  const { productName, quantity, userID, productId } = req.body;

  // Modify your SQL query to include the user_id column (correcting the column name)
  const sql =
    "INSERT INTO orders (product_name, quantity, user_id, product_id) VALUES (?, ?, ?, ?)";
  db.query(sql, [productName, quantity, userID, productId], (err, result) => {
    if (err) {
      console.error("Error placing order in the database: ", err);
      res.status(500).send("Error placing order in the database");
    } else {
      const getQty = "SELECT quantity from products where product_id=?";
      db.query(getQty, [productId], (err, result) => {
        if (err) {
          console.error("Error placing order in the database: ", err);
          res.status(500).send("Error placing order in the database");
        } else {
          const qty = result[0].quantity - quantity;

          const updateQty = "update products set quantity=? where product_id=?";
          db.query(updateQty, [qty, productId], (err, result) => {
            if (err) {
              console.error("Error placing order in the database: ", err);
              res.status(500).send("Error placing order in the database");
            } else {
              console.log("Order placed in the database successfully");
              res.send("Order placed successfully");
            }
          });
        }
      });
    }
  });
});

// Route to get the order list from the database
app.get("/get-orders", async (req, res) => {
  const orders = await getOrdersFromDatabase();
  res.json(orders);
});

// Function to get orders from the database
async function getOrdersFromDatabase() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM orders";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error getting order list from the database: ", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Route to add a product
app.post("/add-product", (req, res) => {
  const { productName, price, quantity } = req.body;

  const product = {
    name: productName,
    price: parseFloat(price),
    quantity: parseInt(quantity),
  };

  // Check if the product already exists in the database
  const checkExistingSql =
    "SELECT product_id, quantity FROM products WHERE name = ? AND price = ?";
  db.query(checkExistingSql, [product.name, product.price], (err, results) => {
    if (err) {
      console.error("Error checking existing product: ", err);
      res.status(500).send("Error checking existing product");
    } else if (results.length > 0) {
      // Product already exists, update quantity
      const existingProductId = results[0].product_id;
      const existingQuantity = results[0].quantity;
      const newQuantity = existingQuantity + product.quantity;

      const updateSql = "UPDATE products SET quantity = ? WHERE product_id = ?";
      db.query(updateSql, [newQuantity, existingProductId], (updateErr) => {
        if (updateErr) {
          console.error("Error updating product quantity: ", updateErr);
          res.status(500).send("Error updating product quantity");
        } else {
          console.log("Product quantity updated successfully");
          res.send("Product quantity updated successfully");
        }
      });
    } else {
      // Product does not exist, add a new product
      const insertSql =
        "INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)";
      db.query(
        insertSql,
        [product.name, product.price, product.quantity],
        (insertErr) => {
          if (insertErr) {
            console.error("Error adding new product: ", insertErr);
            res.status(500).send("Error adding new product");
          } else {
            console.log("New product added successfully");
            res.send("New product added successfully");
          }
        }
      );
    }
  });
});

// Route to delete a product by ID
app.delete("/delete-product/:product_id", (req, res) => {
  const productId = req.params.product_id;

  const sql = "DELETE FROM products WHERE product_id = ?";
  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error("Error deleting product from the database: ", err);
      res.status(500).send("Error deleting product from the database");
    } else {
      console.log("Product deleted from the database successfully");
      res.send("Product deleted successfully");
    }
  });
});

// Route to get the product list from the database
app.get("/get-products", async (req, res) => {
  const products = await getProductsFromDatabase();
  res.json(products);
});

// Route to get product availability
app.get("/get-product-availability", async (req, res) => {
  try {
    const products = await getProductsFromDatabase();
    const availability = products.map((product) => ({
      product_id: product.product_id,
      name: product.name,
      availability: product.quantity > 0 ? "In Stock" : "Out of Stock",
    }));
    res.json(availability);
  } catch (error) {
    console.error("Error getting product availability: ", error);
    res.status(500).send("Error getting product availability");
  }
});

app.get("/get-username/:user_id", (req, res) => {
  const userId = req.params.user_id;
  const sql = "SELECT username FROM users WHERE user_id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error getting username from the database: ", err);
      res.status(500).json({ error: "Error getting username" });
    } else {
      const username = result[0] ? result[0].username : "Unknown";
      res.json({ username });
    }
  });
});

// Function to get products from the database
async function getProductsFromDatabase() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM products";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error getting product list from the database: ", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}




// Helper function to check user role
const checkUserRole = (userId, callback) => {
    const sql = "SELECT userrole FROM users WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results.length > 0 ? results[0].userrole : null);
      }
    });
  };
  
  // New route to serve analysis page
  app.get("/analysis", (req, res) => {
    // Replace the following line with the correct method to retrieve userID from your local storage
    const userId = req.session.userID; // Or retrieve userID from local storage if using JWT or similar
    if (!userId) {
      res.redirect("/public/index.html"); // Redirect if not logged in
      return;
    }
  
    checkUserRole(userId, (err, userrole) => {
      if (err) {
        console.error("Error checking user role: ", err);
        res.status(500).send("Error checking user role");
      } else if (userrole === "admin" || userrole === "root") {
        res.sendFile(__dirname + "/public/analysis.html");
      } else {
        res.send('<script>alert("You are restricted"); window.location.href = "/dashboard";</script>');
      }
    });
  });


        
  
  app.get("/sorted-orders", (req, res) => {
    const selectedMonth = parseInt(req.query.month);
    const sql = `
        SELECT product_name, COUNT(*) as order_count
        FROM orders
        WHERE MONTH(order_date) = ?
        GROUP BY product_name
        ORDER BY order_count DESC`;

    db.query(sql, [selectedMonth], (err, results) => {
        if (err) {
            console.error("Error getting sorted orders: ", err);
            res.status(500).send("Error retrieving orders");
        } else {
            res.json(results);
        }
    });
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
