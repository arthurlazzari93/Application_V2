// src/views/pages/Login.jsx

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Container,
  Row,
  Col,
  Alert,
} from "reactstrap";
import axiosInstance from "../../../axiosConfig"; // Ajuste o path conforme a sua estrutura
import AuthHeader from "components/Headers/AuthHeader.js";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();

      if (!email || !password) {
        setError("Por favor, preencha todos os campos.");
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const response = await axiosInstance.post("token/", {
          username: email,
          password: password,
        });

        const { access, refresh } = response.data;

        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        navigate("/admin/dashboard");
      } catch (err) {
        console.error("Erro no login:", err);
        setError("Credenciais inválidas. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, navigate]
  );

  return (
    <>
      <AuthHeader title="CommTrack" />
      <Container className="mt--9 pb-5">
        <Row className="justify-content-center">
          <Col lg="5" md="7">
            <Card className="bg-secondary border-0 mb-0">
              <CardBody className="px-lg-5 py-lg-5">
                <Form role="form" onSubmit={handleLogin}>
                  <FormGroup className="mb-3">
                    <InputGroup className="input-group-merge input-group-alternative">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="ni ni-email-83" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Usuário ou Email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </InputGroup>
                  </FormGroup>
                  <FormGroup>
                    <InputGroup className="input-group-merge input-group-alternative">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="ni ni-lock-circle-open" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder="Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </InputGroup>
                  </FormGroup>
                  <div className="custom-control custom-control-alternative custom-checkbox">
                    <input
                      className="custom-control-input"
                      id="customCheckLogin"
                      type="checkbox"
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="customCheckLogin"
                    >
                      <span className="text-muted">Lembrar de mim</span>
                    </label>
                  </div>
                  {error && (
                    <Alert color="danger" className="mt-3">
                      {error}
                    </Alert>
                  )}
                  <div className="text-center">
                    <Button
                      className="my-4"
                      color="info"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Carregando..." : "Entrar"}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
            <Row className="mt-3">
              {/* Adicione links para registro, recuperação de senha, etc., se necessário */}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Login;
