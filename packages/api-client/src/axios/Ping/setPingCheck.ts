// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from "../getInstance";
import { RequestConfig } from "../types";

export interface SetPingCheckParams {
  vehicleName: string
  enable: boolean 
}

export interface SetPingCheckResponse {
  result: string
}

export const setPingCheck = async (
  params: SetPingCheckParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = "/ping/check";

  if (debug) {
    console.debug(`PUT ${url}`);
  }

  const response = await instance.put(url, params);
  return response.data as SetPingCheckResponse;
};
