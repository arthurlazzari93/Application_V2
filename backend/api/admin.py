from django.contrib import admin
from .models import Plano, Parcela, Consultor, Venda, ControleDeRecebimento


admin.site.register(Plano)
admin.site.register(Parcela)
admin.site.register(Consultor)
admin.site.register(Venda)
admin.site.register(ControleDeRecebimento)
