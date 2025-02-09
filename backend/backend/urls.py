from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api import views
from rest_framework_simplejwt.views import ( # type: ignore
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

router = routers.DefaultRouter()
#router.register(r'clientes', views.ClienteViewSet)
router.register(r'consultor', views.ConsultorViewSet)
router.register(r'controlederecebimento', views.ControleDeRecebimentoViewSet)
router.register(r'parcela', views.ParcelaViewSet)
router.register(r'plano', views.PlanoViewSet)
router.register(r'venda', views.VendaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/parcelas-atrasadas/', views.ParcelasAtrasadasList.as_view(), name='parcelas-atrasadas'),
    path('api/parcelas/<int:pk>/marcar-recebida/', views.marcar_parcela_recebida, name='marcar-parcela-recebida'),
    
    # Rotas de autenticação JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Rota para registro de usuários
    path('api/register/', views.RegisterView.as_view(), name='register'),
]
