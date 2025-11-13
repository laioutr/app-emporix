import { getCookie, setCookie, useUserlandCache } from "#imports";
import type { TokenResponse } from "../types/auth";
import type { H3Event } from "h3";
import type { Category } from "../types/category";
import type { Product, ProductAssignment } from "../types/product";
import type { Cart } from "../types/cart";
import type { Price } from "../types/price";
import type { Availability } from "../types/availability";

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
      version = "v2",
      method = "GET",
      params,
      body,
    }: {
      version?: string;
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
          "X-Version": version,
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
  async listCategories({ parentCategoryId }: { parentCategoryId?: string }) {
    return parentCategoryId
      ? this.call<Category[]>(
          `/category/${this.tenant}/category-trees/${parentCategoryId}`
        )
      : this.call<Category[]>(`/category/${this.tenant}/category-trees`, {});
  }

  async listCategoryAssignments(
    categoryId: string,
    {
      pageNumber,
      pageSize,
      sort,
    }: { pageNumber?: number; pageSize?: number; sort?: string }
  ) {
    return this.call<ProductAssignment[]>(
      `/category/${this.tenant}/categories/${categoryId}/assignments?assignmentType=PRODUCT`,
      {
        params: {
          withSubcategories: true,
          pageNumber,
          pageSize,
          sort,
        },
      }
    );
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
  }: {
    productIds: string[];
    site?: string;
    currency?: string;
  }) {
    return this.call<Price[]>(
      `/price/${this.tenant}/match-prices-by-context
`,
      {
        method: "POST",
        body: {
          items: productIds.map((id) => ({
            itemId: {
              itemType: "PRODUCT",
              id,
            },
            quantity: {
              quantity: 1,
            },
          })),
        },
      }
    );
  }

  async retrieveProductAvailability(productId: string) {
    return this.call<Availability>(
      `/availability/${this.tenant}/availability/${productId}/main`
    );
  }

  /* Carts */
  async assertHasCart({ siteCode }: { siteCode: string }) {
    const cart = await this.call<Cart>(`/cart/${this.tenant}/carts`, {
      method: "GET",
      params: {
        siteCode,
        create: true,
      },
    });

    return cart;
  }

  async getCartById(cartId: string) {
    return this.call<Cart>(`/cart/${this.tenant}/carts/${cartId}`, {
      params: { expandCalculation: true },
    });
  }

  async addItemToCart({
    items,
    siteCode,
  }: {
    items: Array<{
      yrn: string;
      price: {
        priceId: string;
        effectiveAmount: number;
        originalAmount: number;
        currency: string;
      };
      quantity: number;
    }>;
    siteCode: string;
  }) {
    const cart = await this.assertHasCart({ siteCode });

    return this.call(`/cart/${this.tenant}/carts/${cart.id}/itemsBatch`, {
      params: { siteCode },
      method: "POST",
      body: items.map((item) => ({
        itemYrn: item.yrn,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
}
