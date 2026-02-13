import React, { useState, useEffect, useRef } from 'react';
import './App.css';
// import Img from '../public/SENAI_Logo.png';
import Cardapio from './components/Cardapio';
import Avisos from './components/Avisos';
import Horarios from './components/Horarios';
import AlertaSonoro from './components/AlertaSonoro';
import AdminAvisos from './components/AdminAvisos';

// Adicione a rota
{/* <Route path="/admin" element={<AdminAvisos />} /> */}


const Img = "/Sesi-SP.jpg";
let horarios = [];


function App() {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [tipoAlerta, setTipoAlerta] = useState('');
  const audioRef = useRef(null);

  const horariosManha = [
    { hora: '07:00', tipo: 'entrada', nome: 'Entrada' },
    { hora: '07:50', tipo: 'troca',   nome: ' Fim da Primeira Aula' },
    { hora: '08:40', tipo: 'troca',   nome: ' Fim da Segunda Aula' },
    { hora: '09:30', tipo: 'cafe',    nome: ' Café' },
    { hora: '10:40', tipo: 'troca',   nome: ' Fim da Quarta Aula' },
    { hora: '11:30', tipo: 'troca',   nome: ' Fim da Quinta Aula' },
    { hora: '12:20', tipo: 'saida',   nome: ' Saída' }
  ];

  const horariosTarde = [
    { hora: '12:40', tipo: 'entrada', nome: ' Entrada' },
    { hora: '13:30', tipo: 'troca',   nome: ' Fim da Primeira Aula' },
    { hora: '14:20', tipo: 'troca',   nome: ' Fim da Segunda Aula' },
    { hora: '15:10', tipo: 'cafe',    nome: ' Café' },
    { hora: '16:20', tipo: 'troca',   nome: ' Fim da Quarta Aula' },
    { hora: '17:10', tipo: 'troca',   nome: ' Fim da Quinta Aula' },
    { hora: '18:00', tipo: 'saida',   nome: ' Saída' }
  ];


  if (horaAtual.getHours() < 12 || (horaAtual.getHours() === 12 && horaAtual.getMinutes() < 25)) {
    horarios = horariosManha;
  } else {
    horarios = horariosTarde;
  }


  useEffect(() => {
    const timer = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

const ativarAlerta = (tipo, nome) => {
  setTipoAlerta(tipo);
  setMostrarAlerta(true);
  
  // let audioSrc = '';
  // switch(tipo) {
  //   case 'cafe':      
  //     audioSrc = '/cafe.mp3';   
  //     break;
  //   default:
  //     audioSrc = '/alarme.mp3'; 
  // } silenciando para não atrapalhar a aula
  
  const audio = new Audio(audioSrc);
  audio.preload = 'auto'; // Garante o carregamento imediato

  // Tenta tocar e captura erros de política de áudio
  audio.play()
    .then(() => console.log(`Tocando: ${audioSrc}`))
    .catch(err => {
      console.error('Erro de Autoplay: Clique na página primeiro!', err);
    });

  setTimeout(() => {
    setMostrarAlerta(false);
  }, 15000);
};

  return (
    <div className="App">
      <header className="header">
        <div className="logo-container">
          {/* Logo simulada do SENAI */}
          <div className="senai-logo">
            <img src={Img} alt="Logo do SENAI" className='logoSenai'/>
            {/* <span className="senai-text">SENAI</span>
            <div className="senai-unidade">SÃO PAULO</div> */}
          </div>
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
        nome={horarios.find(h => h.tipo === tipoAlerta)?.nome}
      />

      <main className="conteudo-principal">      
        
        {/* Coluna Cardápio - 50% */}
        <section className="coluna-cardapio">
          <Avisos />
          {/* Caso queira voltar os avisos futuramente, eles podem entrar aqui ou em um modal */}
        </section>
         {/* Coluna Horários - 50% */}
        <aside className="coluna-horarios">
          <Horarios horarios={horarios} horaAtual={horaAtual} />
        </aside>
      </main>

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