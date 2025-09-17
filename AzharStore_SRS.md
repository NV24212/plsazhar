# Software Requirements Specification (SRS) for AzharStore

**Version 1.0**

**Date: 2025-09-16**

---

## 1. Introduction

### 1.1. Purpose
This document provides a detailed Software Requirements Specification (SRS) for **AzharStore**, a full-stack e-commerce application boilerplate. The project is designed to serve as a robust and scalable foundation for developers and businesses to build and deploy modern online stores or Point-of-Sale (POS) systems.

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
AzharStore is a self-contained, full-stack web application built with a modern technology stack. It integrates a React/Vite frontend with a Node.js/Express backend and leverages Supabase for database and backend services. It is designed to be a deployable template project.

### 2.2. Target Audience
The primary audience for this project includes:
*   **Developers:** Who need a feature-rich starter kit to accelerate the development of custom e-commerce solutions.
*   **Small to Medium-sized Businesses (SMBs):** Who require a cost-effective and scalable platform to launch an online store.

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

#### 3.1.1. User & Authentication Management
*   **FR-1: User Registration:** Users shall be able to create an account using an email address and a password. Passwords must be securely hashed on the backend (using `bcrypt`).
*   **FR-2: User Login:** Registered users shall be able to log in to the system using their email and password.
*   **FR-3: Admin Role:** The system shall support an "admin" role with elevated privileges for accessing the management dashboard.

#### 3.1.2. Product & Category Management (Admin)
*   **FR-4: Product CRUD:** Administrators shall be able to Create, Read, Update, and Delete products in the system.
*   **FR-5: Product Details:** Product information shall include name, description, price, stock quantity, and associated category.
*   **FR-6: Product Image Upload:** Administrators shall be able to upload product images, which are handled by the server (using `multer`) and stored.
*   **FR-7: Category CRUD:** Administrators shall be able to Create, Read, Update, and Delete product categories.

#### 3.1.3. Storefront & Product Browsing (Customer)
*   **FR-8: View Products:** All users (guest and registered) shall be able to view a paginated list of products in the storefront.
*   **FR-9: Filter by Category:** Users shall be able to filter products by their assigned category.
*   **FR-10: View Product Details:** Users shall be able to click on a product to view its detailed information page.
*   **FR-11: Search Products:** The system should provide a mechanism for users to search for products by name.

#### 3.1.4. Shopping Cart and Checkout
*   **FR-12: Add to Cart:** Users shall be able to add products to a shopping cart.
*   **FR-13: View and Modify Cart:** Users shall be able to view the contents of their cart, update item quantities, or remove items. The cart shall be accessible from a sidebar (`CartSidebar.tsx`).
*   **FR-14: Checkout Process:** Users shall be able to initiate a checkout process from their cart, providing necessary information to complete the order. This is handled via a checkout dialog (`CheckoutDialog.tsx`).

#### 3.1.5. Order Management
*   **FR-15: Customer Order History:** Registered users shall be able to view a history of their past orders.
*   **FR-16: Admin Order Viewing:** Administrators shall be able to view a list of all orders placed in the system.
*   **FR-17: Update Order Status:** Administrators shall be able to update the status of an order (e.g., "Pending", "Shipped", "Delivered", "Cancelled").

#### 3.1.6. Admin Dashboard
*   **FR-18: Summary View:** Upon logging in, administrators shall be presented with a dashboard displaying high-level statistics (e.g., total revenue, number of orders, new customers).
*   **FR-19: Data Visualization:** The dashboard shall include charts and graphs (using `recharts`) to visualize sales trends and other key performance indicators over time.

### 3.2. Non-Functional Requirements

*   **NFR-1: Performance:**
    *   The application shall be optimized for fast load times. The use of Vite ensures efficient bundling and a fast development experience.
    *   Client-side data fetching shall be managed by TanStack React Query to provide caching, reduce redundant API calls, and improve perceived performance with features like stale-while-revalidate.
    *   The application should target a First Contentful Paint (FCP) of under 2.5 seconds on a standard broadband connection.
*   **NFR-2: Security:**
    *   User passwords must be securely hashed using the `bcrypt` algorithm before being stored.
    *   All API endpoints handling sensitive data or actions must be protected by authentication and authorization middleware on the server.
    *   The application relies on Supabase for secure database interactions, which can be further enhanced with Row-Level Security (RLS) policies.
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
    *   The application utilizes distinct navigation patterns for different user roles. The customer-facing storefront uses a primary top navigation bar, while the admin area employs a persistent sidebar layout (`DashboardLayout.tsx`, `sidebar.tsx`) for navigating management sections.
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

*   **User:**
    *   `userId` (Primary Key)
    *   `email` (String, Unique)
    *   `hashedPassword` (String)
    *   `role` (Enum: 'CUSTOMER', 'ADMIN')
    *   `createdAt` (Timestamp)
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
    *   `userId` (Foreign Key to User)
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
*   A **User** can have many **Orders**.
*   A **Category** can have many **Products**.
*   An **Order** belongs to one **User**.
*   An **Order** can contain many **OrderItems**.
*   An **OrderItem** links to one specific **Product**.

### 4.3. API Style
The application exposes a **RESTful API** from the Express backend for all client-server communication. The API is organized around resources.

*   **Example Endpoints:**
    *   `GET /api/products` - Fetches a list of all products.
    *   `GET /api/products/:id` - Fetches a single product by its ID.
    *   `POST /api/orders` - Creates a new order.
    *   `GET /api/admin/orders` - Fetches all orders for the admin dashboard.
    *   `PUT /api/admin/orders/:id` - Updates an order's status.
    *   `POST /api/auth/login` - Authenticates a user.
