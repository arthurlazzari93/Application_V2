// src/views/ConsultoresList.js

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

const ConsultoresList = () => {
  const [consultores, setConsultores] = useState([]);
  const [selectedConsultor, setSelectedConsultor] = useState(null);  // Consultor selecionado para edição
  const [newConsultor, setNewConsultor] = useState({ 
    nome: '',
    telefone: '',
    email: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Função para buscar consultores
    const fetchConsultores = async () => {
      try {
        const response = await api.get('api/consultor/');
        setConsultores(response.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar consultores:', err);
        setError('Erro ao buscar consultores. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultores();
  }, []);

  // Função para cadastrar ou modificar o consultor
  const handleSaveConsultor = async (e) => {
    e.preventDefault();

    try {
      if (selectedConsultor) {
        // Atualizar consultor existente
        await api.put(`api/consultor/${selectedConsultor.id}/`, selectedConsultor);
        setConsultores(consultores.map(consultor => consultor.id === selectedConsultor.id ? selectedConsultor : consultor));
        setSelectedConsultor(null);  // Limpa o formulário
      } else {
        // Adicionar novo consultor
        const response = await api.post('api/consultor/', newConsultor);
        setConsultores([...consultores, response.data]);
        setNewConsultor({ nome: '', telefone: '', email: '' });  // Limpa o formulário
      }
      setError(null);
    } catch (err) {
      console.error('Erro ao salvar consultor:', err);
      setError('Erro ao salvar consultor. Verifique os dados e tente novamente.');
    }
  };

  // Função para carregar dados do consultor selecionado no formulário
  const handleSelectConsultor = (consultor) => {
    setSelectedConsultor(consultor);
    setError(null);
  };

  // Função para deletar consultor
  const handleDeleteConsultor = async () => {
    if (selectedConsultor) {
      try {
        await api.delete(`api/consultor/${selectedConsultor.id}/`);
        setConsultores(consultores.filter(consultor => consultor.id !== selectedConsultor.id));
        setSelectedConsultor(null);  // Limpa o formulário
        setError(null);
      } catch (err) {
        console.error('Erro ao deletar consultor:', err);
        setError('Erro ao deletar consultor. Tente novamente mais tarde.');
      }
    }
  };

  // Função para limpar o formulário e voltar ao estado de cadastro
  const handleNewConsultor = () => {
    setSelectedConsultor(null);
    setNewConsultor({ nome: '', telefone: '', email: '' });
    setError(null);
  };

  // Atualiza os valores no formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (selectedConsultor) {
      setSelectedConsultor({ ...selectedConsultor, [name]: value });
    } else {
      setNewConsultor({ ...newConsultor, [name]: value });
    }
  };

  // Renderização Condicional de Carregamento e Erro
  if (loading) {
    return (
      <>
        <Header />
        <Container className="mt--6" fluid>
          <Row className="justify-content-center">
            <Spinner color="primary" />
            <p className="text-center mt-3">Carregando consultores...</p>
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
        <Row>
          {/* Coluna da lista de consultores */}
          <Col xl="8">
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Lista de Consultores</h3>
              </CardHeader>
              <Table className="align-items-center table-dark table-flush" responsive hover>
                <thead className="thead-dark">
                  <tr>
                    <th>Ações</th>
                    <th>Nome do Consultor</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {consultores.length > 0 ? (
                    consultores.map((consultor) => (
                      <tr 
                        key={consultor.id} 
                        onClick={() => handleSelectConsultor(consultor)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <Button 
                            color="info" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleSelectConsultor(consultor); 
                            }} 
                            size="sm"
                          >
                            Modificar
                          </Button>
                        </td>
                        <td>{consultor.nome}</td>
                        <td>{consultor.telefone}</td>
                        <td>{consultor.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        Nenhum consultor encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>

          {/* Coluna do formulário de cadastro/edição de consultor */}
          <Col xl="4" className="mb-0">
            <Card className="bg-secondary shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">
                  {selectedConsultor ? 'Editar Consultor' : 'Cadastrar Novo Consultor'}
                </h3>
                {selectedConsultor && (
                  <Button color="info" onClick={handleNewConsultor}>
                    Novo Consultor
                  </Button>
                )}
              </CardHeader>
              <Col xl="12" className="mb-4">
                <Form onSubmit={handleSaveConsultor}>
                  <FormGroup>
                    <Label className="form-control-label">Nome do Consultor</Label>
                    <Input
                      type="text"
                      name="nome"
                      id="nome"
                      value={selectedConsultor ? selectedConsultor.nome : newConsultor.nome}
                      onChange={handleInputChange}
                      placeholder="Digite o nome do consultor"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label className="form-control-label">Telefone</Label>
                    <Input
                      type="text" // Alterado para 'text' para permitir caracteres como parênteses e hífens
                      name="telefone"
                      id="telefone"
                      value={selectedConsultor ? selectedConsultor.telefone : newConsultor.telefone}
                      onChange={handleInputChange}
                      placeholder="(11) 90000-0000"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label className="form-control-label">E-mail</Label>
                    <Input
                      type="email" // Alterado para 'email' para validação automática
                      name="email"
                      id="email"
                      value={selectedConsultor ? selectedConsultor.email : newConsultor.email}
                      onChange={handleInputChange}
                      placeholder="exemplo@sistema.com.br"
                      required
                    />
                  </FormGroup>
                  <Button type="submit" color="primary">
                    {selectedConsultor ? 'Modificar' : 'Cadastrar'}
                  </Button>
                  {selectedConsultor && (
                    <Button 
                      color="danger" 
                      onClick={handleDeleteConsultor} 
                      className="ml-2"
                    >
                      Deletar
                    </Button>
                  )}
                </Form>
              </Col>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ConsultoresList;
