import type { Default } from "@/lib/api-caller";
import { NextRequest, NextResponse } from "next/server";
import type * as z from "zod";

export enum ErrorCode {
  NOT_FOUND = "NOT_FOUND",
  INVALID_DATA = "INVALID_DATA",
  UNAUTHORIZED = "UNAUTHORIZED",
}

type ZodError = {
  code: 400;
  error: {
    code: number;
    message: string;
  };
};

type ZitadelError = {
  code: number;
  error: {
    code: number;
    details: Array<{
      id: string;
      message: string;
      "@type": string;
    }>;
    message: string;
  };
};

type ResponseError = {
  code: number;
  error: {
    code: ErrorCode;
    message: string;
    info?: any;
  };
};

export const parseRequest = async <T>(request: NextRequest) => {
  const body: T = await request.json();
  return { body };
};

export const isValidRequest = <T>(params: {
  data: T;
  schema: z.ZodSchema<T>;
}) => {
  const { data, schema } = params;
  schema.parse(data);
};

export const ok = <T>(body: T, headers: Record<string, string>) => {
  return NextResponse.json(body || {}, {
    status: 200,
    headers,
  });
};

export const error = (e: any, headers: Record<string, string>) => {
  const { code: status, errors } = transformError(e) as ResponseError;

  return NextResponse.json(errors, {
    status,
    headers,
  });
};

export function transformError(
  error: Error | ZodError | ZitadelError | ResponseError
) {
  const items = [
    {
      description: "error instanceof Error",
      match: () => error instanceof Error && error.name === "Error",
      do: () => ({
        code: 400,
        errors: {
          code: ErrorCode.INVALID_DATA,
          message: (error as Error).message,
          error,
        },
      }),
    },
    {
      description: "common error",
      match: () => {
        const e = error as ResponseError;
        return !!e.code && !!e.error && !!e.error.code;
      },
      do: () => error as ResponseError,
    },
    {
      description: "Not yet handle",
      match: () => true,
      do: () => ({ code: 500, errors: { error } }),
    },
  ];

  for (const item of items) {
    if (item.match()) {
      console.log(`debug:description`, item.description);
      return item.do();
    }
  }
}

export const defaultHandler = async <T extends Default>(
  params: {
    request: NextRequest;
    responseHeaders: Record<string, string>;
    tracingName?: string;
  },
  handle: (body: T["data"]) => Promise<T["result"]>
) => {
  const { request, responseHeaders = {}, tracingName = "" } = params;
  const userAgent = request.headers.get("user-agent");

  try {
    const { body } =
      request.method === "GET" || request.method === "DELETE"
        ? { body: {} }
        : await parseRequest<T["data"]>(request);

    const result = await handle(body);
    return ok(result, responseHeaders);
  } catch (err) {
    console.log(`debug:${tracingName}`, userAgent, request.method, err);
    return error(err, responseHeaders);
  }
};
