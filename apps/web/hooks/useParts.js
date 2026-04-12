"use client";

import { useEffect, useState } from "react";

import { fetchParts } from "../lib/api";

export default function useParts(bikeId) {
  const [parts, setParts] = useState({});
  const [loading, setLoading] = useState(Boolean(bikeId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadParts() {
      if (!bikeId) {
        if (isMounted) {
          setParts({});
          setLoading(false);
          setError(null);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchParts(bikeId);
        if (isMounted) {
          setParts(response || {});
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError);
          setParts({});
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadParts();

    return () => {
      isMounted = false;
    };
  }, [bikeId]);

  return { parts, loading, error };
}
