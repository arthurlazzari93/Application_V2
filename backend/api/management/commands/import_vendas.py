# backend/api/management/commands/import_vendas.py

from django.core.management.base import BaseCommand, CommandError
from api.models import Venda, Plano, Consultor
import openpyxl
import datetime
from decimal import Decimal

class Command(BaseCommand):
    help = 'Importa dados de vendas a partir de um arquivo XLSX'

    def add_arguments(self, parser):
        parser.add_argument(
            'excel_file',
            type=str,
            help='Caminho para o arquivo XLSX com os dados de vendas'
        )

    def handle(self, *args, **options):
        excel_file = options['excel_file']
        self.stdout.write(f"Iniciando importação de vendas do arquivo: {excel_file}")

        try:
            wb = openpyxl.load_workbook(excel_file)
            sheet = wb.active  # Assume que os dados estão na primeira aba
        except Exception as e:
            raise CommandError(f"Erro ao abrir o arquivo: {e}")

        count = 0
        # Itera a partir da segunda linha (a primeira contém os cabeçalhos)
        for idx, row in enumerate(sheet.iter_rows(min_row=2), start=2):
            try:
                numero_proposta    = row[0].value
                cliente_nome       = row[1].value
                cliente_documento  = row[2].value
                cliente_email      = row[3].value
                cliente_telefone   = row[4].value
                plano_id           = row[5].value
                consultor_id       = row[6].value
                valor_plano        = row[7].value
                desconto_consultor = row[8].value
                data_venda         = row[9].value
                data_vigencia      = row[10].value
                data_vencimento    = row[11].value
                canal_entrada      = row[12].value  # Novo campo

                # Validação básica: campos obrigatórios
                if not numero_proposta or not cliente_nome or not plano_id or not consultor_id or not data_venda:
                    self.stdout.write(self.style.WARNING(
                        f"Linha {idx} ignorada: campos obrigatórios ausentes."
                    ))
                    continue

                # Converte as datas se necessário
                if not isinstance(data_venda, datetime.date):
                    data_venda = datetime.datetime.strptime(data_venda, "%Y-%m-%d").date()
                if not isinstance(data_vigencia, datetime.date):
                    data_vigencia = datetime.datetime.strptime(data_vigencia, "%Y-%m-%d").date()
                if not isinstance(data_vencimento, datetime.date):
                    data_vencimento = datetime.datetime.strptime(data_vencimento, "%Y-%m-%d").date()

                # Converte valores numéricos para Decimal
                if valor_plano is not None:
                    valor_plano = Decimal(str(valor_plano))
                else:
                    self.stdout.write(self.style.WARNING(
                        f"Linha {idx} ignorada: valor_plano ausente."
                    ))
                    continue

                if desconto_consultor is not None:
                    desconto_consultor = Decimal(str(desconto_consultor))
                else:
                    desconto_consultor = Decimal("0.00")

                # Busque o objeto Plano
                try:
                    plano = Plano.objects.get(id=plano_id)
                except Plano.DoesNotExist:
                    self.stdout.write(self.style.WARNING(
                        f"Linha {idx} ignorada: Plano com ID {plano_id} não encontrado."
                    ))
                    continue

                # Busque o objeto Consultor
                try:
                    consultor = Consultor.objects.get(id=consultor_id)
                except Consultor.DoesNotExist:
                    self.stdout.write(self.style.WARNING(
                        f"Linha {idx} ignorada: Consultor com ID {consultor_id} não encontrado."
                    ))
                    continue

                # Criação da venda; o método save() do modelo gerará os controles de recebimento automaticamente
                Venda.objects.create(
                    numero_proposta=numero_proposta,
                    cliente_nome=cliente_nome,
                    cliente_documento=cliente_documento,
                    cliente_email=cliente_email,
                    cliente_telefone=cliente_telefone,
                    plano=plano,
                    consultor=consultor,
                    valor_plano=valor_plano,
                    desconto_consultor=desconto_consultor,
                    data_venda=data_venda,
                    data_vigencia=data_vigencia,
                    data_vencimento=data_vencimento,
                    canal_entrada=canal_entrada or "Indicação"
                )
                count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Erro na linha {idx}: {e}"))
        self.stdout.write(self.style.SUCCESS(f"Importação concluída. {count} vendas importadas com sucesso!"))
