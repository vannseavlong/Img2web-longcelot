export interface ConvertOptions {
  quality: number;
  doResize: boolean;
  maxWidth: number;
  maxHeight: number;
}

export type FileStatus = "pending" | "converting" | "done" | "error";

export interface FileEntry {
  file: File;
  status: FileStatus;
  result?: Blob;
  error?: string;
}
