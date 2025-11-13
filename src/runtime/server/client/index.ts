import { useRuntimeConfig } from "#imports";
import { EmporixSDK } from "./sdk";

export const emporixClientFactory = () => {
  const { baseURL, clientId, clientSecret, tenant } =
    useRuntimeConfig()["@laioutr-app/emporix"];

  return new EmporixSDK({ baseURL, clientId, clientSecret, tenant });
};
