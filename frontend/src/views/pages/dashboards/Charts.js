// src/views/dashboards/Dashboard.js

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
} from 'reactstrap';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { chartOptions } from 'variables/charts'; // ajuste o caminho conforme necessário
import CardsHeader from "components/Headers/CardsHeader.js";

const Dashboard = () => {
  // Período fixo semestral para os indicadores globais e widget "Faturamento Mensal"
  const now = new Date();
  const semestralStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const semestralEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // último dia do mês atual
  const semestralStart = semestralStartDate.toISOString().split("T")[0];
  const semestralEnd = semestralEndDate.toISOString().split("T")[0];

  // Estados para dados gerais vindos da API
  const [vendas, setVendas] = useState([]);
  const [consultores, setConsultores] = useState([]);
  const [recebimentos, setRecebimentos] = useState([]);

  // Estados dos filtros individuais para widgets que os terão (exceto Faturamento Mensal)
  const [consultantStartDate, setConsultantStartDate] = useState(semestralStart);
  const [consultantEndDate, setConsultantEndDate] = useState(semestralEnd);
  const [forecastStartDate, setForecastStartDate] = useState(semestralStart);
  const [forecastEndDate, setForecastEndDate] = useState(semestralEnd);

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

  // Função para calcular o valor total do plano de uma venda conforme a lógica:
  // 1. Valor líquido = (valor_plano - desconto_consultor)
  // 2. Se a taxa do plano for "Valor Fixo": subtrai taxa_plano_valor;
  //    Se for "Porcentagem": valor -= valor * (taxa_plano_valor / 100)
  // 3. Multiplica o resultado pelo comissionamento_total (dividido por 100)
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
    valor = valor * (comissionamento_total / 100);
    return valor;
  };

  // Função auxiliar para filtrar vendas por período (usando data_venda)
  const filtrarVendasPorPeriodo = (array, start, end) => {
    return array.filter(item => {
      const saleDate = new Date(item.data_venda);
      return saleDate >= new Date(start) && saleDate <= new Date(end);
    });
  };

  // ----- Novos Indicadores Globais (usando o período semestral) -----
  const vendasGlobal = filtrarVendasPorPeriodo(vendas, semestralStart, semestralEnd);
  const totalSalesGlobal = vendasGlobal.length;
  const totalRevenueGlobal = vendasGlobal.reduce(
    (acc, venda) => acc + calcularValorTotalPlano(venda),
    0
  );
  const ticketMedio = totalSalesGlobal > 0 ? totalRevenueGlobal / totalSalesGlobal : 0;

  // Taxa de Recebimento e Dias Médios de Atraso baseados em recebimentos no período semestral
  const recebimentosGlobal = recebimentos.filter(rec => {
    const expectedDate = new Date(rec.data_prevista_recebimento);
    return expectedDate >= new Date(semestralStart) && expectedDate <= new Date(semestralEnd);
  });
  const totalParcelas = recebimentosGlobal.length;
  const parcelasRecebidas = recebimentosGlobal.filter(rec => rec.status === 'Recebido').length;
  const taxaRecebimento = totalParcelas > 0 ? (parcelasRecebidas / totalParcelas) * 100 : 0;
  const atrasos = recebimentosGlobal
    .filter(rec => rec.status === 'Atrasado' && rec.data_recebimento)
    .map(rec => {
      const dataPrevista = new Date(rec.data_prevista_recebimento);
      const dataRecebimento = new Date(rec.data_recebimento);
      return (dataRecebimento - dataPrevista) / (1000 * 3600 * 24); // dias
    });
  const diasMediosAtraso = atrasos.length > 0 ? atrasos.reduce((a, b) => a + b, 0) / atrasos.length : 0;

  // Desempenho por Canal de Entrada (agrupado por canal_entrada dos vendasGlobal)
  const desempenhoCanal = {};
  vendasGlobal.forEach(venda => {
    const canal = venda.canal_entrada || 'Indicação';
    if (!desempenhoCanal[canal]) {
      desempenhoCanal[canal] = { count: 0, revenue: 0 };
    }
    desempenhoCanal[canal].count += 1;
    desempenhoCanal[canal].revenue += calcularValorTotalPlano(venda);
  });
  const canalLabels = Object.keys(desempenhoCanal);
  const canalCountData = canalLabels.map(label => desempenhoCanal[label].count);
  // eslint-disable-next-line no-unused-vars
  const canalRevenueData = canalLabels.map(label => desempenhoCanal[label].revenue);

  // ----- Widget: Faturamento Mensal (FIXO, últimos 6 meses) -----
  const vendasRevenue = filtrarVendasPorPeriodo(vendas, semestralStart, semestralEnd);
  const revenueByMonth = {};
  vendasRevenue.forEach(venda => {
    const saleDate = new Date(venda.data_venda);
    const monthKey = saleDate.getFullYear() + '-' + (saleDate.getMonth() + 1).toString().padStart(2, '0');
    const valorTotal = calcularValorTotalPlano(venda);
    revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + valorTotal;
  });
  const sortedMonthKeys = Object.keys(revenueByMonth).sort();
  const monthLabels = sortedMonthKeys.map(key => {
    const [year, month] = key.split('-');
    const date = new Date(year, parseInt(month, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  });
  const monthData = sortedMonthKeys.map(key => revenueByMonth[key]);

  const revenueChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Faturamento Mensal (Valor Total do Plano)",
        data: monthData,
        borderColor: "rgba(94,114,228,0.8)",
        backgroundColor: "rgba(94,114,228,0.4)",
        fill: true,
      },
    ],
  };

  // ----- Widget: Faturamento por Consultor (com filtros individuais) -----
  const vendasConsultant = filtrarVendasPorPeriodo(vendas, consultantStartDate, consultantEndDate);
  const salesByConsultant = consultores.map(consultor => {
    const vendasDoConsultor = vendasConsultant.filter(
      v => v.consultor && v.consultor.id === consultor.id
    );
    const total = vendasDoConsultor.reduce(
      (acc, venda) => acc + calcularValorTotalPlano(venda),
      0
    );
    return { nome: consultor.nome, total };
  });
  const consultantLabels = salesByConsultant.map(item => item.nome);
  const consultantData = salesByConsultant.map(item => item.total);

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

  // ----- Widget: Previsão de Recebimentos (com filtros individuais, barra dupla) -----
  const recebimentosPeriodo = recebimentos.filter(rec => {
    const expectedDate = new Date(rec.data_prevista_recebimento);
    return expectedDate >= new Date(forecastStartDate) && expectedDate <= new Date(forecastEndDate);
  });
  const forecastByMonth = {};
  recebimentosPeriodo.forEach(rec => {
    const expectedDate = new Date(rec.data_prevista_recebimento);
    const monthKey = expectedDate.getFullYear() + '-' + (expectedDate.getMonth() + 1).toString().padStart(2, '0');
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

  // Chart for Desempenho por Canal de Entrada (Exibido como Doughnut)
  const canalChartData = {
    labels: canalLabels,
    datasets: [
      {
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
      },
    ],
  };

  return (
    <>
      <CardsHeader name="Dashboard" parentName="Overview" />
      <Container fluid className="mt--6">
        {/* Top Row: Global Indicators */}
        <Row className="mb-4">
          <Col md="2">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Faturamento Total</h6>
                <h2 className="text-white mb-0">
                  {totalRevenueGlobal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </h2>
              </CardHeader>
            </Card>
          </Col>
          <Col md="2">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Total de Vendas</h6>
                <h2 className="text-white mb-0">{totalSalesGlobal}</h2>
              </CardHeader>
            </Card>
          </Col>
          <Col md="2">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Ticket Médio</h6>
                <h2 className="text-white mb-0">
                  {ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </h2>
              </CardHeader>
            </Card>
          </Col>
          <Col md="2">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Taxa de Recebimento</h6>
                <h2 className="text-white mb-0">{taxaRecebimento.toFixed(2)}%</h2>
              </CardHeader>
            </Card>
          </Col>
          <Col md="2">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Dias Médios de Atraso</h6>
                <h2 className="text-white mb-0">{diasMediosAtraso.toFixed(1)} dias</h2>
              </CardHeader>
            </Card>
          </Col>
          <Col md="2">
            <Card className="bg-gradient-primary shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-light ls-1 mb-1">Dias Médios de Atraso</h6>
                <h2 className="text-white mb-0">{diasMediosAtraso.toFixed(1)} dias</h2>
              </CardHeader>
            </Card>
          </Col>
          </Row>
          <Row>
          <Col xl="6">
            <Card className="shadow">
              <CardHeader>
                <h3 className="mb-0">Desempenho por Canal de Entrada</h3>
                <p className="text-muted">Período fixo: {semestralStart} até {semestralEnd}</p>
              </CardHeader>
              <CardBody>
                <Doughnut data={canalChartData} options={chartOptions()} />
              </CardBody>
            </Card>
          </Col>
        
        
          {/* Widget: Faturamento Mensal (fixo: últimos 6 meses, sem filtro) */}
        
          <Col xl="6">
            <Card className="shadow">
              <CardHeader>
                <h3 className="mb-0">Faturamento Mensal</h3>
                <p className="text-muted">Período fixo: {semestralStart} até {semestralEnd}</p>
              </CardHeader>
              <CardBody>
                <Line data={revenueChartData} options={chartOptions()} />
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Widget: Faturamento por Consultor (com filtros individuais) */}
        <Row className="mb-4">
          <Col md="6">
            <Card className="shadow">
              <CardHeader>
                <Row className="align-items-center">
                  <Col xs="12" md="6">
                    <h3 className="mb-0">Faturamento por Consultor</h3>
                  </Col>
                  <Col xs="12" md="6">
                    <FormGroup className="d-flex justify-content-end">
                      <Input
                        type="date"
                        value={consultantStartDate}
                        onChange={(e) => setConsultantStartDate(e.target.value)}
                        className="mr-2"
                      />
                      <Input
                        type="date"
                        value={consultantEndDate}
                        onChange={(e) => setConsultantEndDate(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Bar data={consultantChartData} options={chartOptions()} />
              </CardBody>
            </Card>
          </Col>


        {/* Widget: Previsão de Recebimentos (barra dupla por mês, com filtros individuais) */}

          <Col md="6">
            <Card className="shadow">
              <CardHeader>
                <Row className="align-items-center">
                  <Col xs="12" md="6">
                    <h3 className="mb-0">Previsão de Recebimentos</h3>
                  </Col>
                  <Col xs="12" md="6">
                    <FormGroup className="d-flex justify-content-end">
                      <Input
                        type="date"
                        value={forecastStartDate}
                        onChange={(e) => setForecastStartDate(e.target.value)}
                        className="mr-2"
                      />
                      <Input
                        type="date"
                        value={forecastEndDate}
                        onChange={(e) => setForecastEndDate(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Bar data={forecastChartData} options={chartOptions()} />
              </CardBody>
            </Card>
          </Col>
        </Row>
        
      </Container>
    </>
  );
};

export default Dashboard;
