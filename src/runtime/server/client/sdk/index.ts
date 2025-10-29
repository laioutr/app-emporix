import { getCookie, setCookie, useUserlandCache } from "#imports";
import type { TokenResponse } from "../types/auth";
import type { H3Event } from "h3";
import type { Category } from "../types/category";
import type { Product } from "../types/product";

export class EmporixSDK {
  private baseURL: string;
  private clientId: string;
  private clientSecret: string;
  private tenant: string;
  private accessToken?: string;

  constructor({
    baseURL,
    clientId,
    clientSecret,
    tenant,
  }: {
    baseURL: string;
    clientId: string;
    clientSecret: string;
    tenant: string;
  }) {
    this.baseURL = baseURL;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tenant = tenant;
    this.accessToken = undefined;
  }

  private async call<T = unknown>(
    url: string,
    {
      method = "GET",
      params,
      body,
    }: {
      method?: "GET" | "POST";
      params?: Record<string, unknown>;
      body?: unknown;
    } = {}
  ) {
    const searchParams = new URLSearchParams();

    searchParams.set("client_id", this.clientId);
    searchParams.set("hybris-tenant", this.tenant);

    if (params) {
      for (const k in params) {
        if (params[k] !== null && params[k] !== undefined)
          searchParams.set(k, params[k].toString());
      }
    }

    const response = await fetch(
      `${this.baseURL}${url}?${searchParams.toString()}`,
      {
        method,
        headers: {
          ...(this.accessToken
            ? { Authorization: `Bearer ${this.accessToken}` }
            : {}),
          Accept: "application/json, text/plain, */*",
          "User-Agent": "Mozilla/5.0 (Node fetch)",
          ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      // TODO: Monitor error
      console.log(await response.text());
      throw new Error(
        `Calling ${url} failed with status ${response.status} (${response.statusText})`
      );
    }

    const data = await response.json();

    return data as T;
  }

  /* Auth */
  async assertIsAuthOrAnon({ event }: { event: H3Event }) {
    this.accessToken = getCookie(event, "accessToken");

    // No access token exists.. Set anonymous token
    if (!this.accessToken) {
      const { access_token, expires_in } = await this.call<TokenResponse>(
        "/customerlogin/auth/anonymous/login"
      );

      this.accessToken = access_token;

      setCookie(event, "accessToken", this.accessToken, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: expires_in, // In milliseconds
      });
    }
  }

  async assertIsAdminAuth() {
    const cache = useUserlandCache("emporix");

    this.accessToken = await cache.getItem("admin_access_token");

    // No access token exists.. Set anonymous token
    if (!this.accessToken) {
      const { access_token, expires_in } = await this.call<TokenResponse>(
        "/oauth/token",
        {
          method: "POST",
          body: {
            grant_type: "client_credentials",
            client_id: this.clientId,
            client_secret: this.clientSecret,
          },
        }
      );

      this.accessToken = access_token;

      await cache.setItem("admin_access_token", this.accessToken, {
        ttl: expires_in / 1000,
      });
    }
  }

  /* Categories */
  async listCategories({
    parentCategoryId,
    onlyRoots = true,
    depth = 3,
  }: {
    parentCategoryId?: string;
    onlyRoots?: boolean;
    depth?: number;
  }) {
    return parentCategoryId
      ? this.call<Category[]>(
          `/category/${this.tenant}/categories/${parentCategoryId}/subcategories`,
          { params: { depth } }
        )
      : this.call<Category[]>(`/category/${this.tenant}/categories`, {
          params: { showRoots: onlyRoots },
        });
  }

  async getCategory(categoryId: string) {
    return this.call<Category>(
      `/category/${this.tenant}/categories/${categoryId}`
    );
  }

  /* Products */
  async searchProducts({
    q,
    page,
    limit,
    sort,
  }: {
    q?: string;
    page?: string;
    limit?: number;
    sort?: string;
  }) {
    return this.call<Product[]>(`/product/${this.tenant}/products/search`, {
      method: "POST",
      params: {
        pageNumber: page,
        pageSize: limit,
        sort,
      },
      body: { q },
    });
  }

  async listProductVariants(productId: string) {
    return this.call<Product[]>(`/product/${this.tenant}/products`, {
      params: {
        q: `parentVariantId:${productId}`,
      },
    });
  }

  async retrieveProductsPrices({
    productIds,
    site = "main",
    currency = "EUR",
  }: {
    productIds: string[];
    site?: string;
    currency?: string;
  }) {
    return this.call(`/price/${this.tenant}/match-prices`, {
      method: "POST",
      body: {
        siteCode: site,
        targetCurrency: currency,
        items: productIds.map((id) => ({
          itemId: {
            itemType: "PRODUCT",
            id,
          },
        })),
      },
    });
  }
}
