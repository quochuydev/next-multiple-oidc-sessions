import type { Default } from "@/lib/api-caller";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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
  errors: {
    code: ErrorCode;
    message: string;
    error?: string;
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

export const ok = <T>(result?: T) => {
  return NextResponse.json(result || {}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": "https://app1.example.local",
    },
  });
};

export const error = (e: any) => {
  const { code: status, errors } = transformError(e) as ResponseError;
  return NextResponse.json(errors, { status });
};

export function transformError(
  error: Error | ZodError | ZitadelError | ResponseError
) {
  const items = [
    {
      description: "Zod validation error",
      match: () => {
        const e = error as ZodError;
        return !!e.code && !!e.error?.code && !!e.error?.message;
      },
      do: () => ({
        code: 400,
        errors: {
          code: ErrorCode.INVALID_DATA,
          message: (error as ZodError).error.message,
        },
      }),
    },
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
        return !!e.code && !!e.errors && !!e.errors.code;
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
      return item.do();
    }
  }
}

export const defaultHandler = async <T extends Default>(
  params: {
    request: NextRequest;
    tracingName?: string;
  },
  handle: (body: T["data"]) => Promise<T["result"]>
) => {
  const { request, tracingName = "" } = params;

  const userAgent = request.headers.get("user-agent");

  try {
    const { body } =
      request.method === "GET" || request.method === "DELETE"
        ? { body: {} }
        : await parseRequest<T["data"]>(request);

    const result = await handle(body);
    return ok(result);
  } catch (err) {
    console.log(`debug:${tracingName}`, userAgent, request.method, err);
    return error(err);
  }
};
