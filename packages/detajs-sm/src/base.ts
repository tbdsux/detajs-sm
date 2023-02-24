import fetch from "cross-fetch";
import {
  BaseDataProps,
  ClientErrorResponse,
  FetchOptions,
  FetchRawResponse,
  FetchResponse,
  GetResponse,
  PutOptions,
  PutResponse,
  UpdatePayloadProps,
  UpdateResponse,
} from "./types";
import { BaseAction, BaseUtils, BaseUtilsActions, getTTL } from "./utils";

const BASE_URL = "https://database.deta.sh/v1";

class _Base<K extends BaseDataProps> {
  projectKey: string;
  name: string;
  baseUrl: string;
  util: BaseUtils;

  constructor(name: string, projectKey: string, projectId: string) {
    this.name = name;
    this.projectKey = projectKey;
    this.baseUrl = `${BASE_URL}/${projectId}/${name}`;
    this.util = new BaseUtils();
  }

  private async request<T extends Record<string, any>>(
    url: string,
    method: string,
    headers?: HeadersInit
  ) {
    let response: T | undefined = undefined;
    let status: number = 0;
    let error: Error | null = null;

    try {
      const r = await fetch(this.baseUrl + `${url}`, {
        ...headers,
        method,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.projectKey,
        },
      });

      response = (await r.json()) as T;
      status = r.status;

      if (!r.ok && status !== 404) {
        const errJson = (await r.json()) as ClientErrorResponse;

        error = new Error(
          `${status} | ${
            errJson.errors.length > 0 ? errJson.errors[0] : "Unknown error..."
          }`
        );
      }
    } catch (e) {
      error = new Error(String(e));
    }

    if (!response) {
      throw new Error("Response is empty, maybe something is wrong?");
    }

    return { response, status, error };
  }

  /**
   * Store multiple items to the database.
   *
   * @param items Array / list of items to store to the database.
   * @returns {Promise<PutResponse>}
   */
  async putMany(
    items: K[] | Omit<K, "key" | "__expires">[]
  ): Promise<PutResponse<K>> {
    const { response, error } = await this.request<PutResponse<K>>(
      "/items",
      "PUT",
      {
        body: JSON.stringify({ items }),
      }
    );

    if (error) throw error;

    return response;
  }

  /**
   * Store an item in the database.
   *
   * It overwrite the item if the key already exists.
   *
   * @param item Item object to store / save to the database.
   * @param key Key of the item to save.
   * @param options Put options.
   * @returns {Promise<string>}
   */
  async put(
    item: K | Omit<K, "key" | "__expires">,
    key?: string,
    options?: PutOptions
  ): Promise<string> {
    const { ttl, error: ttlError } = getTTL(
      options?.expireIn,
      options?.expireAt
    );
    if (ttlError) throw ttlError;

    const _key = key ? key.trim() : undefined;

    const finalItem = {
      ...item,
      ...(key ? { key: _key } : {}),
      ...(ttl ? { __expires: ttl } : {}),
    };

    const response = await this.putMany([finalItem]);

    if (response.processed.items.length == 0) {
      throw new Error(
        "Failed to save item to Base because of internal processing."
      );
    }

    return response.processed.items[0].key;
  }

  /**
   * Get / retrieve a stored item from the database with the given key.
   *
   * @param key The key of the item to get.
   * @returns {Promise<T | null>}
   */
  async get(key: string): Promise<K | null> {
    if (key === "") {
      throw new Error("Key cannot be empty.");
    }

    const { response, status, error } = await this.request<K>(
      `/items/${key}`,
      "GET"
    );

    if (status === 404) {
      return null;
    }

    if (error) throw error;

    return response;
  }

  /**
   * Delete an item from the database with the given key.
   *
   * @param key The key of the item to delete / remove.
   * @returns {Promise<null>}
   */
  async delete(key: string): Promise<null> {
    if (key === "") {
      throw new Error("Key cannot be empty.");
    }

    // API Always returns 200 reegardless if an item with the key exists or not.
    const { error } = await this.request(`/items/${key}`, "DELETE");

    if (error) throw error;

    return null;
  }

  /**
   * Insert a single item into a Base.
   *
   * It will raise an error if the key already exists in the database.
   * Note: `insert` is roughly 2x slower than `put`
   *
   * @param item The item to save / store to the database.
   * @param key Key of the item if not included with the item object.
   * @param options Insert options.
   * @returns {Promise<GetResponse>}
   */
  async insert(
    item: K | Omit<K, "key">,
    key?: string,
    options?: PutOptions
  ): Promise<GetResponse> {
    const { ttl, error: ttlError } = getTTL(
      options?.expireIn,
      options?.expireAt
    );
    if (ttlError) throw ttlError;

    const _key = key ? key.trim() : undefined;

    const finalItem = {
      ...item,
      ...(key ? { key: _key } : {}),
      ...(ttl ? { __expires: ttl } : {}),
    };

    const { response, error } = await this.request<GetResponse>(
      "/items",
      "POST",
      {
        body: JSON.stringify({ item: finalItem }),
      }
    );

    if (error) throw error;

    return response;
  }

  /**
   * Update an existing item from the database.
   *
   * @param updates A json object describing the updates on the item.
   * @param key The key of the item to be updated.
   * @returns {Promise<null>}
   */
  async update<
    T extends
      | Record<string, any | BaseAction>
      | { [k in keyof K]?: any | BaseAction }
  >(updates: T, key: string): Promise<null> {
    if (key === "") {
      throw new Error("Key cannot be empty.");
    }

    const payload: UpdatePayloadProps = {
      set: {},
      append: {},
      prepend: {},
      increment: {},
      delete: [],
    };

    for (const [key, v] of Object.entries(updates)) {
      if (v instanceof BaseAction) {
        switch (v.action) {
          case BaseUtilsActions.Delete:
            payload.delete.push(v.value);
            break;

          case BaseUtilsActions.Increment:
            payload.increment[key] = v.value;
            break;

          case BaseUtilsActions.Append:
            payload.append[key] = v.value;
            break;

          case BaseUtilsActions.Prepend:
            payload.prepend[key] = v.value;
            break;

          default:
            break;
        }

        continue;
      }

      payload.set[key] = v;
    }

    const { error } = await this.request<UpdateResponse>(
      `/items/${key}`,
      "PATCH",
      {
        body: JSON.stringify(payload),
      }
    );

    if (error) throw error;

    return null;
  }

  /**
   *
   * @param query A single or a list of query objects. If omitted, will fetch all items in the database (up to 1mn)
   * @param options
   * @returns {Promise<FetchResponse<T>>}
   */
  async fetch<T extends GetResponse = K>(
    query: Record<string, any> | Record<string, any>[] = {},
    options?: FetchOptions
  ): Promise<FetchResponse<T>> {
    const payload = {
      query: Array.isArray(query) ? query : [query],
      limit: options?.limit,
      last: options?.last,
    };

    const { response, error } = await this.request<FetchRawResponse<T>>(
      "/query",
      "POST",
      {
        body: JSON.stringify(payload),
      }
    );

    if (error) throw error;

    return <FetchResponse<T>>{
      items: response.items,
      count: response.paging?.size,
      last: response.paging?.last,
    };
  }
}

export { _Base };
