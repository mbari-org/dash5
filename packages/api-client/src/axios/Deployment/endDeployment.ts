// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from "../getInstance";
import { RequestConfig } from "../types";

export interface EndDeploymentParams {
  deploymentId: string
  date: string 
}

export interface EndDeploymentResponse {
  result: string
}

export const endDeployment = async (
  params: EndDeploymentParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = "/deployments/end";

  if (debug) {
    console.debug(`POST ${url}`);
  }

  const response = await instance.post(url, params);
  return response.data as EndDeploymentResponse;
};
