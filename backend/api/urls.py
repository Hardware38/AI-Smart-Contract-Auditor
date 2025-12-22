from django.urls import path
from .views import save_audit, audit_history

urlpatterns = [
    path("save_audit", save_audit),
    path("audit_history", audit_history),
]
