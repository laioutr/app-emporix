# 🛍️ Laioutr Emporix Integration

This repository contains the official Emporix integration for the **Laioutr** framework. This connector provides a comprehensive set of features to connect your Laioutr application with an Emporix backend, enabling full e-commerce functionality.

This connector handles sessions, customer data, cart management, product retrieval, reviews, and more.

---

## ✨ Features

This integration provides a robust bridge to Emporix, supporting the following features:

### 👤 Customer & Session Management

- **Anonymous Sessions:** Track users and persist carts before they log in.

### 🛒 Cart Management

- **Get Current Cart:** Retrieve the active shopping cart for the current session.
- **Add Item to Cart:** Seamlessly add products and variants to the user's cart.

### 🗂️ Category & Navigation

- **Category List:** Fetch a flat list of all available categories.
- **Category Tree by Alias:** Retrieve a nested category structure by its alias (e.g., for building navigation menus).

### 📦 Product & Catalog

- **Get Product by Slug:** Retrieve detailed information for a single product.
- **Products by Category ID:** Get a list of all products within a specific category using its ID.
- **Products by Category Slug:** Get a list of all products within a specific category using its URL slug.
- **Product Variants:** Fetch all available variants (e.g., size, color) for a product.

---

## 🚀 Installation

_(You can replace this with your actual installation instructions)_

```bash
# Using npm
npm install @laioutr/emporix-connector

# Using yarn
yarn add @laioutr/emporix-connector
```

---

## ⚙️ Configuration & Usage

To get started, you need to configure the connector with your Emporix API credentials inside `nuxt.config.ts`. We recommend using environment variables:

```typescript
defineNuxtConfig({
  /* [...] */
  modules: ["@laioutr-app/emporix"],
  /* [...] */
  "@laioutr-app/emporix": {
    baseURL: "https://api.emporix.io",
    clientId: import.meta.env.EMPORIX_CLIENT_ID,
    clientSecret: import.meta.env.EMPORIX_CLIENT_SECRET,
    tenant: "laioutr",
  },
  /* [...] */
});
```

---

## 🤝 Contributing

Contributions are welcome\! Please feel free to submit a Pull Request or open an issue for bugs, feature requests, or improvements.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the [LICENSE\_NAME] License. See the `LICENSE` file for details.
