# backend/api/management/commands/export_planos.py

import csv
from django.core.management.base import BaseCommand
from api.models import Plano

class Command(BaseCommand):
    help = 'Exporta os dados dos planos para um arquivo CSV'

    def add_arguments(self, parser):
        parser.add_argument(
            'output_file',
            type=str,
            help='Caminho para o arquivo CSV de saída (ex.: planos.csv)'
        )

    def handle(self, *args, **options):
        output_file = options['output_file']
        planos = Plano.objects.all()

        try:
            with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                # Escreve os cabeçalhos
                writer.writerow([
                    'ID',
                    'Operadora',
                    'Tipo',
                    'Comissionamento Total',
                    'Número de Parcelas',
                    'Taxa Plano Valor',
                    'Taxa Plano Tipo'
                ])

                # Escreve os dados de cada plano
                for plano in planos:
                    writer.writerow([
                        plano.id,
                        plano.operadora,
                        plano.tipo,
                        plano.comissionamento_total,
                        plano.numero_parcelas,
                        plano.taxa_plano_valor,
                        plano.taxa_plano_tipo,
                    ])
            self.stdout.write(self.style.SUCCESS(f"Exportação concluída com sucesso para: {output_file}"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Erro ao exportar os dados: {e}"))
