export type Default = {
  url: string;
  method: "get" | "post" | "put" | "delete";
  params?: object;
  query?: object;
  data?: unknown;
  result?: unknown;
};

export type TRequest<T extends Default> = {
  url: T["url"];
  params?: T["params"];
  query?: T["query"];
  method?: T["method"];
  headers?: { [key: string]: string };
  data?: T["data"];
};

export type TResponse<T extends Default> = T["result"];

export default ApiCaller;

export function ApiCaller(baseUrl: string) {
  return {
    request: <T extends Default>(request: TRequest<T>) =>
      sendRequest({
        baseUrl,
        request,
        defaultOptions: {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-cache",
        },
      }),
  };
}

export async function sendRequest<T extends Default>({
  baseUrl,
  request,
  defaultOptions,
  showLogs = true,
}: {
  baseUrl: string;
  request: TRequest<T>;
  defaultOptions?: RequestInit;
  showLogs?: boolean;
}): Promise<TResponse<T>> {
  const { url, params, query, method, headers, data } = request;

  const options: RequestInit = defaultOptions || {};
  if (method) options.method = method;
  if (headers) options.headers = { ...options.headers, ...headers };

  if (data) {
    if (options.headers?.["Content-Type"] === "application/json") {
      options.body = JSON.stringify(data);
    }

    if (
      options.headers?.["Content-Type"] === "application/x-www-form-urlencoded"
    ) {
      options.body = data as BodyInit;
    }
  }

  const compiledUrl = params ? compile<T>(url, params) : url;
  const pathUrl = query ? objectToQueryString(compiledUrl, query) : compiledUrl;
  const response = await fetch(new URL(pathUrl, baseUrl).toString(), options);
  const result = await response.json();

  showLogs && console.log(`**** ${pathUrl} ****`, result);

  if (response.status >= 400) {
    throw {
      code: response.status,
      error: result,
    };
  }

  return result;
}

/**
 *
 * @param url /param1/{userId}/param2/{paramId}/_deactivate
 * @param params { "userId": "1000000001", paramId: "2000000002" }
 * @returns /param1/1000000001/param2/2000000002/_deactivate
 */
export function compile<T extends Pick<Default, "url" | "params">>(
  url: T["url"],
  params: object
) {
  return url.toString().replace(/{.+?}/g, function (matcher: any) {
    const path = matcher.slice(1, -1).trim();
    const value = path
      .split(".")
      .reduce((obj: any, key: string) => obj[key], params);
    return value !== undefined ? value : "";
  });
}

/**
 *
 * @param url /users
 * @param query { "u": "alice", "s": "active" }
 * @returns /users?u=alive&s=active
 */
export function objectToQueryString(url: string, query: any): string {
  const queryString = Object.keys(query)
    .filter((key) => !!query[key])
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
    )
    .join("&");

  return url.includes("?") ? `${url}${queryString}` : `${url}?${queryString}`;
}
