// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from "../getInstance";
import { RequestConfig } from "../types";

export interface SendTestEmailForNotificationsParams {
  email: string
  plainText: string 
}

export interface SendTestEmailForNotificationsResponse {
  result: string
}

export const sendTestEmailForNotifications = async (
  params: SendTestEmailForNotificationsParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = "/ens/test";

  if (debug) {
    console.debug(`POST ${url}`);
  }

  const response = await instance.post(url, params);
  return response.data as SendTestEmailForNotificationsResponse;
};
