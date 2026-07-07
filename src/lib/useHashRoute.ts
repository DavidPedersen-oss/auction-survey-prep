// Hash-based routing (#/items, #/item/5, #/new, #/admin) so the phone
// back button works without a router dependency.
import { useEffect, useState } from "react";

export type Route =
  | { name: "items" }
  | { name: "new" }
  | { name: "item"; id: number }
  | { name: "admin" };

function parse(hash: string): Route {
  const h = hash.replace(/^#\/?/, "");
  if (h === "new") return { name: "new" };
  if (h === "admin") return { name: "admin" };
  const m = /^item\/(\d+)$/.exec(h);
  if (m) return { name: "item", id: parseInt(m[1], 10) };
  return { name: "items" };
}

export function navigate(to: string) {
  window.location.hash = to;
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
