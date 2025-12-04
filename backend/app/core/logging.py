"""
Logging Configuration

Centralized logging setup
"""

import logging
import sys

def setup_logging():
    """Configure application logging"""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

logger = logging.getLogger("arip")

# TODO: Add file logging
# TODO: Add structured logging (JSON)
# TODO: Add log rotation
