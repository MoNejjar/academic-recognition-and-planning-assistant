"""Topic guardrails - blocks clearly off-topic questions."""

import re

# Off-topic patterns with word boundaries to avoid false positives
# e.g., "Sportmanagement" should not be blocked, but "Sport" alone should
OFF_TOPIC_WORDS = re.compile(
    r"\b(wetter|weather|kochen|rezept|recipe|fußball|football|"
    r"film|movie|musik|music|witz|joke|gedicht|poem)\b",
    re.IGNORECASE,
)

# Command-style prompts (no word boundary needed)
OFF_TOPIC_COMMANDS = re.compile(
    r"schreib mir ein|write me a|erzähl mir|tell me a|"
    r"programmier|debug|erkläre mir python|explain.*javascript",
    re.IGNORECASE,
)

OFF_TOPIC_RESPONSE = """Ich kann nur Fragen zur **Credit-Anrechnung bei der TUM** beantworten.

Themen: OLA, Erasmus+, Notenumrechnung, FPSO, Master Informatik.

Bitte stelle eine Frage zu diesen Themen."""


def check_guardrails(message: str) -> tuple[bool, str | None]:
    """Returns (is_allowed, rejection_message_if_blocked)."""
    if OFF_TOPIC_WORDS.search(message) or OFF_TOPIC_COMMANDS.search(message):
        return False, OFF_TOPIC_RESPONSE
    return True, None
