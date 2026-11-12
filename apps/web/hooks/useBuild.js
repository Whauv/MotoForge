"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { postQuote } from "../lib/api";

const QUOTE_DEBOUNCE_MS = 140;

function parsePartIds(value) {
  return String(value || "")
    .split(",")
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

/**
 * Build state for the configurator.
 *
 * The URL is the source of truth (`?parts=3,7&ownsBike=true`), so a build can
 * be shared or bookmarked. One part per category: choosing a second exhaust
 * replaces the first. Quotes come from the API; stale responses are aborted.
 */
export default function useBuild(motorcycleId, partsByCategory) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const partsById = useMemo(() => {
    const map = new Map();
    Object.values(partsByCategory || {}).forEach((parts) =>
      parts.forEach((part) => map.set(part.id, part)),
    );
    return map;
  }, [partsByCategory]);

  const ownsBike = searchParams.get("ownsBike") === "true";
  const selectedIds = useMemo(
    () => parsePartIds(searchParams.get("parts")).filter((id) => partsById.has(id)),
    [partsById, searchParams],
  );
  const selectedParts = useMemo(
    () => selectedIds.map((id) => partsById.get(id)),
    [partsById, selectedIds],
  );

  const writeUrl = useCallback(
    (nextIds, nextOwnsBike) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextIds.length) {
        params.set("parts", nextIds.join(","));
      } else {
        params.delete("parts");
      }
      if (nextOwnsBike) {
        params.set("ownsBike", "true");
      } else {
        params.delete("ownsBike");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const togglePart = useCallback(
    (part) => {
      if (!part) {
        return;
      }
      const isSelected = selectedIds.includes(part.id);
      const withoutCategory = selectedIds.filter(
        (id) => partsById.get(id)?.category !== part.category,
      );
      writeUrl(isSelected ? withoutCategory : [...withoutCategory, part.id], ownsBike);
    },
    [ownsBike, partsById, selectedIds, writeUrl],
  );

  const setOwnsBike = useCallback(
    (nextOwnsBike) => writeUrl(selectedIds, nextOwnsBike),
    [selectedIds, writeUrl],
  );

  const [quote, setQuote] = useState(null);
  const [quoteStatus, setQuoteStatus] = useState("idle");
  const [quoteError, setQuoteError] = useState(null);
  const controllerRef = useRef(null);
  const selectionKey = selectedIds.join(",");

  useEffect(() => {
    if (!motorcycleId) {
      return undefined;
    }

    setQuoteStatus("loading");
    const timer = setTimeout(async () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await postQuote(
          motorcycleId,
          parsePartIds(selectionKey),
          ownsBike,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) {
          setQuote(response);
          setQuoteError(null);
          setQuoteStatus("ready");
        }
      } catch (error) {
        if (!error?.canceled && !controller.signal.aborted) {
          setQuoteError(error);
          setQuoteStatus("error");
        }
      }
    }, QUOTE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [motorcycleId, ownsBike, selectionKey]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return {
    selectedParts,
    selectedIds,
    togglePart,
    ownsBike,
    setOwnsBike,
    quote,
    quoteStatus,
    quoteError,
  };
}
