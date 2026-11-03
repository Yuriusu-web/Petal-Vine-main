"use strict";

/*
 * PETAL & VINE - FLOWER BOUTIQUE MANAGEMENT SYSTEM
 *
 * DATA STRUCTURES:
 * 1. Array - stores flower products.
 * 2. Queue - manages customer orders (FIFO).
 * 3. Stack - stores completed transactions (LIFO).
 *
 * STORAGE:
 * Browser Local Storage.
 * No database required.
 */

// ========================================
// STORAGE CONFIGURATION
// ========================================

const STORAGE_KEYS = {
  products: "pv_ds_products",
  orders: "pv_ds_order_queue",
  transactions: "pv_ds_transaction_stack",
  nextProduct: "pv_ds_next_product",
  nextOrder: "pv_ds_next_order",
  nextTransaction: "pv_ds_next_transaction"
};

// Administrator credentials for demonstration
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "petal123";

const LOW_STOCK_LIMIT = 5;

// Shortcut for selecting HTML elements
const $ = (id) => document.getElementById(id);

// ========================================
// DATA STRUCTURES
// ========================================

// ARRAY: Stores flower products
let products = [];

// QUEUE: Stores pending customer orders
let orderQueue = [];

// STACK: Stores completed transactions
let transactionStack = [];

let toastTimer = null;

// ========================================
// LOAD AND SAVE DATA
// ========================================

function loadData() {
  products = readStoredArray(STORAGE_KEYS.products);
  orderQueue = readStoredArray(STORAGE_KEYS.orders);
  transactionStack = readStoredArray(STORAGE_KEYS.transactions);

  // Add sample products when no product data exists
  if (products.length === 0) {
    products = [
      {
        id: "F001",
        name: "Classic Red Roses",
        category: "Roses",
        price: 850,
        stock: 20
      },
      {
        id: "F002",
        name: "Pink Tulip Bouquet",
        category: "Tulips",
        price: 720,
        stock: 15
      },
      {
        id: "F003",
        name: "Golden Sunflowers",
        category: "Sunflowers",
        price: 600,
        stock: 12
      },
      {
        id: "F004",
        name: "White Lily Bundle",
        category: "Lilies",
        price: 950,
        stock: 8
      },
      {
        id: "F005",
        name: "Purple Orchid Arrangement",
        category: "Orchids",
        price: 1200,
        stock: 4
      }
    ];

    saveAll();
  }

  setCounterIfMissing(
    STORAGE_KEYS.nextProduct,
    nextNumericId(products, "F")
  );

  setCounterIfMissing(
    STORAGE_KEYS.nextOrder,
    nextNumericId(orderQueue, "O")
  );

  setCounterIfMissing(
    STORAGE_KEYS.nextTransaction,
    nextNumericId(transactionStack, "T")
  );
}

// Safely retrieve stored arrays
function readStoredArray(key) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(value) ? value : [];

  } catch (error) {
    console.warn(
      "Stored data could not be read:",
      key,
      error
    );

    return [];
  }
}

// Save all data to browser storage
function saveAll() {
  try {
    localStorage.setItem(
      STORAGE_KEYS.products,
      JSON.stringify(products)
    );

    localStorage.setItem(
      STORAGE_KEYS.orders,
      JSON.stringify(orderQueue)
    );

    localStorage.setItem(
      STORAGE_KEYS.transactions,
      JSON.stringify(transactionStack)
    );

  } catch (error) {
    showToast(
      "Unable to save data. Check browser storage."
    );
  }
}

// Set an ID counter when it does not exist
function setCounterIfMissing(key, value) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, String(value));
  }
}

// Find the next available numeric ID
function nextNumericId(list, prefix) {
  const highest = list.reduce((max, item) => {
    const number = Number(
      String(item.id || "").replace(prefix, "")
    );

    return Number.isFinite(number)
      ? Math.max(max, number)
      : max;

  }, 0);

  return highest + 1;
}

// Generate unique IDs
function makeId(prefix, key) {
  let number = Number(
    localStorage.getItem(key)
  ) || 1;

  const id = prefix +
    String(number).padStart(3, "0");

  localStorage.setItem(
    key,
    String(number + 1)
  );

  return id;
}

// ========================================
// GENERAL HELPER FUNCTIONS
// ========================================

// Escape user input before displaying it
function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]
  );
}

// Philippine peso currency format
function money(value) {
  return Number(value).toLocaleString(
    "en-PH",
    {
      style: "currency",
      currency: "PHP"
    }
  );
}

// Display notification
function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// Display form messages
function setMessage(id, message, type) {
  const element = $(id);

  element.textContent = message;
  element.className = "message " + (type || "");
}

// ========================================
// ADMIN LOGIN AND LOGOUT
// ========================================

function showLogin() {
  $("loginScreen").classList.remove("hidden");
  $("app").classList.add("hidden");

  $("username").focus();
}

function showApp() {
  $("loginScreen").classList.add("hidden");
  $("app").classList.remove("hidden");

  renderAll();
}

// Validate administrator login
function handleLogin(event) {
  event.preventDefault();

  const username = $("username").value.trim();
  const password = $("password").value;

  if (
    username === DEMO_USERNAME &&
    password === DEMO_PASSWORD
  ) {
    sessionStorage.setItem(
      "pv_ds_authenticated",
      "true"
    );

    $("loginError").textContent = "";

    $("loginForm").reset();

    showApp();

  } else {
    $("loginError").textContent =
      "Invalid username or password. Please try again.";

    $("password").value = "";
    $("password").focus();
  }
}

// Administrator logout
function logout() {
  sessionStorage.removeItem(
    "pv_ds_authenticated"
  );

  showLogin();
}

// ========================================
// MAIN MENU NAVIGATION
// ========================================

function navigate(viewName) {

  const allowedViews = [
    "dashboard",
    "products",
    "orders",
    "transactions",
    "inventory"
  ];

  if (!allowedViews.includes(viewName)) {
    return;
  }

  document.querySelectorAll(".view").forEach(view => {
    view.classList.add("hidden");
  });

  $(viewName + "View").classList.remove("hidden");

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.view === viewName
    );
  });

  const titles = {
    dashboard: "Dashboard",
    products: "Flower Products",
    orders: "Customer Orders",
    transactions: "Transaction History",
    inventory: "Inventory"
  };

  $("pageTitle").textContent = titles[viewName];

  renderAll();
}

// ========================================
// PRODUCT ARRAY OPERATIONS
// ========================================

// ADD PRODUCT
function addProduct(productData) {

  const duplicate = products.some(product =>
    product.name.toLowerCase() ===
    productData.name.toLowerCase()
  );

  if (duplicate) {
    return {
      ok: false,
      message: "A product with this name already exists."
    };
  }

  const product = {
    id: makeId("F", STORAGE_KEYS.nextProduct),
    ...productData
  };

  products.push(product);

  saveAll();

  return {
    ok: true,
    message: "Flower product added successfully."
  };
}

// SEARCH PRODUCT
function findProduct(productId) {
  return products.find(
    product => product.id === productId
  );
}

// UPDATE PRODUCT
function updateProduct(productId, updatedData) {

  const index = products.findIndex(
    product => product.id === productId
  );

  if (index === -1) {
    return false;
  }

  const duplicate = products.some(product =>
    product.id !== productId &&
    product.name.toLowerCase() ===
    updatedData.name.toLowerCase()
  );

  if (duplicate) {
    return false;
  }

  products[index] = {
    ...products[index],
    ...updatedData
  };

  saveAll();

  return true;
}

// DELETE PRODUCT
function deleteProduct(productId) {

  const hasPendingOrder = orderQueue.some(
    order => order.productId === productId
  );

  if (hasPendingOrder) {
    showToast(
      "Cannot delete: this product has a pending order."
    );

    return;
  }

  const index = products.findIndex(
    product => product.id === productId
  );

  if (index === -1) {
    return;
  }

  products.splice(index, 1);

  saveAll();
  renderAll();

  showToast("Product deleted.");
}

// HANDLE PRODUCT FORM
function handleProductSubmit(event) {
  event.preventDefault();

  const id = $("editProductId").value;

  const name = $("productName").value.trim();

  const category = $("productCategory").value;

  const price = Number(
    $("productPrice").value
  );

  const stock = Number(
    $("productStock").value
  );

  // INPUT VALIDATION
  if (
    !name ||
    !category ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    setMessage(
      "productMessage",
      "Enter a valid name, category, positive price, and whole-number stock (zero or more).",
      "error"
    );

    return;
  }

  const data = {
    name,
    category,
    price: Number(price.toFixed(2)),
    stock
  };

  // UPDATE EXISTING PRODUCT
  if (id) {

    const success = updateProduct(id, data);

    if (!success) {
      setMessage(
        "productMessage",
        "Update failed. Check for a duplicate product name.",
        "error"
      );

      return;
    }

    setMessage(
      "productMessage",
      "Product updated successfully.",
      "success"
    );

  } else {

    // ADD NEW PRODUCT
    const result = addProduct(data);

    if (!result.ok) {
      setMessage(
        "productMessage",
        result.message,
        "error"
      );

      return;
    }

    setMessage(
      "productMessage",
      result.message,
      "success"
    );
  }

  resetProductForm();
  renderAll();
}

// LOAD PRODUCT DETAILS FOR EDITING
function beginEditProduct(productId) {

  const product = findProduct(productId);

  if (!product) {
    return;
  }

  $("editProductId").value = product.id;

  $("productName").value = product.name;

  $("productCategory").value = product.category;

  $("productPrice").value = product.price;

  $("productStock").value = product.stock;

  $("productFormTitle").textContent =
    "Update Flower Product";

  $("saveProductBtn").textContent =
    "Save Changes";

  $("cancelEditBtn").classList.remove("hidden");

  $("productName").focus();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// RESET PRODUCT FORM
function resetProductForm() {

  $("productForm").reset();

  $("editProductId").value = "";

  $("productFormTitle").textContent =
    "Add Flower Product";

  $("saveProductBtn").textContent =
    "Add Product";

  $("cancelEditBtn").classList.add("hidden");
}

// ========================================
// ORDER QUEUE OPERATIONS (FIFO)
// ========================================

// ENQUEUE: Add order to the rear
function enqueueOrder(order) {

  orderQueue.push(order);

  saveAll();
}

// DEQUEUE: Remove order from the front
function dequeueOrder() {

  return orderQueue.shift() || null;
}

// PLACE CUSTOMER ORDER
function placeOrder(event) {
  event.preventDefault();

  const customer =
    $("customerName").value.trim();

  const productId =
    $("orderProduct").value;

  const quantity =
    Number($("orderQuantity").value);

  const product = findProduct(productId);

  // CUSTOMER NAME VALIDATION
  if (
    customer.length < 2 ||
    !/^[\p{L}\p{M} .'-]+$/u.test(customer)
  ) {
    setMessage(
      "orderMessage",
      "Enter a valid customer name (letters, spaces, apostrophes, or hyphens only).",
      "error"
    );

    return;
  }

  // PRODUCT AND QUANTITY VALIDATION
  if (
    !product ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    setMessage(
      "orderMessage",
      "Select a valid flower product and enter a whole-number quantity of at least 1.",
      "error"
    );

    return;
  }

  // CHECK QUANTITIES ALREADY IN THE QUEUE
  const alreadyQueued = orderQueue
    .filter(order => order.productId === productId)
    .reduce(
      (total, order) => total + order.quantity,
      0
    );

  // PREVENT EXCEEDING AVAILABLE STOCK
  if (quantity + alreadyQueued > product.stock) {

    setMessage(
      "orderMessage",
      `Not enough stock. Available after pending orders: ${Math.max(
        0,
        product.stock - alreadyQueued
      )}.`,
      "error"
    );

    return;
  }

  // CREATE ORDER
  const order = {
    id: makeId("O", STORAGE_KEYS.nextOrder),
    customer,
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    total: Number(
      (product.price * quantity).toFixed(2)
    ),
    createdAt: new Date().toISOString()
  };

  // ADD ORDER TO QUEUE
  enqueueOrder(order);

  $("orderForm").reset();

  $("orderQuantity").value = "1";

  setMessage(
    "orderMessage",
    `Order ${order.id} added to the queue.`,
    "success"
  );

  renderAll();
}

// PROCESS NEXT ORDER
function processNextOrder() {

  if (orderQueue.length === 0) {

    showToast(
      "There are no pending orders to process."
    );

    return;
  }

  // CHECK THE FIRST ORDER
  const nextOrder = orderQueue[0];

  const product = findProduct(
    nextOrder.productId
  );

  // VERIFY STOCK
  if (
    !product ||
    product.stock < nextOrder.quantity
  ) {
    showToast(
      "Order cannot be processed because stock is insufficient. Update inventory first."
    );

    return;
  }

  // REMOVE THE FIRST ORDER FROM THE QUEUE
  const processedOrder = dequeueOrder();

  // UPDATE INVENTORY
  product.stock -= processedOrder.quantity;

  // CREATE TRANSACTION RECORD
  const transaction = {
    id: makeId("T", STORAGE_KEYS.nextTransaction),
    orderId: processedOrder.id,
    customer: processedOrder.customer,
    productName: processedOrder.productName,
    quantity: processedOrder.quantity,
    total: processedOrder.total,
    processedAt: new Date().toISOString()
  };

  // PUSH TRANSACTION ONTO STACK
  transactionStack.push(transaction);

  saveAll();

  renderAll();

  showToast(
    `${processedOrder.id} processed successfully.`
  );
}

// CANCEL PENDING ORDER
function cancelOrder(orderId) {

  const index = orderQueue.findIndex(
    order => order.id === orderId
  );

  if (index === -1) {
    return;
  }

  orderQueue.splice(index, 1);

  saveAll();

  renderAll();

  showToast("Pending order cancelled.");
}

// ========================================
// TRANSACTION STACK OPERATIONS (LIFO)
// ========================================

// Display the newest transaction first
function getTransactionsNewestFirst() {

  return [...transactionStack].reverse();
}

// ========================================
// DISPLAY AND RENDER FUNCTIONS
// ========================================

function renderAll() {

  renderDashboard();

  renderProducts();

  renderOrderFormOptions();

  renderOrders();

  renderTransactions();

  renderInventory();
}

// DASHBOARD
function renderDashboard() {

  $("statProducts").textContent =
    products.length;

  $("statStock").textContent =
    products.reduce(
      (sum, product) => sum + product.stock,
      0
    );

  $("statOrders").textContent =
    orderQueue.length;

  const sales = transactionStack.reduce(
    (sum, transaction) =>
      sum + transaction.total,
    0
  );

  $("statSales").textContent = money(sales);
}

// PRODUCT TABLE
function renderProducts() {

  const search = $("productSearch")
    .value.trim()
    .toLowerCase();

  const filtered = products.filter(product =>
    product.id.toLowerCase().includes(search) ||
    product.name.toLowerCase().includes(search) ||
    product.category.toLowerCase().includes(search)
  );

  $("productTable").innerHTML =
    filtered.map(product => `
      <tr>
        <td><b>${escapeHTML(product.id)}</b></td>

        <td>${escapeHTML(product.name)}</td>

        <td>${escapeHTML(product.category)}</td>

        <td>${money(product.price)}</td>

        <td>${product.stock}</td>

        <td>
          <button class="table-action"
            data-edit="${escapeHTML(product.id)}">
            Edit
          </button>

          <button class="table-action delete"
            data-delete="${escapeHTML(product.id)}">
            Delete
          </button>
        </td>
      </tr>
    `).join("");

  $("emptyProducts").classList.toggle(
    "hidden",
    filtered.length > 0
  );
}

// ORDER PRODUCT DROPDOWN
function renderOrderFormOptions() {

  const select = $("orderProduct");

  const previous = select.value;

  const available = products.filter(
    product => product.stock > 0
  );

  select.innerHTML =
    '<option value="">Choose a flower product</option>' +

    available.map(product => `
      <option value="${escapeHTML(product.id)}">
        ${escapeHTML(product.name)} —
        ${money(product.price)}
        (Stock: ${product.stock})
      </option>
    `).join("");

  if (
    available.some(product => product.id === previous)
  ) {
    select.value = previous;
  }
}

// CUSTOMER ORDER TABLE
function renderOrders() {

  $("orderTable").innerHTML =
    orderQueue.map((order, index) => `
      <tr>

        <td>
          <span class="badge ${
            index === 0 ? "good" : "low"
          }">
            ${index === 0 ? "Next" : index + 1}
          </span>
        </td>

        <td><b>${escapeHTML(order.id)}</b></td>

        <td>${escapeHTML(order.customer)}</td>

        <td>${escapeHTML(order.productName)}</td>

        <td>${order.quantity}</td>

        <td>${money(order.total)}</td>

        <td>
          <button class="table-action delete"
            data-cancel="${escapeHTML(order.id)}">
            Cancel
          </button>
        </td>

      </tr>
    `).join("");

  $("emptyOrders").classList.toggle(
    "hidden",
    orderQueue.length > 0
  );

  $("queueCount").textContent =
    `${orderQueue.length} order${
      orderQueue.length === 1 ? "" : "s"
    }`;
}

// TRANSACTION TABLE
function renderTransactions() {

  const newestFirst =
    getTransactionsNewestFirst();

  $("transactionTable").innerHTML =
    newestFirst.map(transaction => `
      <tr>

        <td><b>${escapeHTML(transaction.id)}</b></td>

        <td>
          ${new Date(
            transaction.processedAt
          ).toLocaleString()}
        </td>

        <td>${escapeHTML(transaction.customer)}</td>

        <td>${escapeHTML(transaction.productName)}</td>

        <td>${transaction.quantity}</td>

        <td><b>${money(transaction.total)}</b></td>

      </tr>
    `).join("");

  $("emptyTransactions").classList.toggle(
    "hidden",
    newestFirst.length > 0
  );

  $("transactionCount").textContent =
    `${newestFirst.length} record${
      newestFirst.length === 1 ? "" : "s"
    }`;
}

// INVENTORY TABLE
function renderInventory() {

  const totalUnits = products.reduce(
    (sum, product) => sum + product.stock,
    0
  );

  $("inventoryUnits").textContent =
    `${totalUnits} units`;

  $("inventoryTable").innerHTML =
    products.map(product => {

      let status = "In Stock";
      let className = "good";

      if (product.stock === 0) {

        status = "Out of Stock";
        className = "out";

      } else if (product.stock <= LOW_STOCK_LIMIT) {

        status = "Low Stock";
        className = "low";
      }

      return `
        <tr>

          <td><b>${escapeHTML(product.id)}</b></td>

          <td>${escapeHTML(product.name)}</td>

          <td>${escapeHTML(product.category)}</td>

          <td>${product.stock}</td>

          <td>
            <span class="badge ${className}">
              ${status}
            </span>
          </td>

        </tr>
      `;

    }).join("");

  $("emptyInventory").classList.toggle(
    "hidden",
    products.length > 0
  );
}

// ========================================
// EVENT LISTENERS
// ========================================

// Login and logout
$("loginForm").addEventListener(
  "submit",
  handleLogin
);

$("logoutBtn").addEventListener(
  "click",
  logout
);

// Product management
$("productForm").addEventListener(
  "submit",
  handleProductSubmit
);

$("cancelEditBtn").addEventListener(
  "click",
  resetProductForm
);

// Customer orders
$("orderForm").addEventListener(
  "submit",
  placeOrder
);

$("processOrderBtn").addEventListener(
  "click",
  processNextOrder
);

// Product search
$("productSearch").addEventListener(
  "input",
  renderProducts
);

// Main navigation
$("mainNav").addEventListener("click", event => {

  const button = event.target.closest("[data-view]");

  if (button) {
    navigate(button.dataset.view);
  }
});

// Dashboard quick access buttons
document.querySelectorAll("[data-go]").forEach(button => {

  button.addEventListener("click", () => {
    navigate(button.dataset.go);
  });

});

// Product edit and delete buttons
$("productTable").addEventListener("click", event => {

  const editButton =
    event.target.closest("[data-edit]");

  const deleteButton =
    event.target.closest("[data-delete]");

  if (editButton) {
    beginEditProduct(editButton.dataset.edit);
  }

  if (
    deleteButton &&
    window.confirm(
      "Are you sure you want to delete this flower product?"
    )
  ) {
    deleteProduct(deleteButton.dataset.delete);
  }

});

// Cancel pending orders
$("orderTable").addEventListener("click", event => {

  const cancelButton =
    event.target.closest("[data-cancel]");

  if (
    cancelButton &&
    window.confirm("Cancel this pending order?")
  ) {
    cancelOrder(cancelButton.dataset.cancel);
  }

});

// ========================================
// INITIALIZE APPLICATION
// ========================================

$("year").textContent = new Date().getFullYear();

// Load saved products, orders, and transactions
loadData();

// Check administrator session
if (
  sessionStorage.getItem("pv_ds_authenticated") === "true"
) {
  showApp();
} else {
  showLogin();
}
