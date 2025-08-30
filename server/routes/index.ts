import { Router } from "express";
import {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "./customers";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "./products";
import {
  getAllOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderById,
} from "./orders";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "./categories";
import { getSettings, updateSettings } from "./settings";
import {
  uploadMiddleware,
  handleImageUpload,
  handleMultipleImageUpload,
  deleteImage,
  getStorageInfo,
} from "./upload";
import { trackEvent, getAnalytics, getRealTimeData } from "./analytics";
import {
  getLogs,
  addLog,
  clearLogs,
  exportLogs,
  getSystemHealth,
} from "./logs";
import {
  handleAdminLogin,
  handleChangePassword,
  handleUpdateEmail,
  handleGetAdminInfo,
} from "./admin";
import { handleDemo } from "./demo";

const apiRouter = Router();

// Demo
apiRouter.get("/demo", handleDemo);

// Upload
const uploadRouter = Router();
uploadRouter.get("/info", getStorageInfo);
uploadRouter.post("/", uploadMiddleware, handleImageUpload);
uploadRouter.post("/multiple", handleMultipleImageUpload);
uploadRouter.delete("/:filename", deleteImage);
apiRouter.use("/upload", uploadRouter);

// Customers
const customersRouter = Router();
customersRouter.get("/", getAllCustomers);
customersRouter.get("/:id", getCustomerById);
customersRouter.post("/", createCustomer);
customersRouter.put("/:id", updateCustomer);
customersRouter.delete("/:id", deleteCustomer);
apiRouter.use("/customers", customersRouter);

// Products
const productsRouter = Router();
productsRouter.get("/", getAllProducts);
productsRouter.get("/:id", getProductById);
productsRouter.post("/", createProduct);
productsRouter.put("/:id", updateProduct);
productsRouter.delete("/:id", deleteProduct);
apiRouter.use("/products", productsRouter);

// Orders
const ordersRouter = Router();
ordersRouter.get("/", getAllOrders);
ordersRouter.get("/:id", getOrderById);
ordersRouter.post("/", createOrder);
ordersRouter.put("/:id", updateOrder);
ordersRouter.delete("/:id", deleteOrder);
apiRouter.use("/orders", ordersRouter);

// Categories
const categoriesRouter = Router();
categoriesRouter.get("/", getAllCategories);
categoriesRouter.get("/:id", getCategoryById);
categoriesRouter.post("/", createCategory);
categoriesRouter.put("/:id", updateCategory);
categoriesRouter.delete("/:id", deleteCategory);
apiRouter.use("/categories", categoriesRouter);

// Settings
const settingsRouter = Router();
settingsRouter.get("/", getSettings);
settingsRouter.post("/", updateSettings);
apiRouter.use("/settings", settingsRouter);

// Analytics
const analyticsRouter = Router();
analyticsRouter.post("/track", trackEvent);
analyticsRouter.get("/", getAnalytics);
analyticsRouter.get("/realtime", getRealTimeData);
apiRouter.use("/analytics", analyticsRouter);

// Logs
const logsRouter = Router();
logsRouter.get("/", getLogs);
logsRouter.post("/", addLog);
logsRouter.delete("/", clearLogs);
logsRouter.get("/export", exportLogs);
logsRouter.get("/health", getSystemHealth);
apiRouter.use("/logs", logsRouter);

// System
const systemRouter = Router();
apiRouter.use("/system", systemRouter);

// Admin
const adminRouter = Router();
adminRouter.post("/login", handleAdminLogin);
adminRouter.post("/change-password", handleChangePassword);
adminRouter.put("/email", handleUpdateEmail);
adminRouter.get("/info", handleGetAdminInfo);
apiRouter.use("/admin", adminRouter);

export default apiRouter;
