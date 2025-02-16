// src/views/dashboards/IndicadoresV2.js

import React, { useState, useEffect } from 'react';
import api from '../../../axiosConfig';
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Input,
  CardTitle,

} from 'reactstrap';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { chartOptions } from 'variables/charts';
import CardsHeader from "components/Headers/CardsHeader.js";

// Função auxiliar: filtra um array com base num par de datas (padrão: campo "data_venda")
const filtrarPorPeriodo = (array, start, end, field = 'data_venda') => {
  return array.filter(item => {
    const date = new Date(item[field]);
    return date >= new Date(start) && date <= new Date(end);
  });
};

const IndicadoresV2 = () => {
  // Período padrão anual (fixo) para widgets que não possuem filtro editável (ex.: Faturamento Mensal)
  const now = new Date();
  const anualStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const anualEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const defaultGlobalStart = anualStartDate.toISOString().split("T")[0];
  const defaultGlobalEnd = anualEndDate.toISOString().split("T")[0];

  // Filtro global: aplicável a todos os indicadores (exceto Faturamento Mensal)
  const [globalStart, setGlobalStart] = useState(defaultGlobalStart);
  const [globalEnd, setGlobalEnd] = useState(defaultGlobalEnd);

  // Filtro específico para o card "Desempenho por Canal de Entrada"
  const [channelFilterStart, setChannelFilterStart] = useState(globalStart);
  const [channelFilterEnd, setChannelFilterEnd] = useState(globalEnd);


  // Estados para dados da API
  const [vendas, setVendas] = useState([]);
  const [consultores, setConsultores] = useState([]);
  const [recebimentos, setRecebimentos] = useState([]);

  // Carregamento dos dados
  useEffect(() => {
    fetchVendas();
    fetchConsultores();
    fetchRecebimentos();
  }, []);

  const fetchVendas = async () => {
    try {
      const response = await api.get('api/venda/');
      setVendas(response.data);
    } catch (error) {
      console.error("Erro ao buscar vendas", error);
    }
  };

  const fetchConsultores = async () => {
    try {
      const response = await api.get('api/consultor/');
      setConsultores(response.data);
    } catch (error) {
      console.error("Erro ao buscar consultores", error);
    }
  };

  const fetchRecebimentos = async () => {
    try {
      const response = await api.get('api/controlederecebimento/');
      setRecebimentos(response.data);
    } catch (error) {
      console.error("Erro ao buscar recebimentos", error);
    }
  };

  // Função para calcular o valor total do plano de uma venda
  const calcularValorTotalPlano = (venda) => {
    let valor = parseFloat(venda.valor_plano) - parseFloat(venda.desconto_consultor);
    const taxa_valor = parseFloat(venda.plano.taxa_plano_valor);
    const taxa_tipo = venda.plano.taxa_plano_tipo;
    if (taxa_tipo === 'Valor Fixo') {
      valor -= taxa_valor;
    } else if (taxa_tipo === 'Porcentagem') {
      valor -= valor * (taxa_valor / 100);
    }
    const comissionamento_total = parseFloat(venda.plano.comissionamento_total);
    return valor * (comissionamento_total / 100);
  };

  // ----- Indicadores Globais (usando o filtro global) -----
  const vendasGlobal = filtrarPorPeriodo(vendas, globalStart, globalEnd);
  const totalRevenue = vendasGlobal.reduce((acc, venda) => acc + calcularValorTotalPlano(venda), 0);
  const totalSales = vendasGlobal.length;
  const ticketMedio = totalSales > 0 ? totalRevenue / totalSales : 0;

  const recebimentosGlobal = filtrarPorPeriodo(recebimentos, globalStart, globalEnd, 'data_prevista_recebimento');
  const totalParcelas = recebimentosGlobal.length;
  const parcelasRecebidas = recebimentosGlobal.filter(rec => rec.status === 'Recebido').length;
  const taxaRecebimento = totalParcelas > 0 ? (parcelasRecebidas / totalParcelas) * 100 : 0;
  const atrasos = recebimentosGlobal
    .filter(rec => rec.status === 'Atrasado' && rec.data_recebimento)
    .map(rec => {
      const dataPrevista = new Date(rec.data_prevista_recebimento);
      const dataRecebimento = new Date(rec.data_recebimento);
      return (dataRecebimento - dataPrevista) / (1000 * 3600 * 24);
    });
  const diasMediosAtraso = atrasos.length > 0 ? atrasos.reduce((a, b) => a + b, 0) / atrasos.length : 0;

  // Faturamento por Consultor (usando o filtro global)
  const vendasConsultor = filtrarPorPeriodo(vendas, globalStart, globalEnd);
  const salesByConsultant = consultores.map(consultor => {
    const vendasDoConsultor = vendasConsultor.filter(v => v.consultor && v.consultor.id === consultor.id);
    const total = vendasDoConsultor.reduce((acc, venda) => acc + calcularValorTotalPlano(venda), 0);
    return { nome: consultor.nome, total };
  });
  const consultantLabels = salesByConsultant.map(item => item.nome);
  const consultantData = salesByConsultant.map(item => item.total);

  // Previsão de Recebimentos (usando o filtro global)
  const recebimentosPrev = filtrarPorPeriodo(recebimentos, globalStart, globalEnd, 'data_prevista_recebimento');
  const forecastByMonth = {};
  recebimentosPrev.forEach(rec => {
    const expectedDate = new Date(rec.data_prevista_recebimento);
    const monthKey = expectedDate.getFullYear() + '-' + String(expectedDate.getMonth() + 1).padStart(2, '0');
    if (!forecastByMonth[monthKey]) {
      forecastByMonth[monthKey] = { expected: 0, received: 0 };
    }
    forecastByMonth[monthKey].expected += parseFloat(rec.valor_parcela);
    if (rec.status === 'Recebido') {
      forecastByMonth[monthKey].received += parseFloat(rec.valor_parcela);
    }
  });
  const sortedForecastKeys = Object.keys(forecastByMonth).sort();
  const forecastLabels = sortedForecastKeys.map(key => {
    const [year, month] = key.split('-');
    const date = new Date(year, parseInt(month, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  });
  const expectedData = sortedForecastKeys.map(key => forecastByMonth[key].expected);
  const receivedData = sortedForecastKeys.map(key => forecastByMonth[key].received);

  // ----- Widget: Desempenho por Canal de Entrada (usa filtro específico) -----
  const vendasCanal = filtrarPorPeriodo(vendas, channelFilterStart, channelFilterEnd);
  const desempenhoCanal = {};
  vendasCanal.forEach(venda => {
    const canal = venda.canal_entrada || 'Indicação';
    if (!desempenhoCanal[canal]) {
      desempenhoCanal[canal] = { count: 0, revenue: 0 };
    }
    desempenhoCanal[canal].count += 1;
    desempenhoCanal[canal].revenue += calcularValorTotalPlano(venda);
  });
  const canalLabels = Object.keys(desempenhoCanal);
  const canalCountData = canalLabels.map(label => desempenhoCanal[label].count);






  // ----- Widget: Faturamento Mensal (FIXO – últimos 6 meses) -----
  const vendasanual = filtrarPorPeriodo(vendas, defaultGlobalStart, defaultGlobalEnd);
  const revenueByMonthanual = {};
  vendasanual.forEach(venda => {
    const saleDate = new Date(venda.data_venda);
    const monthKey = saleDate.getFullYear() + '-' + String(saleDate.getMonth() + 1).padStart(2, '0');
    const valorTotal = calcularValorTotalPlano(venda);
    revenueByMonthanual[monthKey] = (revenueByMonthanual[monthKey] || 0) + valorTotal;
  });
  const sortedMonthKeys = Object.keys(revenueByMonthanual).sort();
  const monthLabelsFixed = sortedMonthKeys.map(key => {
    const [year, month] = key.split('-');
    const date = new Date(year, parseInt(month, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  });
  const monthDataFixed = sortedMonthKeys.map(key => revenueByMonthanual[key]);
  const revenueChartData = {
    labels: monthLabelsFixed,
    datasets: [
      {
        label: "Faturamento",
        data: monthDataFixed,
        borderColor: "rgba(94,114,228,0.8)",
        backgroundColor: "rgba(94,114,228,0.4)",
        fill: true,
      },
    ],
  };

  const consultantChartData = {
    labels: consultantLabels,
    datasets: [
      {
        label: "Faturamento por Consultor (Valor Total do Plano)",
        data: consultantData,
        backgroundColor: "rgba(46,206,113,0.8)",
      },
    ],
  };

  const forecastChartData = {
    labels: forecastLabels,
    datasets: [
      {
        label: "Previsto",
        data: expectedData,
        backgroundColor: "rgba(255,193,7,0.8)",
      },
      {
        label: "Recebido",
        data: receivedData,
        backgroundColor: "rgba(23,162,184,0.8)",
      },
    ],
  };





  // --- Indicador: Crescimento Mensal / Variação Percentual ---


  // Calcula o faturamento total de cada mês para o indicador de crescimento

  vendasanual.forEach(venda => {
    const saleDate = new Date(venda.data_venda);
    const monthKey = saleDate.getFullYear() + '-' + String(saleDate.getMonth() + 1).padStart(2, '0');
    const valorTotal = calcularValorTotalPlano(venda);
    revenueByMonthanual[monthKey] = (revenueByMonthanual[monthKey] || 0) + valorTotal;
  });

  // Ordena os meses cronologicamente
  const sortedMonthsGrowth = Object.keys(revenueByMonthanual).sort();

  // Calcula a variação percentual entre meses (definindo 0 para o primeiro mês)
  const growthPercentages = sortedMonthsGrowth.map((month, index) => {
    if (index === 0) return 0;
    const prevRevenue = revenueByMonthanual[sortedMonthsGrowth[index - 1]];
    const currentRevenue = revenueByMonthanual[month];
    return ((currentRevenue - prevRevenue) / prevRevenue) * 100;
  });

  // Dados para o gráfico de linha
  const growthChartData = {
    labels: monthLabelsFixed,
    datasets: [
      {
        label: "Crescimento Mensal (%)",
        data: growthPercentages,
        fill: true,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: "rgba(75,192,192,1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };










  // --- Widget: Performance por Operadora (com limite de 20) ---
  // --- Widget: Índice de Esforço por Operadora ---
  // Aqui, usamos o filtro global (vendasGlobal) para agrupar as vendas por operadora.
  const effortByOperator = {};
  vendasGlobal.forEach(venda => {
    // Use o campo da operadora; se quiser incluir o tipo, ajuste a chave:
    // const operatorKey = `${venda.plano.operadora} - ${venda.plano.tipo}`;
    const operatorKey = venda.plano.operadora;
    const valorTotal = calcularValorTotalPlano(venda);
    if (!effortByOperator[operatorKey]) {
      effortByOperator[operatorKey] = { totalRevenue: 0, count: 0 };
    }
    effortByOperator[operatorKey].totalRevenue += valorTotal;
    effortByOperator[operatorKey].count += 1;
  });

  // Calcula a média de faturamento por venda para cada operadora.
  const effortIndex = Object.entries(effortByOperator).map(([operator, data]) => {
    const avg = data.count > 0 ? data.totalRevenue / data.count : 0;
    return { operator, avg, count: data.count };
  });

  // Ordena os resultados de forma decrescente pela média (índice de esforço)
  effortIndex.sort((a, b) => b.avg - a.avg);

  // Se desejar limitar às 20 maiores operadoras:
  const topEffortIndex = effortIndex.slice(0, 20);

  const effortLabels = topEffortIndex.map(item => item.operator);
  const effortData = topEffortIndex.map(item => item.avg);

  // Cria o objeto de dados para o gráfico
  const effortChartData = {
    labels: effortLabels,
    datasets: [
      {
        label: "Média de Faturamento por Venda",
        data: effortData,
        backgroundColor: "rgba(54, 162, 235, 0.8)",
      },
    ],
  };

  // Define as opções do gráfico
  const effortChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Índice de Esforço por Operadora",
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            context.dataset.label +
            ": " +
            context.parsed.y.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Média de Faturamento (R$)",
          font: { size: 14 },
        },
      },
      x: {
        title: {
          display: true,
          text: "Operadora",
          font: { size: 14 },
        },
      },
    },
  };










  // Cálculo do Total de Vendas para o mês vigente e do mês anterior

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  // Vendas do mês vigente (utilizando o campo data_venda)
  const vendasMesAtual = vendas.filter(venda => {
    const dataVenda = new Date(venda.data_venda);
    return dataVenda.getFullYear() === anoAtual && dataVenda.getMonth() === mesAtual;
  });

  // Total do mês vigente (valor do plano menos desconto do consultor)
  const totalVendasMesAtual = vendasMesAtual.reduce(
    (acc, venda) => acc + (parseFloat(venda.valor_plano) - parseFloat(venda.desconto_consultor)),
    0
  );

  // Para o mês anterior (ajusta para o caso de janeiro)
  const dataMesAnterior = new Date(anoAtual, mesAtual - 1, 1);
  const vendasMesAnterior = vendas.filter(venda => {
    const dataVenda = new Date(venda.data_venda);
    return dataVenda.getFullYear() === dataMesAnterior.getFullYear() &&
      dataVenda.getMonth() === dataMesAnterior.getMonth();
  });
  const totalVendasMesAnterior = vendasMesAnterior.reduce(
    (acc, venda) => acc + (parseFloat(venda.valor_plano) - parseFloat(venda.desconto_consultor)),
    0
  );

  // Cálculo da variação percentual entre os meses
  const variacaoPercentual =
    totalVendasMesAnterior !== 0
      ? ((totalVendasMesAtual - totalVendasMesAnterior) / totalVendasMesAnterior) * 100
      : 0;





  // Cálculo da Quantidade de Vendas para o mês vigente e do mês anterior



  // Vendas do mês vigente: filtra as vendas cujo campo data_venda esteja no mês e ano atuais

  const totalVendasCountMesAtual = vendasMesAtual.length;

  // Para o mês anterior (trata corretamente o caso de janeiro)


  const totalVendasCountMesAnterior = vendasMesAnterior.length;

  // Cálculo da variação percentual da quantidade de vendas
  const variacaoPercentualCount =
    totalVendasCountMesAnterior !== 0
      ? ((totalVendasCountMesAtual - totalVendasCountMesAnterior) / totalVendasCountMesAnterior) * 100
      : 0;





  // Cálculo do Ticket Médio para o mês vigente e o mês anterior

  // Filtra as vendas do mês vigente (mesmo que usamos vendasMesAtual anteriormente)

  const totalValorMesAtual = vendasMesAtual.reduce(
    (acc, venda) => acc + (parseFloat(venda.valor_plano) - parseFloat(venda.desconto_consultor)),
    0
  );
  const ticketMesAtual = vendasMesAtual.length > 0 ? totalValorMesAtual / vendasMesAtual.length : 0;

  // Filtra as vendas do mês anterior

  const totalValorMesAnterior = vendasMesAnterior.reduce(
    (acc, venda) => acc + (parseFloat(venda.valor_plano) - parseFloat(venda.desconto_consultor)),
    0
  );
  const ticketMesAnterior = vendasMesAnterior.length > 0 ? totalValorMesAnterior / vendasMesAnterior.length : 0;

  // Calcula a variação percentual do Ticket Médio
  const variacaoTicket = ticketMesAnterior !== 0
    ? ((ticketMesAtual - ticketMesAnterior) / ticketMesAnterior) * 100
    : 0;







  // --- Cálculos para o widget de Meta de Vendas Restante ---

  // Data atual e informações sobre o mês vigente


  // Filtra as vendas do mês vigente


  // Filtra as vendas do mês anterior (cuida do caso de janeiro)


  // Calcula a diferença (quanto falta para atingir o faturamento do mês anterior)
  const diferenca = totalVendasMesAnterior - totalVendasMesAtual;

  // Calcula quantos dias faltam até o final do mês vigente
  const fimDoMes = new Date(anoAtual, mesAtual + 1, 0); // último dia do mês atual
  const diasRestantes = fimDoMes.getDate() - hoje.getDate() + 1;

  // Calcula a meta diária (apenas se houver diferença positiva)
  const metaDiaria = diferenca > 0 ? diferenca / diasRestantes : 0;






  return (
    <>
      <CardsHeader name="Dashboard" parentName="Overview" />
      <Container fluid className="mt--6">
        {/* Filtro Global: aplicado a todos os indicadores, exceto Faturamento Mensal */}
        <Row className="justify-content-center">
          <Col className="card-wrapper" lg="4">
            <Card className="shadow">
              <Row className="row-example justify-content-md-center">
                <CardHeader>
                  <h3 className="mb-0">Escolha o Periódo</h3>
                </CardHeader>
              </Row>
              <CardBody>
                <Row className="row-example justify-content-md-center">
                  <FormGroup className="d-flex">
                    <Input

                      type="date"
                      value={globalStart}
                      onChange={(e) => {
                        setGlobalStart(e.target.value);
                        setChannelFilterStart(e.target.value); // opcional: sincronizar com canal
                      }}
                      className="form-control-sm"
                    />
                    <Col><h3 className="mb-0">Até</h3></Col>
                    <Input
                      type="date"
                      value={globalEnd}
                      onChange={(e) => {
                        setGlobalEnd(e.target.value);
                        setChannelFilterEnd(e.target.value);
                      }}
                      className="form-control-sm"
                    />
                  </FormGroup>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Cards Globais de Indicadores de Vendas (usam o filtro global) */}
        <Row className="">
          {/* Faturamento Total */}
          <Col md="">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Faturamento Total</h6>
                <h2 className="text-white mb-0">
                  {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </h2>
              </CardHeader>
            </Card>
          </Col>
          {/* Total de Vendas */}
          <Col md="">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Total de Vendas</h6>
                <h2 className="text-white mb-0">{totalSales}</h2>
              </CardHeader>
            </Card>
          </Col>
          {/* Ticket Médio */}
          <Col md="">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Ticket Médio</h6>
                <h2 className="text-white mb-0">
                  {ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </h2>
              </CardHeader>
            </Card>
          </Col>
          {/* Taxa de Recebimento */}
          <Col md="">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Taxa de Recebimento</h6>
                <h2 className="text-white mb-0">{taxaRecebimento.toFixed(2)}%</h2>
              </CardHeader>
            </Card>
          </Col>
          {/* Dias Médios de Atraso */}
          <Col md="">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Dias Médios de Atraso</h6>
                <h2 className="text-white mb-0">{diasMediosAtraso.toFixed(1)} dias</h2>
              </CardHeader>
            </Card>
          </Col>
        </Row>

        {/* Widget: Desempenho por Canal de Entrada (usa filtro específico) */}
        <Row className="">
          <Col md="">
            <Card className="shadow">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">Desempenho por Canal de Entrada</h3>
                </div>

              </CardHeader>

              <CardBody>
                <Pie
                  data={{
                    labels: canalLabels,
                    datasets: [{
                      label: "Vendas por Canal",
                      data: canalCountData,
                      backgroundColor: [
                        "rgba(255,99,132,0.8)",
                        "rgba(54,162,235,0.8)",
                        "rgba(255,206,86,0.8)",
                        "rgba(75,192,192,0.8)",
                        "rgba(153,102,255,0.8)",
                        "rgba(255,159,64,0.8)",
                      ],
                    }],
                  }}
                  options={chartOptions()}
                />
              </CardBody>
            </Card>
          </Col>


          {/* Widget: Faturamento por Consultor (usando o filtro global) */}

          <Col md="">
            <Card className="shadow">
              <CardHeader>
                <Row className="align-items-center">
                  <Col>
                    <h3 className="mb-0">Faturamento por Consultor</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Bar data={consultantChartData} options={chartOptions()} />
              </CardBody>
            </Card>
          </Col>


          {/* Widget: Previsão de Recebimentos (usando o filtro global) */}

          <Col md="">
            <Card className="shadow">
              <CardHeader>
                <Row className="align-items-center">
                  <Col>
                    <h3 className="mb-0">Previsão de Recebimentos</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Bar data={forecastChartData} options={chartOptions()} />
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Widget: Faturamento Mensal (FIXO – últimos 6 meses, sem filtro) */}
        <Row className="mb-4">
          <Col xl="6">
            <Card className="shadow">
              <CardHeader>
                <h3 className="mb-0">Faturamento</h3>
                <small className="text-muted font-weight-bold">Período de 12 Meses</small>
              </CardHeader>
              <CardBody>
                <Line
                  data={revenueChartData}
                  options={chartOptions()}
                />
              </CardBody>
            </Card>
          </Col>


          {/* Widget: Crescimento Mensal / Variação Percentual */}


          <Col xl="6">
            <Card className="shadow">
              <CardHeader>
                <h3 className="mb-0">Crescimento Mensal / Variação Percentual</h3>
                <small className="text-muted font-weight-bold">Período de 12 Meses</small>
              </CardHeader>
              <CardBody>
                <Line data={growthChartData}
                  options={chartOptions()} />
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Card className="shadow mb-4">
          <CardHeader>
            <h3 className="mb-0">Índice de Esforço por Operadora</h3>
          </CardHeader>
          <CardBody>
            <Bar data={effortChartData} options={effortChartOptions} />
          </CardBody>
        </Card>

        <Row>
          <Col md="6" xl="3">
            <Card className="bg-gradient-default">
              <CardBody>
                <Row>
                  <div className="col">
                    <CardTitle className="text-uppercase text-muted mb-0 text-white">
                      Vendas Realizadas
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0 text-white">
                      {totalVendasMesAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                  <Col className="col-auto">
                    <div className="icon icon-shape bg-white text-dark rounded-circle shadow">
                      <i className="ni ni-active-40" />
                    </div>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <p className="mb-0 text-sm text-light">
                      Mês Anterior:{" "}
                      <strong>
                        {totalVendasMesAnterior.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </strong>
                    </p>
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col>
                    <p className="mb-0 text-sm">
                      <span className={variacaoPercentual >= 0 ? "text-white mr-2" : "text-danger mr-2"}>
                        {variacaoPercentual >= 0 ? (
                          <i className="fa fa-arrow-up" />
                        ) : (
                          <i className="fa fa-arrow-down" />
                        )}{" "}
                        {Math.abs(variacaoPercentual).toFixed(2)}%
                      </span>
                      <span className="text-nowrap text-light">
                        de variação em relação ao mês anterior
                      </span>
                    </p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>

          <Col md="6" xl="3">
            <Card className="bg-gradient-default">
              <CardBody>
                <Row>
                  <div className="col">
                    <CardTitle className="text-uppercase text-muted mb-0 text-white">
                      Quantidade Vendida
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0 text-white">
                      {totalVendasCountMesAtual}
                    </span>
                  </div>
                  <Col className="col-auto">
                    <div className="icon icon-shape bg-white text-dark rounded-circle shadow">
                      <i className="ni ni-basket" />
                    </div>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <p className="mb-0 text-sm text-light">
                      Mês Anterior: <strong>{totalVendasCountMesAnterior}</strong>
                    </p>
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col>
                    <p className="mb-0 text-sm">
                      <span className={variacaoPercentualCount >= 0 ? "text-white mr-2" : "text-danger mr-2"}>
                        {variacaoPercentualCount >= 0 ? (
                          <i className="fa fa-arrow-up" />
                        ) : (
                          <i className="fa fa-arrow-down" />
                        )}{" "}
                        {Math.abs(variacaoPercentualCount).toFixed(2)}%
                      </span>
                      <span className="text-nowrap text-light">
                        de variação em relação ao mês anterior
                      </span>
                    </p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>


          <Col md="6" xl="3">
            <Card className="bg-gradient-default">
              <CardBody>
                <Row>
                  <div className="col">
                    <CardTitle className="text-uppercase text-muted mb-0 text-white">
                      Ticket Médio
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0 text-white">
                      {ticketMesAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                  <Col className="col-auto">
                    <div className="icon icon-shape bg-white text-dark rounded-circle shadow">
                      <i className="ni ni-money-coins" />
                    </div>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <p className="mb-0 text-sm text-light">
                      Mês Anterior:{" "}
                      <strong>
                        {ticketMesAnterior.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </strong>
                    </p>
                  </Col>
                </Row>
                <Row className="mt-1">
                  <Col>
                    <p className="mb-0 text-sm">
                      <span className={variacaoTicket >= 0 ? "text-white mr-2" : "text-danger mr-2"}>
                        {variacaoTicket >= 0 ? (
                          <i className="fa fa-arrow-up" />
                        ) : (
                          <i className="fa fa-arrow-down" />
                        )}{" "}
                        {Math.abs(variacaoTicket).toFixed(2)}%
                      </span>
                      <span className="text-nowrap text-light">
                        de variação em relação ao mês anterior
                      </span>
                    </p>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>


          <Col md="6" xl="3">
            <Card className="bg-gradient-warning">
              <CardBody>
                <Row>
                  <div className="col">
                    <CardTitle className="text-uppercase text-muted mb-0 text-white">
                      Meta de Vendas Restante
                    </CardTitle>
                    <span className="h2 font-weight-bold mb-0 text-white">
                      {diferenca > 0
                        ? diferenca.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : "Meta Atingida"}
                    </span>
                  </div>
                  <Col className="col-auto">
                    <div className="icon icon-shape bg-white text-dark rounded-circle shadow">
                      <i className="ni ni-spaceship" />
                    </div>
                  </Col>
                </Row>
                {diferenca > 0 && (
                  <Row className="mt-3">
                    <Col>
                      <p className="mb-0 text-sm text-light">
                        Mês Anterior:{" "}
                        <strong>
                          {totalVendasMesAnterior.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </strong>
                      </p>
                      <p className="mt-1 mb-0 text-sm text-light">
                        Faltam {metaDiaria.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de vendas por dia.
                      </p>
                    </Col>
                  </Row>
                )}
                {diferenca <= 0 && (
                  <Row className="mt-3">
                    <Col>
                      <p className="mb-0 text-sm text-light">
                        Parabéns, você já atingiu (ou superou) a meta do mês anterior!
                      </p>
                    </Col>
                  </Row>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>


      </Container>
    </>
  );
};

export default IndicadoresV2;
