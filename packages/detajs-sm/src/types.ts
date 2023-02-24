export interface BaseDataProps extends Record<string, any> {
  key: string;
  __expires?: number;
}

export interface PutResponse<T extends BaseDataProps> {
  processed: {
    items: T[];
  };
  failed: {
    items: T[];
  };
}

export interface PutOptions {
  expireIn?: number;
  expireAt?: Date | number;
}

export type GetResponse = BaseDataProps;

export interface UpdatePayloadProps {
  set: Record<string, any>;
  increment: Record<string, number>;
  append: Record<string, any[]>;
  prepend: Record<string, any[]>;
  delete: string[];
}

export interface UpdateResponse extends UpdatePayloadProps {
  key: string;
}

export interface FetchOptions {
  limit: number;
  last?: string;
}

export interface FetchRawResponse<T extends GetResponse> {
  paging: {
    size: number;
    last?: string;
  };
  items: T[];
}

export interface FetchResponse<T extends GetResponse> {
  /**
   * List of items retrieved.
   */
  items: T[];
  /**
   * The number of items in the response.
   */
  count: number;
  /**
   * The last key seen in the fetch response. If `undefined`, further items can be retrieved more.
   */
  last?: string;
}

export interface ClientErrorResponse {
  errors: string[];
}
