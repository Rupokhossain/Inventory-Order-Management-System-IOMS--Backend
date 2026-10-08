import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { ICreateInquiryPayload, IInquiryQuery } from "./inquiry.interface";

const ensureTableExists = async () => {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'UNREAD',
        reply TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (error) {
    console.error("Error creating inquiries table:", error);
  }
};

const createInquiry = async (payload: ICreateInquiryPayload) => {
  await ensureTableExists();

  if (!payload.name || !payload.email || !payload.message) {
    throw new AppError(httpStatus.BAD_REQUEST, "Name, email and message are required!");
  }

  const id = crypto.randomUUID();
  await prisma.$executeRawUnsafe(
    `INSERT INTO inquiries (id, name, email, phone, subject, message, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'UNREAD', NOW(), NOW())`,
    id,
    payload.name,
    payload.email,
    payload.phone || null,
    payload.subject || "General Logistics Inquiry",
    payload.message
  );

  const created: any = await prisma.$queryRawUnsafe(
    `SELECT * FROM inquiries WHERE id = $1`,
    id
  );

  return created[0] || { id, ...payload, status: "UNREAD" };
};

const getAllInquiries = async (query: IInquiryQuery) => {
  await ensureTableExists();

  const { status, searchTerm } = query;
  let sql = `SELECT * FROM inquiries WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (status && status !== "ALL") {
    sql += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (searchTerm && searchTerm.trim() !== "") {
    sql += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR subject ILIKE $${paramIndex} OR message ILIKE $${paramIndex})`;
    params.push(`%${searchTerm}%`);
    paramIndex++;
  }

  sql += ` ORDER BY created_at DESC`;

  const inquiries: any = await prisma.$queryRawUnsafe(sql, ...params);

  return {
    meta: {
      total: inquiries.length,
      unreadCount: inquiries.filter((item: any) => item.status === "UNREAD").length,
    },
    data: inquiries,
  };
};

const updateInquiryStatus = async (id: string, status: string, reply?: string) => {
  await ensureTableExists();

  if (reply) {
    await prisma.$executeRawUnsafe(
      `UPDATE inquiries SET status = $1, reply = $2, updated_at = NOW() WHERE id = $3`,
      status,
      reply,
      id
    );
  } else {
    await prisma.$executeRawUnsafe(
      `UPDATE inquiries SET status = $1, updated_at = NOW() WHERE id = $2`,
      status,
      id
    );
  }

  const updated: any = await prisma.$queryRawUnsafe(
    `SELECT * FROM inquiries WHERE id = $1`,
    id
  );

  if (!updated || updated.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "Inquiry not found!");
  }

  return updated[0];
};

const deleteInquiry = async (id: string) => {
  await ensureTableExists();

  await prisma.$executeRawUnsafe(`DELETE FROM inquiries WHERE id = $1`, id);

  return { id };
};

export const InquiryService = {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry,
};
