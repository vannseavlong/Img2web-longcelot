export interface ConvertOptions {
  quality: number;
}

export type FileStatus = "pending" | "converting" | "done" | "error";

export type BackendStatus = "checking" | "online" | "offline";

export interface ResizeOptions {
  enabled: boolean;
  maxWidth: number;
  maxHeight: number;
}

export interface FileEntry {
  file: File;
  status: FileStatus;
  result?: Blob;
  error?: string;
  outputName: string;
  resize: ResizeOptions;
}
