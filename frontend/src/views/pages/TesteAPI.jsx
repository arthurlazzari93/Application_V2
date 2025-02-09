import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosConfig';

const TesteAPI = () => {
    const [dados, setDados] = useState([]);

    useEffect(() => {
        axiosInstance.get('seu-modelo/')  // Substitua pelo seu endpoint
            .then(response => {
                setDados(response.data);
            })
            .catch(error => {
                console.error("Erro ao buscar dados:", error);
            });
    }, []);

    return (
        <div>
            <h1>Dados da API</h1>
            <ul>
                {dados.map(item => (
                    <li key={item.id}>{item.nome}</li>  // Substitua 'nome' pelo campo do seu modelo
                ))}
            </ul>
        </div>
    );
};

export default TesteAPI;
