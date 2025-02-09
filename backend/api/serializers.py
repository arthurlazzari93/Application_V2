from rest_framework import serializers
from .models import Plano, Parcela, Consultor, Venda, ControleDeRecebimento
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
  
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
  
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


#class ClienteSerializer(serializers.ModelSerializer):
#    class Meta:
#        model = Cliente
#        fields = '__all__'

class PlanoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plano
        fields = '__all__'

class ParcelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parcela
        fields = '__all__'

class ConsultorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultor
        fields = '__all__'



class ControleDeRecebimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ControleDeRecebimento
        fields = '__all__'


class VendaSerializer(serializers.ModelSerializer):
    # Representação para leitura
    plano = PlanoSerializer(read_only=True)
    consultor = ConsultorSerializer(read_only=True)
    parcelas_recebimento = ControleDeRecebimentoSerializer(source='controlederecebimento_set', many=True, read_only=True)
    
    # Campos para escrita: esses campos irão receber os IDs
    plano_id = serializers.PrimaryKeyRelatedField(queryset=Plano.objects.all(), write_only=True, source='plano')
    consultor_id = serializers.PrimaryKeyRelatedField(queryset=Consultor.objects.all(), write_only=True, source='consultor')
    
    class Meta:
        model = Venda
        fields = [
            'id',
            'numero_proposta',
            'cliente_nome',
            'cliente_documento',
            'cliente_email',
            'cliente_telefone',
            'plano',         # read-only
            'consultor',     # read-only
            'plano_id',      # write-only
            'consultor_id',  # write-only
            'valor_plano',
            'desconto_consultor',
            'data_venda',
            'data_vigencia',
            'data_vencimento',
            'parcelas_recebimento',
            'canal_entrada',
        ]

    def create(self, validated_data):
        venda = Venda.objects.create(**validated_data)
        return venda



