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
*   A complete guest checkout and order processing workflow.

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

#### 3.1.2. Admin Dashboard
*   **FR-2: Summary View:** Upon logging in, administrators are presented with a dashboard displaying high-level statistics (e.g., total revenue, number of orders, new customers).
*   **FR-3: Data Visualization:** The dashboard includes charts and graphs (using `recharts`) to visualize sales trends and other key performance indicators over time.

#### 3.1.3. Product Management (Admin)
*   **FR-4: Product CRUD:** Administrators shall have full Create, Read, Update, and Delete (CRUD) capabilities for products through the admin interface.
*   **FR-5: Product Details:** Product information shall include name, description, price, stock quantity, and associated category.
*   **FR-6: Product Image Upload:** Administrators shall be able to upload product images.

#### 3.1.4. Category Management (Admin)
*   **FR-7: Category CRUD:** Administrators shall have full Create, Read, Update, and Delete (CRUD) capabilities for product categories.

#### 3.1.5. Order Management (Admin)
*   **FR-8: Order Viewing & Deletion:** Administrators shall be able to view a list of all orders and delete orders.
*   **FR-9: Update Order Status:** Administrators shall be able to update the status of an order (e.g., "Pending", "Shipped", "Delivered", "Cancelled").

#### 3.1.6. Customer Management (Admin)
*   **FR-10: Customer CRUD:** Administrators shall have full Create, Read, Update, and Delete (CRUD) capabilities for customer records. Customer records are used to store contact information for orders.

#### 3.1.7. Store Settings Management (Admin)
*   **FR-11: General Settings:** Administrators shall be able to configure general store information such as store name, description, and currency.
*   **FR-12: Delivery & Payment Settings:** Administrators shall be able to configure delivery fees for different geographic areas, set a minimum amount for free delivery, and toggle payment methods (e.g., Cash on Delivery).
*   **FR-13: Customizable Messages:** Administrators shall be able to customize various user-facing messages in both English and Arabic, including the order success message, checkout instructions, and delivery/pickup messages.
*   **FR-14: Admin Account Management:** The administrator shall be able to change their password and update their contact email.

#### 3.1.8. Storefront & Public Functionality
*   **FR-15: Product Browsing:** All users shall be able to view and search for products, filter them by category, and view detailed product pages.
*   **FR-16: Shopping Cart:** Users shall be able to add products to a shopping cart and modify its contents.
*   **FR-17: Guest Checkout:** Users shall check out as guests. The checkout process is a multi-step flow within a modal dialog that collects customer contact information and delivery preferences before placing the order.

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
*   **NFR-4: Localization:**
    *   The application must support at least two languages: English and Arabic. This is evident in the data models for settings and the structure of the UI components.
*   **NFR-5: Scalability:**
    *   The backend architecture (stateless Express server) is horizontally scalable.
    *   The use of Supabase provides a scalable backend and database infrastructure that can grow with user demand.
    *   The application is containerized using Docker, allowing for predictable and scalable deployments in various cloud environments.
*   **NFR-6: Maintainability:**
    *   The entire codebase is written in TypeScript, enforcing type safety and improving code quality and developer experience.
    *   Code is organized into distinct `client`, `server`, and `shared` directories, promoting a clear separation of concerns.
    *   The use of `Zod` for schema validation in the `shared` directory ensures data consistency between the frontend and backend.

### 3.3. UI/UX Requirements

*   **UI-1: Core Principle - Simplicity and Clarity:**
    *   The entire user interface, particularly for customer-facing pages, must prioritize simplicity. The design should be clean, uncluttered, and intuitive, enabling users to find products and complete purchases with minimal friction.
*   **UI-2: Navigation Style:**
    *   The application utilizes distinct navigation patterns. The public storefront uses a primary top navigation bar, while the admin area employs a persistent sidebar layout for navigating management sections.
*   **UI-3: Interaction Style:**
    *   The system heavily favors a modern Single-Page Application (SPA) interaction model. Using components like modals, drawers, and popovers for key workflows is a core design principle, preferred over traditional page reloads to create a smoother user experience.
*   **UI-4: Product Page Layout:**
    *   The product detail page shall use a clean, two-column layout on larger screens.
    *   One column is dedicated to product imagery, including a primary image display and clickable thumbnails for all product and variant images.
    *   The second column presents information in a clear hierarchy: product name, description, a large prominent price, stock status, selectable variants (if any), and a large, full-width "Add to Cart" button as the primary call-to-action.
*   **UI-5: Header Design:**
    *   The storefront header shall maintain a simple and functional layout. It includes the store logo on the left, and a set of action buttons on the right (e.g., Instagram link, language switcher, cart access).
    *   To maintain a clean and consistent style, action buttons in the header are required to be rectangular, avoiding circular or icon-only button styles.
*   **UI-6: Checkout Flow:**
    *   The guest checkout process is presented within a multi-step modal dialog (`CheckoutDialog.tsx`). This stepper guides the user through entering customer information, selecting delivery options, and confirming the order summary.
    *   The workflow deliberately avoids immediate online payment processing, contributing to a simpler and faster checkout experience for the customer.
*   **UI-7: Visual Design Guidelines:**
    *   **Primary Color:** The visual design must prominently feature the primary brand color `#742370`.
    *   **Styling:** The UI is built with Tailwind CSS, following a utility-first methodology.
    *   **Component Library:** The application uses `shadcn/ui`, which provides a consistent, modern, and accessible set of pre-built components.
    *   **Icons:** The `lucide-react` library is used for a clean and consistent set of icons throughout the application.
    *   **Themes:** The inclusion of `next-themes` indicates support for user-selectable themes, such as light and dark modes.
*   **UI-8: Responsive Design:**
    *   A seamless and high-quality responsive design is a critical requirement. All interfaces must be mobile-first and adapt perfectly to all screen sizes, from small mobile devices to large desktop monitors, without any layout issues or loss of functionality.
*   **UI-9: Error Handling & Feedback:**
    *   Forms utilize real-time, inline validation, managed by `react-hook-form` and `zod` resolvers.
    *   Asynchronous action feedback (e.g., success, error, loading states) is provided through non-intrusive toast notifications (`sonner`) and custom success popups (e.g., after placing an order).
*   **UI-10: Animations & Micro-interactions:**
    *   The application must feature high-quality, "good feeling" animations and micro-interactions that enhance the user experience. Transitions should be smooth and purposeful, providing users with satisfying visual feedback. This is facilitated by libraries such as `framer-motion` and `tailwindcss-animate`.

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
