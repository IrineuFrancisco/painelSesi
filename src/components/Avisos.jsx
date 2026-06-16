import React, { useState, useEffect } from 'react';
import './Avisos.css';

function Avisos({ tipoExibicao, horaAtual = new Date() }) {
  const [avisoAtual, setAvisoAtual] = useState(0);
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para pegar o nome do dia atual em português (usando a hora do servidor!)
  const getDiaSemana = () => {
    const dias = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 
      'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    return dias[horaAtual.getDay()];
  };

  useEffect(() => {
    fetchAvisos();
    
    // Atualiza os avisos lendo o arquivo JSON local a cada 60 segundos
    const interval = setInterval(() => {
      fetchAvisos();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchAvisos = async () => {
    try {
      setLoading(true);
      
      // Busca o arquivo gerado pelo servidor, evitando cache
      const response = await fetch(`/avisos.json?_t=${Date.now()}`);
      if (!response.ok) throw new Error('Arquivo de avisos não encontrado.');
      
      const data = await response.json();
      const diaHoje = getDiaSemana();

      // Filtra: mantém avisos que NÃO são cardápio OU que são o cardápio de HOJE
      const avisosFiltrados = (data || []).filter(item => {
        if (item.tipo === 'cardapio') {
          return item.titulo && item.titulo.includes(diaHoje);
        }
        return true; 
      });

      setAvisos(avisosFiltrados);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar avisos do Supabase:', err);
      if (avisos.length === 0) setError('Erro ao carregar dados do servidor');
    } finally {
      setLoading(false);
    }
  };

  // Rotação automática (caso haja mais de um aviso ativo)
  useEffect(() => {
    if (avisos.length <= 1) return;
    const timer = setInterval(() => {
      setAvisoAtual((prev) => (prev + 1) % avisos.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [avisos.length]);

  if (loading && avisos.length === 0) return <div className="avisos-loading">Carregando...</div>;
  
  const aviso = avisos[avisoAtual] || {};

  const renderConteudo = (aviso) => {
    if (aviso.tipo === 'cardapio') {
      const refeicoes = (aviso.mensagem || '').split('|');

      // Mapeamos o que vem do App.jsx para o texto que está no banco de dados
      const filtro = {
        'cafe_manha': 'MANHÃ',
        'almoco': 'ALMOÇO',
        'cafe_tarde': 'TARDE'
      };

      // Aqui usamos tipoExibicao que vem lá do topo do componente
      const labelProcurada = filtro[tipoExibicao] || 'ALMOÇO';

      return (
        <div className="cardapio-container">
          <div className="cardapio-hoje-tag">CARDÁPIO DE HOJE</div>
          {refeicoes.map((ref, idx) => {
            const [titulo, itens] = ref.split(':');
            
            // Comparamos o título do banco (ex: MANHÃ) com a nossa labelProcurada
            if (titulo?.trim().toUpperCase() === labelProcurada) {
              return (
                <div key={idx} className="cardapio-secao">
                  <strong className="cardapio-hora">{titulo?.trim()}</strong>
                  <p className="cardapio-itens">{itens ? itens.trim() : ''}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return <p className="aviso-mensagem">{aviso.mensagem}</p>;
  };

  return (
    <div className="card avisos-card">
      <h2 className="card-titulo">
        <span className="card-icone">📢</span>
        Informativos Escolares
      </h2>

      {error && (
        <div className="avisos-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {avisos.length > 0 ? (
        <div className="aviso-destaque" style={{ borderColor: aviso.cor }}>
          <div className="aviso-header-flex">
              <div className="aviso-icone" style={{ backgroundColor: aviso.cor }}>{aviso.icone || '📢'}</div>
              <h3 className="aviso-titulo" style={{ color: aviso.cor }}>{aviso.titulo}</h3>
          </div>
          <div className="aviso-conteudo">
            {renderConteudo(aviso)}
          </div>
        </div>
      ) : (
        <p className="sem-avisos">Não há avisos para hoje.</p>
      )}

      {avisos.length > 1 && (
        <div className="avisos-indicadores">
          {avisos.map((_, index) => (
            <div
              key={index}
              className={`indicador ${index === avisoAtual ? 'ativo' : ''}`}
              onClick={() => setAvisoAtual(index)}
              style={{ backgroundColor: index === avisoAtual ? (aviso.cor || '#000') : 'rgba(0,0,0,0.1)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Avisos;