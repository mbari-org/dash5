// Use scaffold axiosBase to generate the resources imported below.
import { getInstance } from "../getInstance";
import { RequestConfig } from "../types";

export interface SyncRepoParams {
  repoName: string 
}

export interface SyncRepoResponse {
  result: string
}

export const syncRepo = async (
  params: SyncRepoParams,
  { debug, instance = getInstance() }: RequestConfig = {}
) => {
  const url = "/git/sync";

  if (debug) {
    console.debug(`POST ${url}`);
  }

  const response = await instance.post(url, params);
  return response.data as SyncRepoResponse;
};
