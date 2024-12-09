export interface File {
    id: string;
    name: string;
    size: number;
    uploadDate: string;
    owner: string;
    sharedWith?: string[];
  }
  
  export interface ShareLink {
    fileId: string;
    link: string;
    expiresAt: string;
  }
  