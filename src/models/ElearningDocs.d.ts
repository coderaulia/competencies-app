export declare type ElearningDocumentResource = {
  storageable_id: number;
  storageable_type: string;
  document_uuid: string;
  document_path: string;
  document_name: string;
  document_storage_path: string;
  document_type: string;
  document_extension: string;
  document_description: string;
};
export declare type ElearningDocumentCollections =
  | ElearningDocumentResource[]
  | [];
