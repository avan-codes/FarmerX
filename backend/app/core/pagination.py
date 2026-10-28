from fastapi import Query


class PageParams:
    def __init__(self,
                 page: int = Query(1, ge=1),
                 page_size: int = Query(20, ge=1, le=100)):
        self.page, self.page_size = page, page_size

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def envelope(items: list, page: int, page_size: int, total: int) -> dict:
    return {"items": items, "page": page, "page_size": page_size, "total": total}