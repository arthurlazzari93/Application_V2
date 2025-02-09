from django.db import models
from django.utils import timezone
import datetime
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from decimal import Decimal


#class Cliente(models.Model):
#    nome = models.CharField(max_length=255)
#    telefone = models.CharField(max_length=20, blank=True, null=True)
#    email = models.EmailField(blank=True, null=True)
#
#    def __str__(self):
#        return self.nome

class Plano(models.Model):
    TIPO_CHOICES = (
        ('PME', 'PME'),
        ('PF', 'Pessoa Física'),
        ('Adesão', 'Adesão'),
        ('PF (Odonto)', 'PF (Odonto)'),
        ('PME (Odonto)', 'PME (Odonto)'),
    )

    TAXA_TIPO_CHOICES = (
        ('Valor Fixo', 'Valor Fixo'),
        ('Porcentagem', 'Porcentagem'),
    )

    operadora = models.CharField(max_length=255)
    comissionamento_total = models.DecimalField(max_digits=6, decimal_places=2)  # Ex: 300.00%
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    numero_parcelas = models.PositiveIntegerField()
    taxa_plano_valor = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    taxa_plano_tipo = models.CharField(max_length=20, choices=TAXA_TIPO_CHOICES, default='Valor Fixo')

    class Meta:
        unique_together = ('operadora', 'tipo')

    def __str__(self):
        return f"{self.operadora} - {self.tipo}"

class Parcela(models.Model):
    plano = models.ForeignKey(Plano, on_delete=models.CASCADE)
    numero_parcela = models.PositiveIntegerField()
    porcentagem_parcela = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"Parcela {self.numero_parcela} - Plano {self.plano.operadora}"

class Consultor(models.Model):
    nome = models.CharField(max_length=255)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return self.nome


class Venda(models.Model):
    numero_proposta = models.CharField(max_length=100, unique=True)
    
    # Novos campos para dados do cliente
    cliente_nome = models.CharField(max_length=255)
    cliente_documento = models.CharField(max_length=50, default='', verbose_name="CPF/CNPJ")
    cliente_email = models.EmailField(blank=True, null=True)
    cliente_telefone = models.CharField(max_length=20, blank=True, null=True)
    
    # Mantém os demais relacionamentos
    plano = models.ForeignKey('Plano', on_delete=models.CASCADE)
    consultor = models.ForeignKey('Consultor', on_delete=models.CASCADE)
    valor_plano = models.DecimalField(max_digits=10, decimal_places=2)
    desconto_consultor = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    data_venda = models.DateField(default=timezone.now)
    data_vigencia = models.DateField()
    data_vencimento = models.DateField()
    canal_entrada = (
        ('Indicação', 'Indicação'),
        ('Portifolio', 'Portifolio'),
        ('Comprado', 'Comprado'),
        ('Rede Social', 'Rede Social'),
        ('Site', 'Site'),
        ('Parceria', 'Parceria'),
    )
    canal_entrada = models.CharField(
        max_length=50,
        choices=canal_entrada,
        default='Indicação'
    )

    def valor_liquido(self):
        valor = self.valor_plano - self.desconto_consultor

        taxa_valor = self.plano.taxa_plano_valor
        taxa_tipo = self.plano.taxa_plano_tipo

        if taxa_tipo == 'Valor Fixo':
            valor -= taxa_valor
        elif taxa_tipo == 'Porcentagem':
            valor -= valor * (taxa_valor / Decimal(100))
    
        return valor


    def __str__(self):
        return f"Proposta {self.numero_proposta} - {self.cliente_nome}"

    def save(self, *args, **kwargs):
        super(Venda, self).save(*args, **kwargs)
        # Atualiza ou recria os controles de recebimento conforme a lógica já existente
        self.controlederecebimento_set.all().delete()
        valor_liquido = self.valor_liquido()
        valor_plano_sem_descontos = self.valor_plano

        parcelas = Parcela.objects.filter(plano=self.plano).order_by('numero_parcela')
        previous_data_recebimento_or_prevista = None

        for parcela in parcelas:
            if parcela.numero_parcela == 1:
                valor_parcela = valor_liquido * (parcela.porcentagem_parcela / Decimal(100))
                data_prevista = self.data_vigencia + datetime.timedelta(days=30)
            else:
                valor_parcela = valor_plano_sem_descontos * (parcela.porcentagem_parcela / Decimal(100))
                data_base = previous_data_recebimento_or_prevista or (self.data_vigencia + datetime.timedelta(days=30 * (parcela.numero_parcela - 1)))
                data_prevista = data_base + datetime.timedelta(days=30)

            ControleDeRecebimento.objects.create(
                venda=self,
                parcela=parcela,
                valor_parcela=valor_parcela,
                data_prevista_recebimento=data_prevista,
                status='Não Recebido'
            )
            previous_data_recebimento_or_prevista = data_prevista  # ou atualizar conforme a lógica





class ControleDeRecebimento(models.Model):
    STATUS_CHOICES = (
        ('Recebido', 'Recebido'),
        ('Não Recebido', 'Não Recebido'),
        ('Atrasado', 'Atrasado'),
    )
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE)
    parcela = models.ForeignKey(Parcela, on_delete=models.CASCADE)
    valor_parcela = models.DecimalField(max_digits=10, decimal_places=2)
    data_prevista_recebimento = models.DateField()
    data_recebimento = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Não Recebido')
    numero_extrato = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Recebimento Parcela {self.parcela.numero_parcela} - Venda {self.venda.numero_proposta}"
    

# Definição dos sinais fora da classe Venda

@receiver(pre_save, sender=ControleDeRecebimento)
def store_previous_data_recebimento(sender, instance, **kwargs):
    if instance.pk:
        # Obtém a instância antes da atualização
        previous_instance = ControleDeRecebimento.objects.get(pk=instance.pk)
        instance._previous_data_recebimento = previous_instance.data_recebimento
    else:
        instance._previous_data_recebimento = None

@receiver(post_save, sender=ControleDeRecebimento)
def update_expected_dates(sender, instance, created, **kwargs):
    if not created:
        previous_data_recebimento = getattr(instance, '_previous_data_recebimento', None)
        if previous_data_recebimento != instance.data_recebimento:
            # A data de recebimento foi alterada
            subsequent_installments = ControleDeRecebimento.objects.filter(
                venda=instance.venda,
                parcela__numero_parcela__gt=instance.parcela.numero_parcela
            ).order_by('parcela__numero_parcela')

            previous_date = instance.data_recebimento or instance.data_prevista_recebimento

            for installment in subsequent_installments:
                data_base = previous_date
                new_data_prevista = data_base + datetime.timedelta(days=30)
                if installment.data_prevista_recebimento != new_data_prevista:
                    installment.data_prevista_recebimento = new_data_prevista
                    installment.save(update_fields=['data_prevista_recebimento'])
                previous_date = installment.data_recebimento or installment.data_prevista_recebimento
