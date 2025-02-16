import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle
} from "reactstrap";
import api from '../../axiosConfig';

function CardsHeader({ name, parentName }) {
  // Estado para armazenar as vendas obtidas da API
  const [vendas, setVendas] = useState([]);

  useEffect(() => {
    fetchVendas();
  }, []);

  const fetchVendas = async () => {
    try {
      const response = await api.get("api/venda/");
      setVendas(response.data);
    } catch (error) {
      console.error("Erro ao buscar vendas", error);
    }
  };

  // Função para calcular o valor líquido do plano (valor_plano menos desconto)

  // Datas para filtragem: mês vigente e mês anterior
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth(); // 0 = janeiro
  // Vendas do mês vigente
  const vendasMesAtual = vendas.filter(venda => {
    const dataVenda = new Date(venda.data_venda);
    return dataVenda.getFullYear() === anoAtual && dataVenda.getMonth() === mesAtual;
  });
  const totalVendasMesAtual = vendasMesAtual.reduce(
    (acc, venda) => acc + (parseFloat(venda.valor_plano) - parseFloat(venda.desconto_consultor)),
    0
  );
  const totalVendasCountMesAtual = vendasMesAtual.length;

  // Vendas do mês anterior (ajusta corretamente para janeiro)
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoMesAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
  const vendasMesAnterior = vendas.filter(venda => {
    const dataVenda = new Date(venda.data_venda);
    return dataVenda.getFullYear() === anoMesAnterior && dataVenda.getMonth() === mesAnterior;
  });
  const totalVendasMesAnterior = vendasMesAnterior.reduce(
    (acc, venda) => acc + (parseFloat(venda.valor_plano) - parseFloat(venda.desconto_consultor)),
    0
  );
  const totalVendasCountMesAnterior = vendasMesAnterior.length;

  // Variação percentual do faturamento e da quantidade
  const variacaoPercentual =
    totalVendasMesAnterior !== 0
      ? ((totalVendasMesAtual - totalVendasMesAnterior) / totalVendasMesAnterior) * 100
      : 0;
  const variacaoPercentualCount =
    totalVendasCountMesAnterior !== 0
      ? ((totalVendasCountMesAtual - totalVendasCountMesAnterior) / totalVendasCountMesAnterior) * 100
      : 0;

  // Ticket Médio
  const ticketMesAtual =
    vendasMesAtual.length > 0 ? totalVendasMesAtual / vendasMesAtual.length : 0;
  const ticketMesAnterior =
    vendasMesAnterior.length > 0 ? totalVendasMesAnterior / vendasMesAnterior.length : 0;
  const variacaoTicket =
    ticketMesAnterior !== 0
      ? ((ticketMesAtual - ticketMesAnterior) / ticketMesAnterior) * 100
      : 0;

  // Meta de Vendas Restante: quanto falta para igualar o faturamento do mês anterior
  const diferenca = totalVendasMesAnterior - totalVendasMesAtual;
  const fimDoMes = new Date(anoAtual, mesAtual + 1, 0); // último dia do mês atual
  const diasRestantes = fimDoMes.getDate() - hoje.getDate() + 1;
  const metaDiaria = diferenca > 0 ? diferenca / diasRestantes : 0;

  return (
    <div className="header bg-info pb-6">
      <Container fluid>
        <div className="header-body">
          {/* Você pode incluir um título ou breadcrumb aqui se desejar */}
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
        </div>
      </Container>
    </div>
  );
}

CardsHeader.propTypes = {
  name: PropTypes.string,
  parentName: PropTypes.string,
};

export default CardsHeader;
