export interface DocumentItem {
    docId: number;
    doc_name: string;
    file_url: string;
    download_count: number;
  }
  
  export interface DocumentData {
    documents: DocumentItem[];
  }
  
  export interface DocumentResponse {
    result: number;
    message: string;
    data: DocumentData;
  }

  export interface CreateDocumentPayload {
    doc_name: string;
    file_doc: File | null;
  }