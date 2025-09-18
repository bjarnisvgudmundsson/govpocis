
// Correct types based on API documentation
export interface Case {
  id: string; // Usually a client-side unique id, API might use caseNumber as primary
  caseNumber: string;
  subject: string;
  archiveNumber: string;
  templateName: string;
  categoryName: string;
  responsibleEmployeeName: string;
  responsibleEmployeeID: string;
  coResponsibleEmployees: string[];
  priorityName: string;
  personalSensitive: boolean;
  confidential: boolean;
  body: string;
  statusName: string;
  keywords: string[];
  publishTo: string[];
  creationDate: string; // Assuming ISO string date format
  createdByName: string;
  modifiedDate: string; // Assuming ISO string date format
  modifiedByName: string;
  closingDate: string | null; // Can be null if not closed
  metaDataEntries: MetadataEntry[];
}

export interface CaseContact {
  contactID: string;
  role: string; // e.g. "Málsaðili", "Verjandi"
  primary: string; // "1" for true, "0" for false (or other string representation)
  name: string;
  idnumber: string; // Kennitala
  type: string; // e.g. "Einstaklingur", "Fyrirtæki"
  address: string;
  email: string;
  webPage: string;
  phone: string;
  postalCode: string;
  city: string;
  caseContactID: string; // Specific ID for this contact's link to the case
}

export interface MetadataEntry {
  name: string;
  value: string;
  valueType: number; // Could be an enum: 0 for string, 1 for number, etc.
}

export interface CredentialInfo {
  username: string | null;
  idNumber: string | null; // Kennitala used for user identification/search
  token: string | null;    // API authentication token
}
