import fetch from "cross-fetch";
import {
  FetchOptions,
  FetchRawResponse,
  FetchResponse,
  GetResponse,
  PutResponse,
  UpdatePayloadProps,
  UpdateResponse,
} from "./types";
import { BaseAction, BaseUtilsActions } from "./utils";

const BASE_URL = "https://database.deta.sh/v1";

class _Base {
  projectKey: string;
  name: string;
  baseUrl: string;

  constructor(name: string, projectKey: string, projectId: string) {
    this.name = name;
    this.projectKey = projectKey;
    this.baseUrl = `${BASE_URL}/${projectId}/${name}`;
  }

  private async request<T>(url: string, method: string, headers?: HeadersInit) {
    const r = await fetch(this.baseUrl + `${url}`, {
      ...headers,
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.projectKey,
      },
    });

    if (!r.ok) {
      // TODO: update error message
      throw new Error("Failed request.");
    }

    return (await r.json()) as T;
  }

  async put<T extends Record<string, any>>(item: T, key?: string) {
    const finalItem = {
      ...item,
      key,
    };

    const r = await this.request<PutResponse>("/items", "PUT", {
      body: JSON.stringify({ items: [finalItem] }),
    });

    if (r.processed.items.length == 0) {
      throw new Error(
        "Failed to save item to Base because of internal processing."
      );
    }

    return r.processed.items[0].key;
  }

  async get<T extends GetResponse>(key: string) {
    if (key === "") {
      throw new Error("Key cannot be empty.");
    }

    const r = await this.request<T>(`/items/${key}`, "GET");

    return r;
  }

  async delete(key: string) {
    if (key === "") {
      throw new Error("Key cannot be empty.");
    }

    // API Always returns 200 reegardless if an item with the key exists or not.
    await this.request(`/items/${key}`, "DELETE");

    return null;
  }

  async insert<T extends Record<string, any>>(item: T, key?: string) {
    const finalItem = {
      ...item,
      key,
    };

    const r = await this.request<GetResponse>("/items", "POST", {
      body: JSON.stringify({ item: finalItem }),
    });

    return r;
  }

  async update<T extends Record<string, any>>(updates: T, key: string) {
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

    await this.request<UpdateResponse>(`/items/${key}`, "PATCH", {
      body: JSON.stringify(payload),
    });

    return null;
  }

  async fetch<T extends GetResponse>(
    query: Record<string, any> | Record<string, any>[] = {},
    options?: FetchOptions
  ) {
    const payload = {
      query: Array.isArray(query) ? query : [query],
      limit: options?.limit,
      last: options?.last,
    };

    const r = await this.request<FetchRawResponse<T>>("/query", "POST", {
      body: JSON.stringify(payload),
    });

    return <FetchResponse<T>>{
      items: r.items,
      count: r.paging?.size,
      last: r.paging?.last,
    };
  }
}

export { _Base };
