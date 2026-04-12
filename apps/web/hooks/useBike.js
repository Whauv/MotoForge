"use client";

import { useEffect, useState } from "react";

import { fetchMotorcycle } from "../lib/api";

export default function useBike(bikeId) {
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(Boolean(bikeId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBike() {
      if (!bikeId) {
        if (isMounted) {
          setBike(null);
          setLoading(false);
          setError(null);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchMotorcycle(bikeId);
        if (isMounted) {
          setBike(response);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError);
          setBike(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadBike();

    return () => {
      isMounted = false;
    };
  }, [bikeId]);

  return { bike, loading, error };
}
