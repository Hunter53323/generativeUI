from django.http import JsonResponse


def check_login(request):
    return JsonResponse({"isAuthenticated": request.user.is_authenticated})
