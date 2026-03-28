import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

async function hashKey(raw: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function authenticate(req: Request): Promise<string | Response> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return json({ error: "Missing or invalid Authorization header" }, 401);
  }
  const token = auth.replace("Bearer ", "");
  const keyHash = await hashKey(token);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return json({ error: "Invalid API key" }, 401);
  }

  // Update last_used_at
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("key_hash", keyHash);

  return data.user_id as string;
}

function parseRoute(pathname: string): { resource: string; id?: string; secondLast: string } {
  const parts = pathname.split("/").filter(Boolean);
  const resource = parts.length >= 1 ? parts[parts.length - 1] : "";
  const secondLast = parts.length >= 2 ? parts[parts.length - 2] : "";

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(resource)) {
    return { resource: secondLast, id: resource, secondLast: parts.length >= 3 ? parts[parts.length - 3] : "" };
  }
  return { resource, secondLast };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authResult = await authenticate(req);
  if (authResult instanceof Response) return authResult;
  const userId = authResult;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const url = new URL(req.url);
  const { resource, id, secondLast } = parseRoute(url.pathname);
  const method = req.method;

  try {
    if (resource === "services") {
      return await handleServices(supabase, method, id, userId, req, url);
    } else if (resource === "lookup" && secondLast === "episodes") {
      return await handleEpisodeLookup(supabase, userId, url);
    } else if (resource === "episodes") {
      return await handleEpisodes(supabase, method, id, userId, req, url);
    } else {
      return json(
        {
          error: "Not found",
          available_endpoints: [
            "/services", "/services/:id",
            "/episodes", "/episodes/:id",
            "/episodes/lookup?service_slug=xxx&ep_no=1,2,3",
          ],
        },
        404
      );
    }
  } catch (e) {
    console.error("API error:", e);
    return json({ error: "Internal server error" }, 500);
  }
});

async function handleServices(
  supabase: any,
  method: string,
  id: string | undefined,
  userId: string,
  req: Request,
  url: URL
) {
  switch (method) {
    case "GET": {
      if (id) {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .eq("user_id", userId)
          .single();
        if (error) return json({ error: "Service not found" }, 404);
        return json({ data });
      }
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", userId)
        .order("name");
      if (error) return json({ error: error.message }, 500);
      return json({ data });
    }
    case "POST": {
      const body = await req.json();
      const { name, slug, default_platform, platform_urls } = body;
      if (!name || !slug || !default_platform) {
        return json(
          { error: "name, slug, and default_platform are required" },
          400
        );
      }
      const { data, error } = await supabase
        .from("services")
        .insert({ name, slug, default_platform, platform_urls: platform_urls || {}, user_id: userId })
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ data }, 201);
    }
    case "PUT": {
      if (!id) return json({ error: "Service ID required" }, 400);
      const body = await req.json();
      const { user_id: _, id: __, ...updates } = body;
      const { data, error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }
    case "DELETE": {
      if (!id) return json({ error: "Service ID required" }, 400);
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) return json({ error: error.message }, 400);
      return json({ message: "Deleted" });
    }
    default:
      return json({ error: "Method not allowed" }, 405);
  }
}

async function handleEpisodes(
  supabase: any,
  method: string,
  id: string | undefined,
  userId: string,
  req: Request,
  url: URL
) {
  switch (method) {
    case "GET": {
      if (id) {
        const { data, error } = await supabase
          .from("episodes")
          .select("*")
          .eq("id", id)
          .eq("user_id", userId)
          .single();
        if (error) return json({ error: "Episode not found" }, 404);
        return json({ data });
      }
      let query = supabase
        .from("episodes")
        .select("*")
        .eq("user_id", userId)
        .order("ep_no", { ascending: false });

      const serviceId = url.searchParams.get("service_id");
      if (serviceId) query = query.eq("service_id", serviceId);

      const status = url.searchParams.get("status");
      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) return json({ error: error.message }, 500);
      return json({ data });
    }
    case "POST": {
      const body = await req.json();
      const { service_id, ep_no } = body;
      if (!service_id || ep_no === undefined) {
        return json({ error: "service_id and ep_no are required" }, 400);
      }
      // Verify service belongs to user
      const { data: svc } = await supabase
        .from("services")
        .select("id")
        .eq("id", service_id)
        .eq("user_id", userId)
        .single();
      if (!svc) return json({ error: "Service not found" }, 404);

      const { user_id: _, id: __, ...rest } = body;
      const { data, error } = await supabase
        .from("episodes")
        .insert({ ...rest, user_id: userId })
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ data }, 201);
    }
    case "PUT": {
      if (!id) return json({ error: "Episode ID required" }, 400);
      const body = await req.json();
      const { user_id: _, id: __, ...updates } = body;
      const { data, error } = await supabase
        .from("episodes")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }
    case "DELETE": {
      if (!id) return json({ error: "Episode ID required" }, 400);
      const { error } = await supabase
        .from("episodes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) return json({ error: error.message }, 400);
      return json({ message: "Deleted" });
    }
    default:
      return json({ error: "Method not allowed" }, 405);
  }
}

async function handleEpisodeLookup(
  supabase: any,
  userId: string,
  url: URL
) {
  const serviceSlug = url.searchParams.get("service_slug");
  const epNoParam = url.searchParams.get("ep_no");

  if (!serviceSlug || !epNoParam) {
    return json({ error: "service_slug and ep_no are required" }, 400);
  }

  // Resolve service by slug
  const { data: svc } = await supabase
    .from("services")
    .select("id")
    .eq("slug", serviceSlug)
    .eq("user_id", userId)
    .single();

  if (!svc) return json({ error: "Service not found" }, 404);

  // Parse ep_no (supports comma-separated: "1,2,3")
  const epNos = epNoParam.split(",").map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n));
  if (epNos.length === 0) return json({ error: "Invalid ep_no" }, 400);

  if (epNos.length === 1) {
    const { data, error } = await supabase
      .from("episodes")
      .select("*")
      .eq("service_id", svc.id)
      .eq("user_id", userId)
      .eq("ep_no", epNos[0])
      .single();
    if (error) return json({ error: "Episode not found" }, 404);
    return json({ data });
  }

  // Multiple ep_nos
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("service_id", svc.id)
    .eq("user_id", userId)
    .in("ep_no", epNos)
    .order("ep_no");
  if (error) return json({ error: error.message }, 500);
  return json({ data });
}
