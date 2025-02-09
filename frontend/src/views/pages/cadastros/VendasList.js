import React, { useState, useEffect } from 'react';
import api from '../../../axiosConfig.js';
import {
  Container,
  CardBody,
  Row,
  Card,
  CardHeader,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  Alert
} from 'reactstrap';
import Header from 'components/Headers/SimpleHeader';

// Importações do react-bootstrap-table2
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';

const { SearchBar } = Search;

const VendasList = () => {
  const [vendas, setVendas] = useState([]);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [newVenda, setNewVenda] = useState({
    cliente_nome: '',
    cliente_documento: '',
    cliente_email: '',
    cliente_telefone: '',
    plano_id: '',
    consultor_id: '',
    numero_proposta: '',
    valor_plano: '',
    desconto_consultor: '',
    data_venda: '',
    data_vigencia: '',
    data_vencimento: '',
  });
  const [planos, setPlanos] = useState([]);
  const [consultores, setConsultores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuração da paginação
  const pagination = paginationFactory({
    page: 1,
    alwaysShowAllBtns: true,
    showTotal: true,
    withFirstAndLast: false,
    sizePerPageRenderer: ({ onSizePerPageChange }) => (
      <div className="dataTables_length" id="datatable-basic_length">
        <label>
          Mostrar{' '}
          <select
            name="datatable-basic_length"
            aria-controls="datatable-basic"
            className="form-control form-control-sm"
            onChange={(e) => onSizePerPageChange(e.target.value)}
          >
            <option value="5">5</option>
            <option value="10" defaultValue>
              10
            </option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>{' '}
          registros.
        </label>
      </div>
    ),
  });

  // Definição das colunas da tabela
  const columns = [
    {
      dataField: 'actions',
      text: 'Ações',
      isDummyField: true,
      searchable: false, // Não queremos buscar no botão
      formatter: (cell, row) => (
        <Button
          color="info"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectVenda(row);
          }}
          size="sm"
        >
          Modificar
        </Button>
      ),
      headerStyle: { width: '100px' },
    },
    {
      dataField: 'numero_proposta',
      text: 'Número Proposta',
      sort: true,
    },
    {
      dataField: 'cliente_nome',
      text: 'Cliente',
      sort: true,
    },
    {
      dataField: 'plano',
      text: 'Plano',
      sort: true,
      formatter: (cell, row) =>
        row.plano ? `${row.plano.operadora} - ${row.plano.tipo}` : '',
      filterValue: (cell, row) =>
        row.plano ? `${row.plano.operadora} - ${row.plano.tipo}` : '',
    },
    {
      dataField: 'consultor',
      text: 'Consultor',
      sort: true,
      formatter: (cell, row) => row.consultor?.nome || '',
      filterValue: (cell, row) => row.consultor?.nome || '',
    },
    {
      dataField: 'canal_entrada',
      text: 'Canal de Entrada',
      sort: true,
    },
    {
      dataField: 'valor_plano',
      text: 'Valor Plano',
      sort: true,
    },
    {
      dataField: 'desconto_consultor',
      text: 'Desconto Consultor',
      sort: true,
    },
    {
      dataField: 'data_venda',
      text: 'Data Venda',
      sort: true,
    },
    {
      dataField: 'data_vigencia',
      text: 'Data Vigência',
      sort: true,
    },
    {
      dataField: 'data_vencimento',
      text: 'Data Vencimento',
      sort: true,
    },
  ];

  useEffect(() => {
    // Função para buscar os dados necessários
    const fetchData = async () => {
      try {
        const [planosResponse, consultoresResponse, vendasResponse] = await Promise.all([
          api.get('api/plano/'),
          api.get('api/consultor/'),
          api.get('api/venda/'),
        ]);

        setPlanos(planosResponse.data);
        setConsultores(consultoresResponse.data);
        setVendas(vendasResponse.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao buscar dados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para cadastrar ou modificar a venda
  const handleSaveVenda = async (e) => {
    e.preventDefault();
    const vendaData = selectedVenda ? selectedVenda : newVenda;

    try {
      if (selectedVenda) {
        // Atualizar venda existente
        const response = await api.put(`api/venda/${selectedVenda.id}/`, vendaData);
        setVendas(vendas.map((venda) => venda.id === selectedVenda.id ? response.data : venda));
        setSelectedVenda(null);
      } else {
        // Adicionar nova venda
        const response = await api.post('api/venda/', vendaData);
        setVendas([...vendas, response.data]);
        setNewVenda({
          cliente_nome: '',
          cliente_documento: '',
          cliente_email: '',
          cliente_telefone: '',
          plano_id: '',
          consultor_id: '',
          numero_proposta: '',
          valor_plano: '',
          desconto_consultor: '',
          data_venda: '',
          data_vigencia: '',
          data_vencimento: '',
        });
      }
      setError(null);
    } catch (err) {
      console.error('Erro ao salvar venda:', err.response);
      setError(`Erro ao salvar venda: ${JSON.stringify(err.response?.data)}`);
    }
  };

  // Função para selecionar uma venda para edição
  const handleSelectVenda = (venda) => {
    setSelectedVenda({
      ...venda,
      // Mantém os dados já disponíveis da venda (os campos de cliente já estão inclusos)
      plano_id: venda.plano.id,
      consultor_id: venda.consultor.id,
    });
    setError(null);
  };

  // Função para deletar uma venda
  const handleDeleteVenda = async () => {
    if (selectedVenda) {
      try {
        await api.delete(`api/venda/${selectedVenda.id}/`);
        setVendas(vendas.filter((venda) => venda.id !== selectedVenda.id));
        setSelectedVenda(null);
        setError(null);
      } catch (err) {
        console.error('Erro ao deletar venda:', err);
        setError('Erro ao deletar venda. Tente novamente mais tarde.');
      }
    }
  };

  // Função para iniciar uma nova venda
  const handleNewVenda = () => {
    setSelectedVenda(null);
    setNewVenda({
      cliente_nome: '',
      cliente_documento: '',
      cliente_email: '',
      cliente_telefone: '',
      plano_id: '',
      consultor_id: '',
      numero_proposta: '',
      valor_plano: '',
      desconto_consultor: '',
      data_venda: '',
      data_vigencia: '',
      data_vencimento: '',
    });
    setError(null);
  };

  // Função para atualizar os valores do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Converter campos numéricos para números
    if (['valor_plano', 'desconto_consultor'].includes(name)) {
      parsedValue = value ? parseFloat(value) : '';
    }

    // Converter IDs para inteiros
    if (['plano_id', 'consultor_id'].includes(name)) {
      parsedValue = value ? parseInt(value, 10) : '';
    }

    if (selectedVenda) {
      setSelectedVenda({ ...selectedVenda, [name]: parsedValue });
    } else {
      setNewVenda({ ...newVenda, [name]: parsedValue });
    }
  };

  // Renderização Condicional de Carregamento e Erro
  if (loading) {
    return (
      <>
        <Header />
        <Container className="mt--7" fluid>
          <Row className="justify-content-center">
            <Spinner color="primary" />
            <p className="text-center mt-3">Carregando vendas...</p>
          </Row>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt--8" fluid>
        {/* Card de cadastro/edição */}
        <Card className="mb-4">
          <CardHeader className="border-0 d-flex justify-content-between align-items-center">
            <h3 className="mb-0">
              {selectedVenda ? 'Editar Venda' : 'Cadastrar Nova Venda'}
            </h3>
            {selectedVenda && (
              <Button color="info" onClick={handleNewVenda}>
                Nova Venda
              </Button>
            )}
          </CardHeader>
          <CardBody>
            <Form onSubmit={handleSaveVenda} className="p-3">
            <Row>
                <Col md="4">
                  <FormGroup>
                    <Label for="cliente_nome">Nome do Cliente</Label>
                    <Input
                      type="text"
                      name="cliente_nome"
                      id="cliente_nome"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.cliente_nome : newVenda.cliente_nome}
                      onChange={handleInputChange}
                      placeholder="Digite o nome do cliente"
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <Label for="cliente_documento">CPF/CNPJ</Label>
                    <Input
                      type="text"
                      name="cliente_documento"
                      id="cliente_documento"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.cliente_documento : newVenda.cliente_documento}
                      onChange={handleInputChange}
                      placeholder="Digite o CPF ou CNPJ"
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <Label for="cliente_email">E-mail</Label>
                    <Input
                      type="email"
                      name="cliente_email"
                      id="cliente_email"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.cliente_email : newVenda.cliente_email}
                      onChange={handleInputChange}
                      placeholder="Digite o e-mail"
                    />
                  </FormGroup>
                </Col>
                <Col md="1">
                  <FormGroup>
                    <Label for="cliente_telefone">Telefone</Label>
                    <Input
                      type="text"
                      name="cliente_telefone"
                      id="cliente_telefone"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.cliente_telefone : newVenda.cliente_telefone}
                      onChange={handleInputChange}
                      placeholder="1190000-0000"
                    />
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <Label for="canal_entrada">Canal de Entrada</Label>
                    <Input
                    type="select"
                    name="canal_entrada"
                    id="canal_entrada"
                    className="form-control-sm"
                    value={selectedVenda ? selectedVenda.canal_entrada : newVenda.canal_entrada}
                    onChange={handleInputChange}
                    required>
                    <option value="Indicação">Indicação</option>
                    <option value="Portifolio">Portifolio</option>
                    <option value="Comprado">Comprado</option>
                    <option value="Rede Social">Rede Social</option>
                    <option value="Site">Site</option>
                    <option value="Parceria">Parceria</option>
                    </Input>
                </FormGroup>
              </Col>
              </Row>
            <Row>
                <Col md="3">
                  <FormGroup>
                    <Label for="plano_id">Plano</Label>
                    <Input
                      type="select"
                      name="plano_id"
                      id="plano_id"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.plano_id : newVenda.plano_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione o plano</option>
                      {planos.map((plano) => (
                        <option key={plano.id} value={plano.id}>
                          {plano.operadora} - {plano.tipo}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <Label for="consultor_id">Consultor</Label>
                    <Input
                      type="select"
                      name="consultor_id"
                      id="consultor_id"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.consultor_id : newVenda.consultor_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecione o consultor</option>
                      {consultores.map((consultor) => (
                        <option key={consultor.id} value={consultor.id}>
                          {consultor.nome}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <Label for="numero_proposta">Nº da Proposta</Label>
                    <Input
                      type="text"
                      name="numero_proposta"
                      id="numero_proposta"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.numero_proposta : newVenda.numero_proposta}
                      onChange={handleInputChange}
                      placeholder="Digite o número da proposta"
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="1">
                  <FormGroup>
                    <Label for="valor_plano">Valor do Plano</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="valor_plano"
                      id="valor_plano"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.valor_plano : newVenda.valor_plano}
                      onChange={handleInputChange}
                      placeholder="R$"
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="1">
                  <FormGroup>
                    <Label for="desconto_consultor">Desconto</Label>
                    <Input
                      type="number"
                      step="0.01"
                      name="desconto_consultor"
                      id="desconto_consultor"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.desconto_consultor : newVenda.desconto_consultor}
                      onChange={handleInputChange}
                      placeholder="R$"
                    />
                  </FormGroup>
                </Col>
                <Col md="1">
                  <FormGroup>
                    <Label for="data_venda">Data Venda</Label>
                    <Input
                      type="date"
                      name="data_venda"
                      id="data_venda"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.data_venda : newVenda.data_venda}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="1">
                  <FormGroup>
                    <Label for="data_vigencia">Data Vigência</Label>
                    <Input
                      type="date"
                      name="data_vigencia"
                      id="data_vigencia"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.data_vigencia : newVenda.data_vigencia}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="1">
                  <FormGroup>
                    <Label for="data_vencimento">Data Venc.</Label>
                    <Input
                      type="date"
                      name="data_vencimento"
                      id="data_vencimento"
                      className="form-control-sm"
                      value={selectedVenda ? selectedVenda.data_vencimento : newVenda.data_vencimento}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                </Row>
              <Button type="submit" color="primary">
                {selectedVenda ? 'Modificar' : 'Cadastrar'}
              </Button>
              {selectedVenda && (
                <Button
                  color="danger"
                  className="ml-2"
                  onClick={handleDeleteVenda}
                >
                  Deletar
                </Button>
              )}
            </Form>
          </CardBody>
        </Card>

        {error && (
          <Row>
            <Col>
              <Alert color="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        {/* Tabela de listagem das vendas */}
        <Row>
        <div className="col">
          <Col xl="12">
            <Card className="className=mt--6" fluid>
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Lista de Vendas</h3>
              </CardHeader>
              <div className="px-4 pb-4">
                <ToolkitProvider keyField="id" data={vendas} columns={columns} search>
                  {(props) => (
                    <div>
                      <div id="datatable-basic_filter" className="dataTables_filter mb-3">
                        <label className="text">
                          Buscar:{' '}
                          <SearchBar
                            className="form-control-sm"
                            placeholder="Digite para filtrar..."
                            {...props.searchProps}
                          />
                        </label>
                      </div>
                      <BootstrapTable
                        {...props.baseProps}
                        bootstrap4
                        pagination={pagination}
                        bordered={false}
                        hover
                        noDataIndication="Nenhuma venda encontrada."
                        wrapperClasses="table-responsive"
                      />
                    </div>
                  )}
                </ToolkitProvider>
              </div>
            </Card>
          </Col>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default VendasList;
