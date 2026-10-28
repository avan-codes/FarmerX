from typing import Any


class ErrorCode:
    VALIDATION_ERROR = "VALIDATION_ERROR"
    NO_VALIDATED_RULE = "NO_VALIDATED_RULE"
    RULE_SET_NOT_APPROVED = "RULE_SET_NOT_APPROVED"
    RATE_LIMITED = "RATE_LIMITED"
    NOT_FOUND = "NOT_FOUND"
    FORBIDDEN = "FORBIDDEN"
    UNAUTHORIZED = "UNAUTHORIZED"
    CONFLICT = "CONFLICT"
    INTERNAL_ERROR = "INTERNAL_ERROR"


class ApiError(Exception):
    def __init__(self, code: str, status: int, title: str,
                 detail: str | None = None, errors: list[dict[str, Any]] | None = None,
                 headers: dict[str, str] | None = None):
        super().__init__(detail or title)
        self.code, self.status, self.title = code, status, title
        self.detail, self.errors = detail, errors or []
        self.headers = headers or {}

    def to_body(self, request_id: str) -> dict[str, Any]:
        return {
            "type": "about:blank",
            "title": self.title,
            "status": self.status,
            "detail": self.detail,
            "code": self.code,
            "errors": self.errors,
            "request_id": request_id,
        }


def not_found(what: str) -> ApiError:
    return ApiError(ErrorCode.NOT_FOUND, 404, "Not found", f"{what} was not found.")