export type FileType = "folder" | "file";

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  path: string;
  size?: string;
  modifiedAt?: string;
  mimeType?: string;
  children?: FileNode[];
}

export interface FileListItem {
  id: string;
  name: string;
  type: FileType;
  path: string;
  size: string;
  modifiedAt: string;
  mimeType?: string;
}
