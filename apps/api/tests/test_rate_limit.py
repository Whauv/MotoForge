from __future__ import annotations

import sys
from pathlib import Path

API_ROOT = Path(__file__).resolve().parents[1]
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app.utils import rate_limit  # noqa: E402
from app.utils.rate_limit import SlidingWindowLimiter  # noqa: E402


def test_blocks_after_limit_and_recovers_after_window():
    limiter = SlidingWindowLimiter(limit=2, window_seconds=60)

    assert limiter.allow("a", now=0)
    assert limiter.allow("a", now=1)
    assert not limiter.allow("a", now=2)
    assert limiter.allow("b", now=2), "other clients have their own bucket"
    assert limiter.allow("a", now=61)


def test_idle_buckets_are_swept():
    limiter = SlidingWindowLimiter(limit=5, window_seconds=60)
    for index in range(100):
        limiter.allow(f"client-{index}", now=float(index))

    limiter.allow("late", now=rate_limit.SWEEP_INTERVAL_SECONDS + 500)

    assert len(limiter) == 1
