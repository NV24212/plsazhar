import { RequestHandler } from "express";
import { customerDb, Customer } from "../lib/customers-db";
import {
  insertCustomerSchema,
  updateCustomerSchema,
} from "../../shared/schema";

export const getAllCustomers: RequestHandler = async (req, res) => {
  try {
    const customers = await customerDb.getAll();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

export const createCustomer: RequestHandler = async (req, res) => {
  try {
    console.log("Creating customer with data:", req.body);
    const parsed = insertCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues.map((i) => i.message).join("; "),
        details: parsed.error.flatten(),
      });
    }

    const payload: Omit<Customer, "id" | "created_at" | "updated_at" | "createdAt"> = {
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      home: parsed.data.home,
      road: parsed.data.road,
      block: parsed.data.block,
      town: parsed.data.town,
    };

    const newCustomer = await customerDb.create(payload);
    console.log("Customer created successfully:", newCustomer.id);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

export const updateCustomer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = updateCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues.map((i) => i.message).join("; "),
        details: parsed.error.flatten(),
      });
    }

    const updates: Partial<Customer> = { ...parsed.data } as any;

    const updatedCustomer = await customerDb.update(id, updates);
    res.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.status(500).json({ error: "Failed to update customer" });
    }
  }
};

export const deleteCustomer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await customerDb.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting customer:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  }
};

export const getCustomerById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await customerDb.getById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};
