// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from "../getInstance";
import { RequestConfig } from "../types";

export interface CreateDocumentInstanceParams {
  docId: string
  newName?: string
  text: string 
}

export interface CreateDocumentInstanceResponse {
  result: string
}

export const createDocumentInstance = async (
  params: CreateDocumentInstanceParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = "/documents/instance";

  if (debug) {
    console.debug(`POST ${url}`);
  }

  const response = await instance.post(url, params);
  return response.data as CreateDocumentInstanceResponse;
};
