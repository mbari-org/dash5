// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from "../getInstance";
import { RequestConfig } from "../types";

export interface AttachDocumentToDeploymentParams {
  docId: string
  deploymentId: string 
}

export interface AttachDocumentToDeploymentResponse {
  result: string
}

export const attachDocumentToDeployment = async (
  params: AttachDocumentToDeploymentParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = "/documents/deployment";

  if (debug) {
    console.debug(`POST ${url}`);
  }

  const response = await instance.post(url, params);
  return response.data as AttachDocumentToDeploymentResponse;
};
