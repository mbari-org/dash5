// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from "../getInstance";
import { RequestConfig } from "../types";

export interface CreateDocumentParams {
  name: string
  docType: string
  text: string 
}

export interface CreateDocumentResponse {
  result: string
}

export const createDocument = async (
  params: CreateDocumentParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = "/documents";

  if (debug) {
    console.debug(`POST ${url}`);
  }

  const response = await instance.post(url, params);
  return response.data as CreateDocumentResponse;
};
