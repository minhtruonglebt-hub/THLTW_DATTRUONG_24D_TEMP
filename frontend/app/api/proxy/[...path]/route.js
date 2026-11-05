const BACKEND_API = process.env.SPORTS_BACKEND_API ?? "http://127.0.0.1:8001/api";

async function forward(request, context) {
  const { path = [] } = await context.params;
  const incoming = new URL(request.url);
  const target = `${BACKEND_API}/${path.map(encodeURIComponent).join("/")}${incoming.search}`;
  const headers = new Headers();

  for (const name of ["accept", "authorization", "content-type"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const options = { method: request.method, headers, cache: "no-store" };
  if (!["GET", "HEAD"].includes(request.method)) {
    options.body = await request.arrayBuffer();
  }

  try {
    const upstream = await fetch(target, options);
    const responseHeaders = new Headers();
    for (const name of ["content-type", "cache-control"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ message: "Không kết nối được máy chủ Laravel." }, { status: 502 });
  }
}

export const GET = forward;
export const HEAD = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
