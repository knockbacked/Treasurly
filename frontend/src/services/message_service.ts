import { z } from "zod";
import apiClient from "../lib/apiClient";

// ---------- Schema ----------
export const MessageSchema = z.object({
  id: z.string(),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

// ---------- Services (/api/messages) ----------
const BASE = "/messages";

export const listMessages = async (): Promise<Message[]> => {
  const res = await apiClient.get(BASE);
  return z.array(MessageSchema).parse(res.data);
};

export const createMessage = async (payload: Omit<Message, "id">): Promise<Message> => {
  const res = await apiClient.post(BASE, payload);
  return MessageSchema.parse(res.data);
};
