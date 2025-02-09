# backend/api/management/commands/import_planos.py

from django.core.management.base import BaseCommand, CommandError
from api.models import Plano
import openpyxl

class Command(BaseCommand):
    help = 'Importa dados de planos a partir de um arquivo XLSX'

    def add_arguments(self, parser):
        parser.add_argument('excel_file', type=str, help='Caminho para o arquivo XLSX de planos')

    def handle(self, *args, **options):
        excel_file = options['excel_file']
        self.stdout.write(f"Iniciando importação de planos do arquivo: {excel_file}")

        try:
            wb = openpyxl.load_workbook(excel_file)
            sheet = wb.active  # Assume que os dados estão na primeira aba
        except Exception as e:
            raise CommandError(f"Erro ao abrir o arquivo: {e}")

        count = 0
        # Itera a partir da segunda linha (a primeira contém os cabeçalhos)
        for idx, row in enumerate(sheet.iter_rows(min_row=2), start=2):
            try:
                # Extraia os valores de cada coluna conforme a ordem dos cabeçalhos
                operadora = row[0].value
                comissionamento_total = row[1].value
                tipo = row[2].value
                numero_parcelas = row[3].value
                taxa_plano_valor = row[4].value
                taxa_plano_tipo = row[5].value

                # Validação simples: pular linha se algum campo obrigatório estiver ausente
                if not operadora or not tipo or not numero_parcelas:
                    self.stdout.write(self.style.WARNING(
                        f"Linha {idx} ignorada: campos obrigatórios ausentes."
                    ))
                    continue

                # Cria o objeto Plano
                Plano.objects.create(
                    operadora=operadora,
                    comissionamento_total=comissionamento_total or 0.00,
                    tipo=tipo,
                    numero_parcelas=numero_parcelas,
                    taxa_plano_valor=taxa_plano_valor or 0.00,
                    taxa_plano_tipo=taxa_plano_tipo or 'Valor Fixo'
                )
                count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Erro na linha {idx}: {e}"))
        self.stdout.write(self.style.SUCCESS(f"Importação concluída. {count} planos importados com sucesso!"))
