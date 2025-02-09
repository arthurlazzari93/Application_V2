// src/views/ControleRecebimentoPanel.js

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../axiosConfig.js';
import {
  Table,
  Container,
  Row,
  Card,
  CardHeader,
  CardBody,
  Col,
  Button,
  Input,
  FormGroup,
  Progress,
  Label,
  Form,
  InputGroup,
  //InputGroupAddon,
  InputGroupText,
  Spinner,
  Alert,
  Collapse,
} from 'reactstrap';
import Header from 'components/Headers/SimpleHeader';
import { format, differenceInDays, parseISO } from 'date-fns';
import debounce from 'lodash.debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faSearch,
  faSyncAlt,
  faEye,
  faEyeSlash,
  faTable,
} from '@fortawesome/free-solid-svg-icons';

const ControleRecebimentoPanel = () => {
  const [vendas, setVendas] = useState([]);
  const [openVendaIds, setOpenVendaIds] = useState([]);
  const [editingRecebimentos, setEditingRecebimentos] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Em andamento');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVendas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVendas = async () => {
    try {
      const response = await api.get('api/venda/');
      setVendas(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar vendas:', err);
      setError('Erro ao buscar vendas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCollapse = (vendaId) => {
    setOpenVendaIds((prevState) =>
      prevState.includes(vendaId)
        ? prevState.filter((id) => id !== vendaId)
        : [...prevState, vendaId]
    );
  };

  const updateRecebimento = useCallback(async (recebimentoId, data) => {
    try {
      const response = await api.patch(`api/controlederecebimento/${recebimentoId}/`, data);
      const updatedRecebimento = response.data;
      setVendas((prevVendas) =>
        prevVendas.map((venda) => {
          const hasRecebimento = venda.parcelas_recebimento.some(
            (parcela) => parcela.id === updatedRecebimento.id
          );
          if (hasRecebimento) {
            const updatedParcelas = venda.parcelas_recebimento.map((parcela) =>
              parcela.id === updatedRecebimento.id ? updatedRecebimento : parcela
            );
            return {
              ...venda,
              parcelas_recebimento: updatedParcelas,
            };
          }
          return venda;
        })
      );
      // Limpar o estado de edição
      setEditingRecebimentos((prevState) => {
        const newState = { ...prevState };
        delete newState[recebimentoId];
        return newState;
      });
      setError(null);
    } catch (err) {
      console.error('Erro ao atualizar recebimento:', err);
      setError('Erro ao atualizar recebimento. Tente novamente mais tarde.');
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateRecebimento = useCallback(
    debounce((recebimentoId, data) => {
      updateRecebimento(recebimentoId, data);
    }, 500),
    [updateRecebimento]
  );

  const handleInputChange = (recebimentoId, field, value) => {
    setEditingRecebimentos((prevState) => ({
      ...prevState,
      [recebimentoId]: {
        ...prevState[recebimentoId],
        [field]: value,
      },
    }));

    debouncedUpdateRecebimento(recebimentoId, { [field]: value });
  };

  const calcularDiasAtraso = (dataPrevista, dataRecebimento) => {
    const dataPrevistaDate = parseISO(dataPrevista);
    const dataRecebimentoDate = dataRecebimento ? parseISO(dataRecebimento) : new Date();
    const diff = differenceInDays(dataRecebimentoDate, dataPrevistaDate);
    return diff > 0 ? diff : 0;
  };

  const handleMarcarRecebida = async (recebimentoId) => {


    try {
      const response = await api.patch(`api/controlederecebimento/${recebimentoId}/`, {
        status: 'Recebido',

      });
      const updatedRecebimento = response.data;
      setVendas((prevVendas) =>
        prevVendas.map((venda) => {
          const updatedParcelas = venda.parcelas_recebimento.map((parcela) =>
            parcela.id === updatedRecebimento.id ? updatedRecebimento : parcela
          );
          return {
            ...venda,
            parcelas_recebimento: updatedParcelas,
          };
        })
      );
      setError(null);
    } catch (err) {
      console.error('Erro ao marcar parcela como recebida:', err);
      setError('Erro ao marcar parcela como recebida. Tente novamente mais tarde.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getProgressColor = (percentual) => {
    if (percentual === 100) return 'success';
    if (percentual >= 50) return 'warning';
    return 'danger';
  };

  // Função para lidar com a mudança no campo de pesquisa com debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      // Cancelar o debounce ao desmontar o componente
      debouncedSearch.cancel();
      debouncedUpdateRecebimento.cancel();
    };
  }, [debouncedSearch, debouncedUpdateRecebimento]);

  // Função para filtrar as vendas
  const filteredVendas = vendas.filter((venda) => {
    const search = debouncedSearchTerm.toLowerCase();

    // Filtro de Pesquisa
    const numeroPropostaMatch = venda.numero_proposta.toLowerCase().includes(search);
    const clienteNomeMatch = venda.cliente_nome.toLowerCase().includes(search);

    const matchesSearch = numeroPropostaMatch || clienteNomeMatch;

    // Filtro de Status
    let matchesStatus = true;
    if (statusFilter === 'Em andamento') {
      // Verificar se a venda ainda tem parcelas a receber
      const parcelasNaoRecebidas = venda.parcelas_recebimento.some(
        (recebimento) => recebimento.status.toLowerCase() !== 'recebido'
      );
      matchesStatus = parcelasNaoRecebidas;
    } else if (statusFilter === 'Finalizados') {
      // Verificar se todas as parcelas foram recebidas
      const todasRecebidas = venda.parcelas_recebimento.every(
        (recebimento) => recebimento.status.toLowerCase() === 'recebido'
      );
      matchesStatus = todasRecebidas;
    }

    // Filtro de Intervalo de Datas
    let matchesDateRange = true;
    if (dateRange.startDate && dateRange.endDate) {
      const dataVenda = parseISO(venda.data_venda);
      const startDate = parseISO(dateRange.startDate);
      const endDate = parseISO(dateRange.endDate);

      matchesDateRange = dataVenda >= startDate && dataVenda <= endDate;
    } else if (dateRange.startDate) {
      const dataVenda = parseISO(venda.data_venda);
      const startDate = parseISO(dateRange.startDate);

      matchesDateRange = dataVenda >= startDate;
    } else if (dateRange.endDate) {
      const dataVenda = parseISO(venda.data_venda);
      const endDate = parseISO(dateRange.endDate);

      matchesDateRange = dataVenda <= endDate;
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  return (
    <>
      <Header />
      <Container className="mt--8" fluid>
        {loading ? (
          <Row className="justify-content-center">
            <Spinner color="primary" />
            <p className="text-center mt-3">Carregando vendas...</p>
          </Row>
        ) : (
          <>
            {error && (
              <Row>
                <Col>
                  <Alert color="danger">{error}</Alert>
                </Col>
              </Row>
            )}
            <Row>
              {/* Coluna dos Filtros */}
              <Col>
                <Card className="mb-4">
                  <CardHeader>
                    <h4 className="mb-0">
                      <FontAwesomeIcon icon={faFilter} className="mr-2" />
                      Filtros
                    </h4>
                  </CardHeader>
                  <CardBody>
                    <Form>
                      <Row form>
                        <Col md={6}>
                          {/* Campo de Pesquisa */}
                          <FormGroup>
                            <Label for="search">Pesquisar Vendas:</Label>
                            <InputGroup>
                              <Input
                                type="text"
                                name="search"
                                id="search"
                                placeholder="Digite o número da proposta ou nome do cliente"
                                value={searchTerm}
                                onChange={handleSearchChange}
                              />
                              <InputGroupText addonType="append">
                                <InputGroupText>
                                  <FontAwesomeIcon icon={faSearch} />
                                </InputGroupText>
                              </InputGroupText>
                            </InputGroup>
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          {/* Filtro de Status */}
                          <FormGroup tag="fieldset">
                            <legend>Status:</legend>
                            <FormGroup check inline>
                              <Label check>
                                <Input
                                  type="radio"
                                  name="statusFilter"
                                  value="Em andamento"
                                  checked={statusFilter === 'Em andamento'}
                                  onChange={(e) => setStatusFilter(e.target.value)}
                                />{' '}
                                Em andamento
                              </Label>
                            </FormGroup>
                            <FormGroup check inline>
                              <Label check>
                                <Input
                                  type="radio"
                                  name="statusFilter"
                                  value="Finalizados"
                                  checked={statusFilter === 'Finalizados'}
                                  onChange={(e) => setStatusFilter(e.target.value)}
                                />{' '}
                                Finalizados
                              </Label>
                            </FormGroup>
                            <FormGroup check inline>
                              <Label check>
                                <Input
                                  type="radio"
                                  name="statusFilter"
                                  value="Todos"
                                  checked={statusFilter === 'Todos'}
                                  onChange={(e) => setStatusFilter(e.target.value)}
                                />{' '}
                                Todos
                              </Label>
                            </FormGroup>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row form>
                        <Col md={6}>
                          {/* Data Inicial */}
                          <FormGroup>
                            <Label for="startDate">Data Inicial:</Label>
                            <Input
                              type="date"
                              name="startDate"
                              id="startDate"
                              value={dateRange.startDate}
                              onChange={(e) =>
                                setDateRange({ ...dateRange, startDate: e.target.value })
                              }
                            />
                          </FormGroup>
                        </Col>
                        <Col md={6}>
                          {/* Data Final */}
                          <FormGroup>
                            <Label for="endDate">Data Final:</Label>
                            <Input
                              type="date"
                              name="endDate"
                              id="endDate"
                              value={dateRange.endDate}
                              onChange={(e) =>
                                setDateRange({ ...dateRange, endDate: e.target.value })
                              }
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>

                {/* Card da Tabela de Controle de Recebimento */}
                <Card className="shadow">
                  <CardHeader className="border-0">
                    <h3 className="mb-0">
                      <FontAwesomeIcon icon={faTable} className="mr-2" />
                      Controle de Recebimento de Comissões
                    </h3>
                  </CardHeader>
                  <CardBody>
                    {filteredVendas.length === 0 ? (
                      <p>Nenhuma venda encontrada.</p>
                    ) : (
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>Número da Proposta</th>
                            <th>Cliente</th>
                            <th>Valor do Plano</th>
                            <th>Data da Venda</th>
                            <th>Recebimento</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredVendas.map((venda) => {
                            const totalParcelas = venda.parcelas_recebimento.length;
                            const parcelasRecebidas = venda.parcelas_recebimento.filter(
                              (recebimento) => recebimento.status.toLowerCase() === 'recebido'
                            ).length;
                            const percentualRecebido =
                              totalParcelas > 0 ? (parcelasRecebidas / totalParcelas) * 100 : 0;

                            return (
                              <React.Fragment key={venda.id}>
                                <tr>
                                  <td>{venda.numero_proposta}</td>
                                  <td>{venda.cliente_nome}</td>
                                  <td>{formatCurrency(venda.valor_plano)}</td>
                                  <td>{format(parseISO(venda.data_venda), 'dd/MM/yyyy')}</td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <span className="mr-2">
                                        {parcelasRecebidas}/{totalParcelas}
                                      </span>
                                      <div style={{ flex: 1 }}>
                                        <Progress
                                          value={percentualRecebido}
                                          color={getProgressColor(percentualRecebido)}
                                          barClassName="bg-gradient"
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <Button
                                      color="info"
                                      size="sm"
                                      onClick={() => toggleCollapse(venda.id)}
                                    >
                                      <FontAwesomeIcon
                                        icon={openVendaIds.includes(venda.id) ? faEyeSlash : faEye}
                                        className="mr-1"
                                      />
                                      {openVendaIds.includes(venda.id) ? 'Ocultar' : 'Detalhes'}
                                    </Button>
                                  </td>
                                </tr>
                                <tr>
                                  <td colSpan="6" style={{ padding: 0 }}>
                                    <Collapse isOpen={openVendaIds.includes(venda.id)}>
                                      <CardBody>
                                        <Table size="sm" responsive>
                                          <thead>
                                            <tr>
                                              <th>Número da Parcela</th>
                                              <th>Valor da Parcela</th>
                                              <th>Data Prevista de Recebimento</th>
                                              <th>Dias de Atraso</th>
                                              <th>Data Real de Recebimento</th>
                                              <th>Número do Extrato</th>
                                              <th>Status</th>
                                              <th>Ações</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {venda.parcelas_recebimento.map((recebimento) => (
                                              <tr key={recebimento.id}>
                                                <td>{recebimento.parcela.numero_parcela}</td>
                                                <td>{formatCurrency(recebimento.valor_parcela)}</td>
                                                <td>
                                                  {format(
                                                    parseISO(recebimento.data_prevista_recebimento),
                                                    'dd/MM/yyyy'
                                                  )}
                                                </td>
                                                <td>
                                                  {calcularDiasAtraso(
                                                    recebimento.data_prevista_recebimento,
                                                    recebimento.data_recebimento
                                                  ) > 0
                                                    ? `${calcularDiasAtraso(
                                                        recebimento.data_prevista_recebimento,
                                                        recebimento.data_recebimento
                                                      )} dias`
                                                    : '-'}
                                                </td>
                                                <td>
                                                  <Input
                                                    type="date"
                                                    value={
                                                      editingRecebimentos[recebimento.id]?.data_recebimento ||
                                                      recebimento.data_recebimento ||
                                                      ''
                                                    }
                                                    onChange={(e) =>
                                                      handleInputChange(
                                                        recebimento.id,
                                                        'data_recebimento',
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                </td>
                                                <td>
                                                  <Input
                                                    type="text"
                                                    value={
                                                      editingRecebimentos[recebimento.id]?.numero_extrato ||
                                                      recebimento.numero_extrato ||
                                                      ''
                                                    }
                                                    onChange={(e) =>
                                                      handleInputChange(
                                                        recebimento.id,
                                                        'numero_extrato',
                                                        e.target.value
                                                      )
                                                    }
                                                  />
                                                </td>
                                                <td>{recebimento.status}</td>
                                                <td>
                                                  {recebimento.status.toLowerCase() !== 'recebido' && (
                                                    <Button
                                                      color="success"
                                                      size="sm"
                                                      onClick={() => handleMarcarRecebida(recebimento.id)}
                                                    >
                                                      <FontAwesomeIcon icon={faSyncAlt} className="mr-1" />
                                                      Recebida
                                                    </Button>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </Table>
                                      </CardBody>
                                    </Collapse>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </Table>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default ControleRecebimentoPanel;
