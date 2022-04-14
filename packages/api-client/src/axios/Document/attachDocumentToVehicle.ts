// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from "../getInstance";
import { RequestConfig } from "../types";

export interface AttachDocumentToVehicleParams {
  docId: string
  vehicleName: string 
}

export interface AttachDocumentToVehicleResponse {
  result: string
}

export const attachDocumentToVehicle = async (
  params: AttachDocumentToVehicleParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = "/documents/vehicle";

  if (debug) {
    console.debug(`POST ${url}`);
  }

  const response = await instance.post(url, params);
  return response.data as AttachDocumentToVehicleResponse;
};
