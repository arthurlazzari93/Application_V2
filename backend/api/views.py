from rest_framework import viewsets, generics, status
from .models import Plano, Parcela, Consultor, Venda, ControleDeRecebimento
from .serializers import (
    UserSerializer,
    PlanoSerializer,
    ParcelaSerializer,
    ConsultorSerializer,
    VendaSerializer,
    ControleDeRecebimentoSerializer,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.decorators import api_view
from datetime import date
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

#class ClienteViewSet(viewsets.ModelViewSet):
#    queryset = Cliente.objects.all()
#    serializer_class = ClienteSerializer
#    permission_classes = [IsAuthenticated]

class PlanoViewSet(viewsets.ModelViewSet):
    queryset = Plano.objects.all()
    serializer_class = PlanoSerializer
    permission_classes = [IsAuthenticated]

class ParcelaViewSet(viewsets.ModelViewSet):
    queryset = Parcela.objects.all()
    serializer_class = ParcelaSerializer
    permission_classes = [IsAuthenticated]

class ConsultorViewSet(viewsets.ModelViewSet):
    queryset = Consultor.objects.all()
    serializer_class = ConsultorSerializer
    permission_classes = [IsAuthenticated]

class VendaViewSet(viewsets.ModelViewSet):
    queryset = Venda.objects.all()
    serializer_class = VendaSerializer
    permission_classes = [IsAuthenticated]

class ControleDeRecebimentoViewSet(viewsets.ModelViewSet):
    queryset = ControleDeRecebimento.objects.all()
    serializer_class = ControleDeRecebimentoSerializer
    permission_classes = [IsAuthenticated]

class ParcelasAtrasadasList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hoje = date.today()
        # Atualizar status para 'Atrasado' se data prevista < hoje e status ainda for 'Não Recebido'
        ControleDeRecebimento.objects.filter(
            status='Não Recebido',
            data_prevista_recebimento__lt=hoje
        ).update(status='Atrasado')

        # Obter parcelas com status 'Atrasado'
        parcelas_atrasadas = ControleDeRecebimento.objects.filter(status='Atrasado')
        serializer = ControleDeRecebimentoSerializer(parcelas_atrasadas, many=True)
        return Response(serializer.data)

@api_view(['POST'])
def marcar_parcela_recebida(request, pk):
    try:
        parcela = ControleDeRecebimento.objects.get(pk=pk)
    except ControleDeRecebimento.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    parcela.status = 'Recebido'
    parcela.data_recebimento = timezone.now().date()
    parcela.save()
    return Response(status=status.HTTP_200_OK)