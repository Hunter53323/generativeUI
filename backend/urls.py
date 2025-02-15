from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.urls import path
from .views import check_login


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})


urlpatterns = [
    # ... 其他URL配置 ...
    path("get-csrf-token/", get_csrf_token),
    path("api/check-login/", check_login, name="check-login"),
]
