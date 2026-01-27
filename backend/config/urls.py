from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

# Simple home view
def home(request):
    return JsonResponse({"message": "Welcome to GarageX API!"})

urlpatterns = [
    path('', home, name='home'),  
    path('admin/', admin.site.urls),

    # JWT token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Include app URLs
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('supplier.purchase_order_urls')),
    
    # --- UPDATE THESE TWO LINES ONLY ---
    path('api/garage/', include('garage.urls')),    # Added 'api/'
    path('api/supplier/', include('supplier.urls')), # Added 'api/'
    # ------------------------------------

    path('api-auth/', include('rest_framework.urls')),
]