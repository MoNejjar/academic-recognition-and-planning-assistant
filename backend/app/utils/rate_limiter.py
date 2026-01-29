"""In-memory rate limiter with sliding window and automatic cleanup."""

import threading
import time
from typing import Final

CLEANUP_INTERVAL: Final = 300  # 5 minutes


class RateLimitExceeded(Exception):
    def __init__(self, retry_after: float):
        self.retry_after = retry_after
        self.message = f"Zu viele Anfragen. Bitte warte {int(retry_after)} Sekunden."
        super().__init__(self.message)


class RateLimiter:
    def __init__(self, requests_per_minute: int = 10):
        self.limit = requests_per_minute
        self.window = 60.0
        self._requests: dict[str, list[float]] = {}
        self._lock = threading.Lock()
        self._last_cleanup = time.time()

    def _cleanup_stale_entries(self, now: float) -> None:
        """Remove identifiers with no recent requests."""
        if now - self._last_cleanup < CLEANUP_INTERVAL:
            return
        cutoff = now - self.window
        self._requests = {
            k: [t for t in v if t > cutoff]
            for k, v in self._requests.items()
            if any(t > cutoff for t in v)
        }
        self._last_cleanup = now

    def check(self, identifier: str) -> None:
        """Raises RateLimitExceeded if limit exceeded."""
        now = time.time()
        cutoff = now - self.window

        with self._lock:
            self._cleanup_stale_entries(now)

            timestamps = [t for t in self._requests.get(identifier, []) if t > cutoff]

            if len(timestamps) >= self.limit:
                retry_after = min(timestamps) + self.window - now
                raise RateLimitExceeded(retry_after)

            timestamps.append(now)
            self._requests[identifier] = timestamps


_limiter: RateLimiter | None = None


def get_chat_rate_limiter() -> RateLimiter:
    global _limiter
    if _limiter is None:
        _limiter = RateLimiter(requests_per_minute=10)
    return _limiter
