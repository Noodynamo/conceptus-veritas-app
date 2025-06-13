"""
Logger Configuration Module for Conceptus Veritas.

This module configures logging for the entire application using Python's logging module.
It provides a consistent logging interface across the application with proper formatting,
levels, and outputs.

Usage:
    from src.utils.logger import get_logger

    logger = get_logger(__name__)
    logger.info("This is an informational message")
    logger.error("This is an error message", exc_info=True)  # Will include traceback if exception
"""

import logging
import os
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Dict, Optional, Union

# Configure log directory
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Define log formats
SIMPLE_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DETAILED_FORMAT = (
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s "
    "(%(filename)s:%(lineno)d)"
)

# Define log levels based on environment
DEFAULT_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
if os.environ.get("ENVIRONMENT") == "development":
    DEFAULT_LEVEL = "DEBUG"


def configure_logger() -> None:
    """
    Configure the root logger with appropriate handlers and formatters.
    
    This sets up console and file logging with rotation.
    """
    # Clear any existing handlers
    root_logger = logging.getLogger()
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Set the root logger level
    root_logger.setLevel(DEFAULT_LEVEL)

    # Console handler (all environments)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(SIMPLE_FORMAT))
    root_logger.addHandler(console_handler)

    # File handlers
    # Combined log (all levels)
    combined_handler = RotatingFileHandler(
        LOG_DIR / "combined.log",
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5,
    )
    combined_handler.setFormatter(logging.Formatter(DETAILED_FORMAT))
    root_logger.addHandler(combined_handler)

    # Error log (ERROR and above)
    error_handler = RotatingFileHandler(
        LOG_DIR / "error.log",
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5,
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter(DETAILED_FORMAT))
    root_logger.addHandler(error_handler)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the specified name.
    
    Args:
        name: Usually __name__ of the calling module
        
    Returns:
        A configured logger instance
    """
    return logging.getLogger(name)


# Configure logger on module import
configure_logger()


class RequestContextAdapter(logging.LoggerAdapter):
    """
    Adapter that adds request context information to logs.
    
    This is useful for tracing requests through the system.
    """

    def process(
        self, msg: str, kwargs: Dict[str, Union[str, int, bool, None]]
    ) -> tuple[str, Dict[str, Union[str, int, bool, None]]]:
        """
        Process the log message by adding request context.
        
        Args:
            msg: The log message
            kwargs: Keyword arguments for the logger
            
        Returns:
            Tuple of (modified_message, kwargs)
        """
        request_id = self.extra.get("request_id")
        user_id = self.extra.get("user_id")
        context = []
        
        if request_id:
            context.append(f"request_id={request_id}")
        if user_id:
            context.append(f"user_id={user_id}")
            
        if context:
            return f"{msg} [{' | '.join(context)}]", kwargs
        return msg, kwargs


def get_request_logger(
    name: str, request_id: Optional[str] = None, user_id: Optional[str] = None
) -> logging.LoggerAdapter:
    """
    Get a logger that includes request context information.
    
    Args:
        name: Usually __name__ of the calling module
        request_id: Optional ID to track requests across services
        user_id: Optional ID of the authenticated user
        
    Returns:
        A configured logger adapter with request context
    """
    logger = logging.getLogger(name)
    extra = {"request_id": request_id, "user_id": user_id}
    return RequestContextAdapter(logger, extra) 