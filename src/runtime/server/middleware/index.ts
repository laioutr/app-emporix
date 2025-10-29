import { defineOrchestr } from "#imports";
import { name } from "../../../../package.json";
import { emporixClientFactory } from "../client";

export const defineEmporix = defineOrchestr
  .meta({ app: name })
  .extendRequest(async ({ event }) => {
    const emporixClient = emporixClientFactory();
    await emporixClient.assertIsAuthOrAnon({ event });

    // TODO: Fix Admin client initialization
    // const emporixAdminClient = emporixClientFactory();
    // await emporixAdminClient.assertIsAdminAuth();

    return {
      context: { emporixClient },
    };
  });

export const defineEmporixAction = defineEmporix.actionHandler;
export const defineEmporixQuery = defineEmporix.queryHandler;
export const defineEmporixLink = defineEmporix.linkHandler;
export const defineEmporixComponentResolver = defineEmporix.componentResolver;
export const defineEmporixQueryTemplateProvider =
  defineEmporix.queryTemplateProvider;
