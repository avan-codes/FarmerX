from fastapi import Request
from app.repositories.json_store import JsonStore


def get_store(request: Request) -> JsonStore:
    return request.app.state.store


def get_config(request: Request):
    return request.app.state.config_repo


def get_rules(request: Request):
    return request.app.state.rule_repo


def get_engine(request: Request):
    return request.app.state.rule_engine

def get_ai(request: Request):
    return request.app.state.ai_service


def get_market(request: Request):
    return request.app.state.market_service


def get_news(request: Request):
    return request.app.state.news_service


def get_pdf_service(request: Request):
    return request.app.state.pdf_service