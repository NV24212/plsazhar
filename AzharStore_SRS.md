# Software Requirements Specification (SRS) for AzharStore

**Version 1.0**

**Date: 2025-09-16**

---

## 1. Introduction

### 1.1. Purpose
This document provides a detailed Software Requirements Specification (SRS) for **AzharStore**, a full-stack e-commerce application. The project is being developed to serve as the online storefront and management system for a real-world store.

### 1.2. Scope
The application provides a comprehensive set of core e-commerce functionalities out-of-the-box, including:
*   A complete admin dashboard for managing products, orders, and customers.
*   A customer-facing storefront for browsing products and making purchases.
*   User authentication and profile management.
*   A complete checkout and order processing workflow.

This SRS document covers the existing features and architecture of the `AzharStore` repository.

### 1.3. Overview
This document is organized to provide a clear understanding of the application's requirements. It details the overall description of the product, specific functional and non-functional requirements, UI/UX guidelines, and the underlying data model.

---

## 2. Overall Description

### 2.1. Product Perspective
AzharStore is a self-contained, full-stack web application built with a modern technology stack. It integrates a React/Vite frontend with a Node.js/Express backend and leverages Supabase for database and backend services. The application is being developed for a specific retail business.

### 2.2. Target Audience
The target audience for the **AzharStore** application includes:
*   **Customers:** Individuals browsing the store to purchase products.
*   **Store Administrators:** Staff responsible for managing products, processing orders, and overseeing store operations via the admin dashboard.

### 2.3. Operating Environment
The application is a web-based platform and is required to be fully functional on the latest stable versions of the following modern web browsers:
*   Google Chrome
*   Mozilla Firefox
*   Apple Safari
*   Microsoft Edge

The application is designed to be accessed on both desktop and mobile devices.

### 2.4. General Constraints
*   **Responsive Design:** The user interface must be mobile-first and fully responsive, adapting gracefully to a wide range of screen sizes from mobile phones to desktops. This is enforced through the use of Tailwind CSS.
*   **Cross-Browser Compatibility:** The application must provide a consistent look, feel, and functionality across all supported browsers.
*   **Accessibility:** The application should adhere to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. The use of the shadcn/ui component library, which is built on Radix UI, provides a strong foundation for meeting this requirement.
*   **Technology Stack:** The project is constrained to its existing technology stack (React, TypeScript, Node.js, Express, Supabase, Tailwind CSS) to ensure maintainability and consistency.

---

## 3. Specific Requirements

### 3.1. Functional Requirements

#### 3.1.1. Admin Authentication
*   **FR-1: Admin Login:** The application provides a simple login page for an administrator. Access is granted by providing a single, correct password. There is no customer-facing registration or login functionality.
*   **FR-2: Admin Information Management:** The administrator shall be able to change their password and update their contact email through the dashboard.

#### 3.1.2. Product & Category Management (Admin)
*   **FR-3: Product CRUD:** Administrators shall be able to Create, Read, Update, and Delete products in the system.
*   **FR-4: Product Details:** Product information shall include name, description, price, stock quantity, and associated category.
*   **FR-5: Product Image Upload:** Administrators shall be able to upload product images, which are handled by the server (using `multer`) and stored.
*   **FR-6: Category CRUD:** Administrators shall be able to Create, Read, Update, and Delete product categories.

#### 3.1.3. Storefront & Product Browsing (Public)
*   **FR-7: View Products:** All users shall be able to view a paginated list of products in the storefront.
*   **FR-8: Filter by Category:** Users shall be able to filter products by their assigned category.
*   **FR-9: View Product Details:** Users shall be able to click on a product to view its detailed information page.
*   **FR-10: Search Products:** The system should provide a mechanism for users to search for products by name.

#### 3.1.4. Shopping Cart and Guest Checkout
*   **FR-11: Add to Cart:** Users shall be able to add products to a shopping cart.
*   **FR-12: View and Modify Cart:** Users shall be able to view the contents of their cart, update item quantities, or remove items.
*   **FR-13: Guest Checkout Process:** Users shall initiate a checkout process from their cart as a guest. The process involves providing customer contact information (name, phone, address) and placing the order without creating an account.

#### 3.1.5. Order Management (Admin)
*   **FR-14: Admin Order Viewing:** Administrators shall be able to view a list of all orders placed in the system.
*   **FR-15: Update Order Status:** Administrators shall be able to update the status of an order (e.g., "Pending", "Shipped", "Delivered", "Cancelled").

#### 3.1.6. Admin Dashboard
*   **FR-16: Summary View:** Upon logging in, administrators shall be presented with a dashboard displaying high-level statistics (e.g., total revenue, number of orders, new customers).
*   **FR-17: Data Visualization:** The dashboard shall include charts and graphs (using `recharts`) to visualize sales trends and other key performance indicators over time.

### 3.2. Non-Functional Requirements

*   **NFR-1: Performance:**
    *   The application shall be optimized for fast load times. The use of Vite ensures efficient bundling and a fast development experience.
    *   Client-side data fetching shall be managed by TanStack React Query to provide caching, reduce redundant API calls, and improve perceived performance with features like stale-while-revalidate.
    *   The application should target a First Contentful Paint (FCP) of under 2.5 seconds on a standard broadband connection.
*   **NFR-2: Security:**
    *   The administrator password must be securely hashed using the `bcrypt` algorithm before being stored.
    *   The public-facing API for creating orders and customers should be protected against abuse (e.g., rate limiting).
    *   The admin-only API endpoints for managing products, orders, etc., should be protected to ensure they are not publicly accessible (Note: Current implementation lacks server-side protection on these routes).
    *   Sensitive credentials (API keys, database URLs) must be managed through environment variables and not hard-coded in the source.
*   **NFR-3: Usability:**
    *   The UI must be responsive and mobile-first, ensuring a seamless experience on all device sizes, as implemented with Tailwind CSS.
    *   The component library (shadcn/ui) provides a consistent, accessible, and intuitive set of building blocks for the user interface.
*   **NFR-4: Scalability:**
    *   The backend architecture (stateless Express server) is horizontally scalable.
    *   The use of Supabase provides a scalable backend and database infrastructure that can grow with user demand.
    *   The application is containerized using Docker, allowing for predictable and scalable deployments in various cloud environments.
*   **NFR-5: Maintainability:**
    *   The entire codebase is written in TypeScript, enforcing type safety and improving code quality and developer experience.
    *   Code is organized into distinct `client`, `server`, and `shared` directories, promoting a clear separation of concerns.
    *   The use of `Zod` for schema validation in the `shared` directory ensures data consistency between the frontend and backend.

### 3.3. UI/UX Requirements

*   **UI-1: Navigation Style:**
    *   The application utilizes distinct navigation patterns. The public storefront uses a primary top navigation bar, while the admin area employs a persistent sidebar layout (`DashboardLayout.tsx`, `sidebar.tsx`) for navigating management sections.
*   **UI-2: Interaction Style:**
    *   The system heavily favors a modern Single-Page Application (SPA) interaction model, using components like modals (`dialog.tsx`), drawers (`drawer.tsx`), and popovers (`popover.tsx`) to handle actions without full-page reloads.
*   **UI-3: Visual Design Guidelines:**
    *   **Styling:** The UI is built with Tailwind CSS, following a utility-first methodology.
    *   **Component Library:** The application uses `shadcn/ui`, which provides a consistent, modern, and accessible set of pre-built components.
    *   **Icons:** The `lucide-react` library is used for a clean and consistent set of icons throughout the application.
    *   **Themes:** The inclusion of `next-themes` indicates support for user-selectable themes, such as light and dark modes.
*   **UI-4: Responsive Behavior:**
    *   All interfaces are required to be fully responsive and mobile-first, ensuring usability across desktops, tablets, and mobile devices.
*   **UI-5: Error Handling & Feedback:**
    *   Forms utilize real-time, inline validation, managed by `react-hook-form` and `zod` resolvers.
    *   Asynchronous action feedback (e.g., success, error, loading states) is provided through non-intrusive toast notifications via `sonner`.
*   **UI-6: Micro-interactions:**
    *   The application requires smooth transitions and animations for interactive elements to improve the user experience. This is facilitated by libraries such as `framer-motion` and `tailwindcss-animate`.

---

## 4. Data Model and API

### 4.1. Data Entities
The core data entities are defined and validated using Zod schemas in the `shared/schema.ts` file. This ensures type safety and data consistency between the client and server.

*   **AdminUser:** (Singleton entity for the administrator)
    *   `id` (Primary Key)
    *   `email` (String, Unique)
    *   `hashedPassword` (String)
*   **Customer:** (Stores contact info for an order, not a user account)
    *   `customerId` (Primary Key)
    *   `name` (String)
    *   `phone` (String)
    *   `address` (String)
*   **Product:**
    *   `productId` (Primary Key)
    *   `name` (String)
    *   `description` (String)
    *   `price` (Number)
    *   `stockQuantity` (Integer)
    *   `imageUrl` (String)
    *   `categoryId` (Foreign Key to Category)
*   **Category:**
    *   `categoryId` (Primary Key)
    *   `name` (String)
*   **Order:**
    *   `orderId` (Primary Key)
    *   `customerId` (Foreign Key to Customer)
    *   `status` (Enum: 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED')
    *   `totalAmount` (Number)
    *   `createdAt` (Timestamp)
*   **OrderItem:** (Junction table for Orders and Products)
    *   `orderItemId` (Primary Key)
    *   `orderId` (Foreign Key to Order)
    *   `productId` (Foreign Key to Product)
    *   `quantity` (Integer)
    *   `priceAtPurchase` (Number)

### 4.2. Relationships
*   A **Customer** record is associated with one or more **Orders**.
*   A **Category** can have many **Products**.
*   An **Order** belongs to one **Customer**.
*   An **Order** can contain many **OrderItems**.
*   An **OrderItem** links to one specific **Product**.

### 4.3. API Style
The application exposes a **RESTful API** from the Express backend for all client-server communication. The API is organized around resources.

*   **Example Endpoints:**
    *   `POST /api/admin/login` - Authenticates the administrator.
    *   `GET /api/products` - Fetches a list of all products.
    *   `POST /api/customers` - Creates a new customer record for a guest checkout.
    *   `POST /api/orders` - Creates a new order for a guest checkout.
    *   `GET /api/admin/orders` - Fetches all orders for the admin dashboard.
    *   `PUT /api/admin/orders/:id` - Updates an order's status.
