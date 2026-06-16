import React, { useState, useEffect, useRef } from 'react';
import './App.css';
// import Img from '../public/SENAI_Logo.png';
import Cardapio from './components/Cardapio';
import Avisos from './components/Avisos';
import Horarios from './components/Horarios';
import AlertaSonoro from './components/AlertaSonoro';
import AdminAvisos from './components/AdminAvisos';

// Adicione a rota
{/* <Route path="/admin" element={<AdminAvisos />} /> */ }


const Img = "/Sesi-SP.jpg";
let horarios = [];


function App() {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [tipoAlerta, setTipoAlerta] = useState('');
  const [timeOffset, setTimeOffset] = useState(0);
  const audioRef = useRef(null);

  const [mostrarModalSenha, setMostrarModalSenha] = useState(false);
  const [senhaInput, setSenhaInput] = useState('');

  const horariosManha = [
    { hora: '07:00', tipo: 'entrada', nome: 'Entrada' },
    { hora: '07:50', tipo: 'troca', nome: 'Fim da Primeira Aula' },
    { hora: '08:40', tipo: 'troca', nome: 'Fim da Segunda Aula' },
    { hora: '09:30', tipo: 'cafe', nome: 'Café' },
    { hora: '10:40', tipo: 'troca', nome: 'Fim da Quarta Aula' },
    { hora: '11:30', tipo: 'troca', nome: 'Fim da Quinta Aula' },
    { hora: '12:20', tipo: 'saida', nome: 'Saída' }
  ];

  const horariosTarde = [
    { hora: '12:40', tipo: 'entrada', nome: 'Entrada' },
    { hora: '13:30', tipo: 'troca', nome: 'Fim da Primeira Aula' },
    { hora: '14:20', tipo: 'troca', nome: 'Fim da Segunda Aula' },
    { hora: '15:10', tipo: 'cafe', nome: 'Café' },
    { hora: '16:20', tipo: 'troca', nome: 'Fim da Quarta Aula' },
    { hora: '17:10', tipo: 'troca', nome: 'Fim da Quinta Aula' },
    { hora: '18:00', tipo: 'saida', nome: 'Saída' }
  ];

  if (horaAtual.getHours() < 12 || (horaAtual.getHours() === 12 && horaAtual.getMinutes() < 25)) {
    horarios = horariosManha;
  } else {
    horarios = horariosTarde;
  }

  // Sincroniza a hora do painel com o servidor onde está hospedado
  useEffect(() => {
    const syncTime = async () => {
      try {
        const start = Date.now();
        let serverTime = start; // Fallback para a hora local
        
        try {
          // Usa um parâmetro dinâmico para ignorar cache de CDN ou navegador
          const cacheBuster = Date.now();
          const resLocal = await fetch(`${window.location.origin}/?_t=${cacheBuster}`, { 
            method: 'GET', 
            cache: 'no-store' 
          });
          
          const dateHeader = resLocal.headers.get('Date') || resLocal.headers.get('date');
          
          if (dateHeader) {
            serverTime = new Date(dateHeader).getTime();
            console.log("Hora do servidor sincronizada com sucesso:", new Date(serverTime));
          } else {
            console.warn("O servidor não retornou o cabeçalho 'Date'. A hora local continuará sendo usada.");
          }
        } catch (localError) {
          console.warn("Falha ao buscar data do servidor de hospedagem. Usando hora local.", localError);
        }

        const end = Date.now();
        
        // Estima a latência (metade do tempo de ida e volta)
        const latency = (end - start) / 2;
        
        // Calcula a diferença (offset) entre a hora local e a hora real
        const offset = serverTime - (start + latency);
        setTimeOffset(offset);
        
        // Atualiza a hora atual imediatamente
        setHoraAtual(new Date(Date.now() + offset));
      } catch (error) {
        console.error("Erro ao sincronizar o relógio:", error);
      }
    };

    syncTime();
    // Ressincroniza a cada 1 hora para evitar que o relógio perca a precisão
    const syncInterval = setInterval(syncTime, 60 * 60 * 1000);
    return () => clearInterval(syncInterval);
  }, []);

  // Timer de 1 segundo para atualizar o relógio na tela
  useEffect(() => {
    const timer = setInterval(() => {
      setHoraAtual(new Date(Date.now() + timeOffset));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeOffset]);

  useEffect(() => {
    const horaFormatada = horaAtual.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    horarios.forEach(horario => {
      if (horaFormatada === `${horario.hora}:00`) {
        ativarAlerta(horario.tipo, horario.nome);
      }
    });
  }, [horaAtual]);

  const [audioHabilitado, setAudioHabilitado] = useState(false);
  const [ultimoAlarmeTocado, setUltimoAlarmeTocado] = useState('');
  const [nomeAlerta, setNomeAlerta] = useState('');

  const ativarAlerta = (tipo, nome) => {
    setTipoAlerta(tipo);
    setNomeAlerta(nome);
    setMostrarAlerta(true);

    let audioSrc = tipo === 'cafe' ? '/alarme1.mp3' : '/alarme1.mp3';

    // Usando a referência do elemento <audio> do HTML
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.volume = 0; // Começa sem som para o fade-in
      
      audioRef.current.play().then(() => {
        // Lógica de fade-in: aumenta o volume aos poucos
        let volume = 0;
        const fadeInterval = setInterval(() => {
          if (volume < 1.0) {
            volume += 0.05;
            // Limita o volume a 1.0 (máximo)
            if (audioRef.current) {
               audioRef.current.volume = Math.min(volume, 1.0);
            }
          } else {
            clearInterval(fadeInterval);
          }
        }, 500); // Incrementa o volume a cada 500ms
      }).catch(err => {
        console.error("O navegador bloqueou o áudio. Clique na página primeiro.", err);
      });
    }

    setTimeout(() => {
      setMostrarAlerta(false);
    }, 15000);
  };


  useEffect(() => {
    const horaSimples = horaAtual.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    horarios.forEach(horario => {
      // Verifica se a hora atual coincide e se já não tocamos esse alarme neste minuto
      if (horaSimples === horario.hora && ultimoAlarmeTocado !== horario.hora) {
        ativarAlerta(horario.tipo, horario.nome);
        setUltimoAlarmeTocado(horario.hora); // Evita tocar várias vezes no mesmo minuto
      }
    });

    // Limpa o estado do último alarme após o minuto passar
    if (!horarios.some(h => h.hora === horaSimples)) {
      setUltimoAlarmeTocado('');
    }
  }, [horaAtual, horarios]);
  // Função para determinar o tipo de refeição
  const obterTipoRefeicao = () => {
    const horas = horaAtual.getHours();
    const minutos = horaAtual.getMinutes();
    const tempoAtual = horas * 60 + minutos; // Converte tudo para minutos para facilitar a conta

    const limiteCafeManha = 9 * 60 + 30; // 09:30 em minutos
    const limiteAlmoco = 12 * 60 + 30;    // 12:30 em minutos

    if (tempoAtual < limiteCafeManha) {
      return 'cafe_manha'; // Ou o nome exato que está no seu banco
    } else if (tempoAtual < limiteAlmoco) {
      return 'almoco';
    } else {
      return 'cafe_tarde';
    }
  };

  const tipoRefeicao = obterTipoRefeicao();


  return (
    <div className="App">


      <header className="header">
        <div className="logo-container">
          {/* Logo simulada do SENAI */}
          <a 
            onClick={(e) => {
              e.preventDefault();
              setSenhaInput('');
              setMostrarModalSenha(true);
            }}
            href="#"
            className="senai-logo" 
            title="Abrir Gerenciador de Cardápio"
            style={{ display: 'block', cursor: 'pointer' }}
          >
            <img src={Img} alt="Logo do SENAI" className='logoSenai' />
          </a>
          <div className="divisor"></div>
          {/* <h1>PAINEL DE GESTÃO ESCOLAR</h1> */}
        </div>

        <div className="relogio-container">
          <div className="data">
            {horaAtual.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </div>
          <div className="hora">{horaAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </header>

      <AlertaSonoro
        mostrar={mostrarAlerta}
        tipo={tipoAlerta}
        nome={nomeAlerta}
      />

      <main className="conteudo-principal">

        {/* Coluna Cardápio - 50% */}
        <section className="coluna-cardapio">
          {/* Remova o <Cardapio /> se ele estiver vazio e use apenas o Avisos */}
          <Avisos tipoExibicao={tipoRefeicao} horaAtual={horaAtual} />
        </section>
        {/* Coluna Horários - 50% */}
        <aside className="coluna-horarios">
          <Horarios horarios={horarios} horaAtual={horaAtual} />
        </aside>
      </main>

      {mostrarModalSenha && (
        <div className="modal-senha-overlay">
          <div className="modal-senha-content">
            <h2>Acesso Restrito</h2>
            <input 
              type="password" 
              placeholder="Digite a senha" 
              value={senhaInput}
              onChange={(e) => setSenhaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (senhaInput === "sesisenai@283") {
                    setMostrarModalSenha(false);
                    window.open("cardapio.html", "_blank", "noopener,noreferrer");
                  } else {
                    alert("Senha incorreta!");
                  }
                }
              }}
              autoFocus
            />
            <div className="modal-senha-botoes">
              <button className="btn-cancelar" onClick={() => setMostrarModalSenha(false)}>Cancelar</button>
              <button className="btn-entrar" onClick={() => {
                if (senhaInput === "sesisenai@283") {
                  setMostrarModalSenha(false);
                  window.open("cardapio.html", "_blank", "noopener,noreferrer");
                } else {
                  alert("Senha incorreta!");
                }
              }}>Entrar</button>
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} src="/alarme.mp3" preload="auto" />

      {/* <footer className="rodape">
        <div className="rodape-info">
          &copy; 2026 SENAI-SP - Serviço Nacional de Aprendizagem Industrial
        </div>
      </footer> */}
    </div>
  );
}

export default App;