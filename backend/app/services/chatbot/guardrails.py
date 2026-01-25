"""Topic guardrails - blocks off-topic questions and prompt injection attempts."""

import re

# =============================================================================
# OFF-TOPIC DETECTION
# =============================================================================

# Off-topic words with word boundaries to avoid false positives
# e.g., "Sportmanagement" should not be blocked, but "Sport" alone should
OFF_TOPIC_WORDS = re.compile(
    r"\b(weather|kochen|rezept|recipe|football|"
    r"film|movie|musik|music|witz|joke|gedicht|poem)\b",
    re.IGNORECASE,
)

# Command-style prompts requesting off-topic content
OFF_TOPIC_COMMANDS = re.compile(
    r"write me a|tell me a|"
    r"debug|explain.*javascript",
    re.IGNORECASE,
)

OFF_TOPIC_RESPONSE = """I can only answer questions about **credit recognition at TUM**.

Topics: OLA, Erasmus+, grade conversion, FPSO, Master Informatics.

Please ask a question about these topics."""

# =============================================================================
# PROMPT INJECTION DETECTION
# =============================================================================

# Patterns that indicate prompt injection attempts
INJECTION_PATTERNS = re.compile(
    r"ignore.*(previous|all|above).*instructions|"
    r"forget.*(everything|all|instructions)|"
    r"you are now|from now on you|"
    r"new (role|persona|identity)|"
    r"act as|pretend to be|roleplay as|"
    r"let'?s play a game|"
    r"system prompt|your (prompt|instructions|configuration)|"
    r"repeat.*(prompt|instructions)|"
    r"output.*(prompt|instructions)|"
    r"reveal.*(prompt|instructions)|"
    r"what are your (rules|instructions)|"
    r"how are you configured|"
    r"uncensored|without restrictions|no limitations|"
    r"jailbreak|bypass|override",
    re.IGNORECASE,
)

# Patterns for social engineering / authority claims
SOCIAL_ENGINEERING_PATTERNS = re.compile(
    r"i am (the|a|your) (supervisor|admin|developer|creator|owner)|"
    r"for (documentation|testing|academic|educational|research) purposes|"
    r"this is (just )?a test|"
    r"i need to (understand|know|see) how (this|you)|"
    r"internal (documentation|use)|"
    r"authorized to|permission to",
    re.IGNORECASE,
)

# Code generation requests (off-topic for academic advisor)
# More specific patterns to avoid blocking legitimate academic questions
CODE_GENERATION_PATTERNS = re.compile(
    r"(write|generate|create|implement|code).*(python|javascript|java|script|program|function|algorithm)|"
    r"\b(bubble.?sort|hello.?world|fibonacci|quicksort)\b|"
    r"(debug|fix).*(code|script|error)|"
    r"how to (code|program|implement)",
    re.IGNORECASE,
)

INJECTION_RESPONSE = """I'm designed to help with credit recognition at TUM only.

I cannot:
- Change my role or behavior
- Reveal system configurations
- Generate code or off-topic content

Please ask about: OLA, credit recognition, grade conversion, FPSO, or Master Informatics."""


def check_guardrails(message: str) -> tuple[bool, str | None]:
    """
    Check message against guardrails.

    Returns (is_allowed, rejection_message_if_blocked).

    Defense layers:
    1. Prompt injection detection (highest priority)
    2. Social engineering detection
    3. Code generation requests
    4. Off-topic content detection
    """
    # Security checks (highest priority - same response for all)
    security_patterns = [INJECTION_PATTERNS, SOCIAL_ENGINEERING_PATTERNS, CODE_GENERATION_PATTERNS]
    if any(pattern.search(message) for pattern in security_patterns):
        return False, INJECTION_RESPONSE

    # Off-topic content (lower priority - different response)
    if OFF_TOPIC_WORDS.search(message) or OFF_TOPIC_COMMANDS.search(message):
        return False, OFF_TOPIC_RESPONSE

    return True, None
