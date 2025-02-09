# backend/api/management/commands/import_parcelas.py

from django.core.management.base import BaseCommand, CommandError
from api.models import Plano, Parcela
import openpyxl

class Command(BaseCommand):
    help = 'Importa dados de parcelas a partir de um arquivo XLSX'

    def add_arguments(self, parser):
        parser.add_argument('excel_file', type=str, help='Caminho para o arquivo XLSX de parcelas')

    def handle(self, *args, **options):
        excel_file = options['excel_file']
        self.stdout.write(f"Iniciando importação de parcelas do arquivo: {excel_file}")

        try:
            wb = openpyxl.load_workbook(excel_file)
            sheet = wb.active  # Considera que os dados estão na primeira aba
        except Exception as e:
            raise CommandError(f"Erro ao abrir o arquivo: {e}")

        count = 0
        # Itera a partir da segunda linha (a primeira contém os cabeçalhos)
        for idx, row in enumerate(sheet.iter_rows(min_row=2), start=2):
            try:
                # Extraia os valores de cada coluna conforme a ordem dos cabeçalhos
                plano_id = row[0].value
                numero_parcela = row[1].value
                porcentagem_parcela = row[2].value

                # Validação simples: pular linha se algum campo obrigatório estiver ausente
                if not plano_id or not numero_parcela or porcentagem_parcela is None:
                    self.stdout.write(self.style.WARNING(
                        f"Linha {idx} ignorada: campos obrigatórios ausentes."
                    ))
                    continue

                # Busca o objeto Plano correspondente ao plano_id
                try:
                    plano = Plano.objects.get(id=plano_id)
                except Plano.DoesNotExist:
                    self.stdout.write(self.style.WARNING(
                        f"Linha {idx} ignorada: Plano com ID {plano_id} não encontrado."
                    ))
                    continue

                # Cria a instância da Parcela
                Parcela.objects.create(
                    plano=plano,
                    numero_parcela=numero_parcela,
                    porcentagem_parcela=porcentagem_parcela
                )
                count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Erro na linha {idx}: {e}"))
        self.stdout.write(self.style.SUCCESS(f"Importação concluída. {count} parcelas importadas com sucesso!"))
