// src/views/pages/Login.jsx

import React, { useState } from "react";
import classnames from "classnames";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
} from "reactstrap";
import axiosInstance from "../../../axiosConfig"; // Ajuste o path conforme a sua estrutura
import AuthHeader from "components/Headers/AuthHeader.js";
import { useNavigate } from 'react-router-dom';

function Login() {
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook para navegação

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("token/", {
        username: email, 
        password: password,
      });

      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      navigate("/admin/dashboard"); // Redireciona para a rota protegida
    } catch (error) {
      console.error("Erro no login:", error);
      setError("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <>
      <AuthHeader title="Sistema de Inventário" />
      <Container className="mt--9 pb-5">
        <Row className="justify-content-center">
          <Col lg="5" md="7">
            <Card className="bg-secondary border-0 mb-0">
              <CardBody className="px-lg-5 py-lg-5">
                <Form role="form" onSubmit={handleLogin}>
                  <FormGroup
                    className={classnames("mb-3", {
                      focused: focusedEmail,
                    })}
                  >
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
                        onFocus={() => setFocusedEmail(true)}
                        onBlur={() => setFocusedEmail(false)}
                      />
                    </InputGroup>
                  </FormGroup>
                  <FormGroup
                    className={classnames({
                      focused: focusedPassword,
                    })}
                  >
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
                        onFocus={() => setFocusedPassword(true)}
                        onBlur={() => setFocusedPassword(false)}
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
                      <span className="text-muted">Remember me</span>
                    </label>
                  </div>
                  {error && <div className="text-danger mb-3">{error}</div>}
                  <div className="text-center">
                    <Button className="my-4" color="info" type="submit">
                      Sign in
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
            <Row className="mt-3">
              {/* Aqui você pode adicionar links para registro, etc., se necessário */}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Login;
