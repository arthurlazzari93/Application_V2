// src/views/PlanosList.js

import React, { useState, useEffect } from 'react';
import api from '../../../axiosConfig.js';  
import { 
  Table, 
  Container, 
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

const PlanosList = () => {
  const [planos, setPlanos] = useState([]);
  const [selectedPlano, setSelectedPlano] = useState(null);
  const [comissoes, setComissoes] = useState({});
  
  const [newPlano, setNewPlano] = useState({
    operadora: '',
    tipo: '',
    comissionamento_total: '',
    numero_parcelas: '',
    taxa_plano_valor: '',
    taxa_plano_tipo: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Função para carregar planos e comissões
    const fetchData = async () => {
      try {
        const [planoResponse, parcelaResponse] = await Promise.all([
          api.get('api/plano/'),
          api.get('api/parcela/')
        ]);

        setPlanos(planoResponse.data);

        const comissoesMap = {};
        parcelaResponse.data.forEach((parcela) => {
          comissoesMap[`${parcela.plano}-${parcela.numero_parcela}`] = {
            id: parcela.id,
            porcentagem_parcela: parcela.porcentagem_parcela
          };
        });
        setComissoes(comissoesMap);
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

  const handleSaveComissao = async (planoId, numero_parcela) => {
    const key = `${planoId}-${numero_parcela}`;
    const porcentagem_parcela = comissoes[key]?.porcentagem_parcela || '0';

    try {
      if (comissoes[key]?.id) {
        const parcelaId = comissoes[key].id;
        await api.put(`api/parcela/${parcelaId}/`, {
          plano: planoId,
          numero_parcela,
          porcentagem_parcela
        });
        console.log(`Parcela ${numero_parcela} do plano ${planoId} atualizada com sucesso.`);
      } else {
        const response = await api.post('api/parcela/', {
          plano: planoId,
          numero_parcela,
          porcentagem_parcela
        });
        console.log(`Nova parcela criada para o plano ${planoId}.`);
        setComissoes(prevComissoes => ({
          ...prevComissoes,
          [key]: {
            id: response.data.id,
            porcentagem_parcela
          }
        }));
      }
      setError(null);
    } catch (err) {
      console.error(`Erro ao salvar parcela ${numero_parcela} do plano ${planoId}:`, err);
      setError('Erro ao salvar comissão. Tente novamente mais tarde.');
    }
  };

  const handleInputChangeComissao = (planoId, numero_parcela, porcentagem_parcela) => {
    const key = `${planoId}-${numero_parcela}`;
    setComissoes(prevComissoes => ({
      ...prevComissoes,
      [key]: {
        ...prevComissoes[key],
        porcentagem_parcela
      }
    }));
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedPlano) {
      setSelectedPlano({ ...selectedPlano, [name]: value });
    } else {
      setNewPlano({ ...newPlano, [name]: value });
    }
  };

  const handleNewPlano = () => {
    setSelectedPlano(null);
    setNewPlano({
      operadora: '',
      tipo: '',
      comissionamento_total: '',
      numero_parcelas: '',
      taxa_plano_valor: '',
      taxa_plano_tipo: ''
    });
    setError(null);
  };

  const handleDeletePlano = async (id) => {
    try {
      await api.delete(`api/plano/${id}/`);
      setPlanos(planos.filter(plano => plano.id !== id));
      setSelectedPlano(null);
      setError(null);
    } catch (err) {
      console.error('Erro ao deletar plano:', err);
      setError('Erro ao deletar plano. Tente novamente mais tarde.');
    }
  };

  const handleSavePlano = async (e) => {
    e.preventDefault();
  
    const planoData = selectedPlano ? selectedPlano : newPlano;
  
    try {
      if (selectedPlano) {
        await api.put(`api/plano/${selectedPlano.id}/`, planoData);
        setPlanos(planos.map(plano => plano.id === selectedPlano.id ? selectedPlano : plano));
        setSelectedPlano(null);
      } else {
        const response = await api.post('api/plano/', planoData);
        setPlanos([...planos, response.data]);
        setNewPlano({
          operadora: '',
          tipo: '',
          comissionamento_total: '',
          numero_parcelas: '',
          taxa_plano_valor: '',
          taxa_plano_tipo: ''
        });
      }
      setError(null);
    } catch (err) {
      console.error('Erro ao salvar plano:', err);
      setError('Erro ao salvar plano. Verifique os dados e tente novamente.');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="mt--7" fluid>
          <Row className="justify-content-center">
            <Spinner color="primary" />
            <p className="text-center mt-3">Carregando planos...</p>
          </Row>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="mt--8" fluid>
        {error && (
          <Row>
            <Col>
              <Alert color="danger">{error}</Alert>
            </Col>
          </Row>
        )}
        {/* Formulário de cadastro/edição de plano */}
        <Row>
          <Col>
            <Card className="bg-secondary shadow mb-4">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">
                  {selectedPlano ? 'Editar Plano' : 'Cadastrar Novo Plano'}
                </h3>
                {selectedPlano && (
                  <Button color="info" onClick={handleNewPlano}>
                    Novo Plano
                  </Button>
                )}
              </CardHeader>
              <Form onSubmit={handleSavePlano} className="p-3">
                <Row>
                  <Col md="3">
                    <FormGroup>
                      <Label for="operadora">Operadora</Label>
                      <Input
                        type="text"
                        name="operadora"
                        id="operadora"
                        value={selectedPlano ? selectedPlano.operadora : newPlano.operadora}
                        onChange={handleInputChange}
                        placeholder="Operadora"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Label for="tipo">Tipo do Plano</Label>
                      <Input
                        type="select"
                        name="tipo"
                        id="tipo"
                        value={selectedPlano ? selectedPlano.tipo : newPlano.tipo}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Selecione o tipo</option>
                        <option value="PME">PME</option>
                        <option value="PF">Pessoa Física</option>
                        <option value="Adesão">Adesão</option>
                        <option value="PF (Odonto)">PF (Odonto)</option>
                        <option value="PME (Odonto)">PME (Odonto)</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="2">
                    <FormGroup>
                      <Label for="comissionamento_total">Total (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        name="comissionamento_total"
                        id="comissionamento_total"
                        value={selectedPlano ? selectedPlano.comissionamento_total : newPlano.comissionamento_total}
                        onChange={handleInputChange}
                        placeholder="Comissionamento total"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="1">
                    <FormGroup>
                      <Label for="numero_parcelas">Nº Parcelas</Label>
                      <Input
                        type="number"
                        name="numero_parcelas"
                        id="numero_parcelas"
                        value={selectedPlano ? selectedPlano.numero_parcelas : newPlano.numero_parcelas}
                        onChange={handleInputChange}
                        placeholder="Quantidade"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="1">
                    <FormGroup>
                      <Label for="taxa_plano_valor">Taxa</Label>
                      <Input
                        type="number"
                        name="taxa_plano_valor"
                        id="taxa_plano_valor"
                        value={selectedPlano ? selectedPlano.taxa_plano_valor : newPlano.taxa_plano_valor}
                        onChange={handleInputChange}
                        placeholder="Valor"
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="1">
                    <FormGroup>
                      <Label for="taxa_plano_tipo">Tipo Taxa</Label>
                      <Input
                        type="select"
                        name="taxa_plano_tipo"
                        id="taxa_plano_tipo"
                        value={selectedPlano ? selectedPlano.taxa_plano_tipo : newPlano.taxa_plano_tipo}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Valor ou %</option>
                        <option value="Valor Fixo">Valor</option>
                        <option value="Porcentagem">%</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Button type="submit" color="primary">
                  {selectedPlano ? 'Modificar' : 'Cadastrar'}
                </Button>
                {selectedPlano && (
                  <Button 
                    color="danger" 
                    className="ml-2" 
                    onClick={() => handleDeletePlano(selectedPlano.id)}
                  >
                    Deletar
                  </Button>
                )}
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Tabela de lista de planos */}
        <Row>
          <Col>
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Lista de Planos</h3>
              </CardHeader>
              <Table className="align-items-center table-dark table-flush" responsive hover>
                <thead className="thead-dark">
                  <tr>
                    <th>Ações</th>
                    <th>Operadora</th>
                    <th>Tipo do Plano</th>
                    <th>Total (%)</th>
                    <th>Taxa</th>
                    {/* Cabeçalhos das parcelas */}
                    {Array.from({ length: Math.max(...planos.map(plano => plano.numero_parcelas)) }, (_, i) => (
                      <th key={i}>Parcela {i + 1} (%)</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planos.map((plano) => (
                    <tr key={plano.id}>
                      <td>
                        <Button 
                          color="info" 
                          onClick={() => setSelectedPlano(plano)} 
                          size="sm"
                        >
                          Modificar
                        </Button>
                      </td>
                      <td>{plano.operadora}</td>
                      <td>{plano.tipo}</td>
                      <td>{plano.comissionamento_total}</td>
                      <td>{plano.taxa_plano_valor}</td>
                      {/* Inputs das parcelas */}
                      {Array.from({ length: plano.numero_parcelas }, (_, i) => (
                        <td key={i}>
                          <Input
                            type="number"
                            value={comissoes[`${plano.id}-${i + 1}`]?.porcentagem_parcela || ''}
                            onChange={(e) => handleInputChangeComissao(plano.id, i + 1, e.target.value)}
                            onBlur={() => handleSaveComissao(plano.id, i + 1)}
                            placeholder="%"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PlanosList;
