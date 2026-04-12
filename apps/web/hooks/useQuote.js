"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { postQuote } from "../lib/api";

export default function useQuote(motorcycleId) {
  const [selectedParts, setSelectedParts] = useState([]);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const selectedPartsRef = useRef(selectedParts);

  useEffect(() => {
    selectedPartsRef.current = selectedParts;
  }, [selectedParts]);

  const togglePart = useCallback(
    async (part) => {
      if (!part) {
        return;
      }

      const currentParts = selectedPartsRef.current;
      const updatedParts = currentParts.some((selectedPart) => selectedPart.id === part.id)
        ? currentParts.filter((selectedPart) => selectedPart.id !== part.id)
        : [...currentParts, part];

      selectedPartsRef.current = updatedParts;
      setSelectedParts(updatedParts);

      if (!motorcycleId) {
        setQuote(null);
        return;
      }

      setQuoteLoading(true);

      try {
        const response = await postQuote(
          motorcycleId,
          updatedParts.map((selectedPart) => selectedPart.id),
        );
        setQuote(response);
      } catch (error) {
        setQuote(null);
        throw error;
      } finally {
        setQuoteLoading(false);
      }
    },
    [motorcycleId],
  );

  return { selectedParts, togglePart, quote, quoteLoading };
}
