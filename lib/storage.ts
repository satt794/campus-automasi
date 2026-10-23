import { createClient } from "@/lib/supabase/client";

export const ALLOWED_EXTENSIONS = ["pdf", "ppt", "pptx"];
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export interface StorageFile {
  name: string;
  id?: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
  };
}

export async function uploadCampusFile(userId: string, file: File) {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop()?.toLowerCase();

  if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
    throw new Error("Format file tidak didukung! Hanya .pdf, .ppt, dan .pptx.");
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new Error("Ukuran file melebihi batas maksimal 50MB.");
  }

  const sanitizedFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = `${userId}/${sanitizedFileName}`;

  const { data, error } = await supabase.storage
    .from("campus-files")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;
  return data;
}

export async function fetchUserFiles(userId: string): Promise<StorageFile[]> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("campus-files")
    .list(userId, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) throw error;
  return (data || []) as StorageFile[];
}

export async function getDownloadFileUrl(userId: string, fileName: string): Promise<string> {
  const supabase = createClient();
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("campus-files")
    .createSignedUrl(filePath, 3600);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteUserFile(userId: string, fileName: string) {
  const supabase = createClient();
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from("campus-files")
    .remove([filePath]);

  if (error) throw error;
}
