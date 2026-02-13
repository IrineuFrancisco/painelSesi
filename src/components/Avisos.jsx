// import React, { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';
// import './Avisos.css';

// function Avisos() {
//   const [avisoAtual, setAvisoAtual] = useState(0);
//   const [avisos, setAvisos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Buscar avisos do Supabase
//   useEffect(() => {
//     fetchAvisos();
    
//     // Configurar realtime para updates automáticos
//     const channel = supabase
//       .channel('avisos-changes')
//       .on(
//         'postgres_changes',
//         {
//           event: '*',
//           schema: 'public',
//           table: 'avisos'
//         },
//         () => {
//           fetchAvisos();
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, []);

//   const fetchAvisos = async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('avisos')
//         .select('*')
//         .eq('ativo', true)
//         .order('ordem', { ascending: true });

//       if (error) throw error;

//       if (data && data.length > 0) {
//         setAvisos(data);
//       } else {
//         // Avisos padrão caso não haja dados
//         setAvisos([
//           {
//             id: 1,
//             tipo: 'informacao',
//             icone: '💡',
//             titulo: 'Bem-vindo',
//             mensagem: 'Configure os avisos no banco de dados Supabase.',
//             cor: '#118AB2',
//             ativo: true,
//             ordem: 1
//           }
//         ]);
//       }
//       setError(null);
//     } catch (err) {
//       console.error('Erro ao buscar avisos:', err);
//       setError('Erro ao carregar avisos');
//       // Avisos padrão em caso de erro
//       setAvisos([
//         {
//           id: 1,
//           tipo: 'importante',
//           icone: '⚠️',
//           titulo: 'Erro de Conexão',
//           mensagem: 'Não foi possível conectar ao banco de dados.',
//           cor: '#EF476F',
//           ativo: true,
//           ordem: 1
//         }
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Rotação automática dos avisos
//   useEffect(() => {
//     if (avisos.length <= 1) return;

//     const timer = setInterval(() => {
//       setAvisoAtual((prev) => (prev + 1) % avisos.length);
//     }, 8000); // Troca a cada 8 segundos

//     return () => clearInterval(timer);
//   }, [avisos.length]);

//   if (loading && avisos.length === 0) {
//     return (
//       <div className="card avisos-card">
//         <h2 className="card-titulo">
//           <span className="card-icone">📢</span>
//           Avisos Importantes
//         </h2>
//         <div className="avisos-loading">
//           <div className="spinner"></div>
//           <p>Carregando avisos...</p>
//         </div>
//       </div>
//     );
//   }

//   const aviso = avisos[avisoAtual];

//   return (
//     <div className="card avisos-card">
//       <h2 className="card-titulo">
//         <span className="card-icone">📢</span>
//         Avisos Importantes
//       </h2>

//       {error && (
//         <div className="avisos-error">
//           <span className="error-icon">⚠️</span>
//           <span>{error}</span>
//         </div>
//       )}

//       <div className="aviso-destaque" style={{ borderColor: aviso.cor }}>
//         <div className="aviso-icone" style={{ backgroundColor: aviso.cor }}>
//           {aviso.icone}
//         </div>
//         <div className="aviso-conteudo">
//           <h3 className="aviso-titulo" style={{ color: aviso.cor }}>
//             {aviso.titulo}
//           </h3>
//           <p className="aviso-mensagem">{aviso.mensagem}</p>
//         </div>
//       </div>

//       {avisos.length > 1 && (
//         <>
//           <div className="avisos-lista">
//             {avisos.map((item, index) => (
//               <div
//                 key={item.id}
//                 className={`aviso-mini ${index === avisoAtual ? 'ativo' : ''}`}
//                 onClick={() => setAvisoAtual(index)}
//                 style={{ borderColor: index === avisoAtual ? item.cor : 'transparent' }}
//               >
//                 <span className="aviso-mini-icone">{item.icone}</span>
//                 <span className="aviso-mini-titulo">{item.titulo}</span>
//               </div>
//             ))}
//           </div>

//           <div className="avisos-indicadores">
//             {avisos.map((_, index) => (
//               <div
//                 key={index}
//                 className={`indicador ${index === avisoAtual ? 'ativo' : ''}`}
//                 onClick={() => setAvisoAtual(index)}
//                 style={{ 
//                   backgroundColor: index === avisoAtual ? aviso.cor : 'rgba(255, 255, 255, 0.2)' 
//                 }}
//               />
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default Avisos;





// // import React, { useState, useEffect } from 'react';
// // import './Avisos.css';

// // function Avisos() {
// //   const [avisoAtual, setAvisoAtual] = useState(0);

// //   const avisos = [
// //     {
// //       tipo: 'importante',
// //       icone: '⚠️',
// //       titulo: 'Reunião de Pais',
// //       mensagem: 'Reunião geral na sexta-feira às 18h no auditório principal.',
// //       cor: '#EF476F'
// //     },
// //     {
// //       tipo: 'evento',
// //       icone: '🎉',
// //       titulo: 'Festa Junina',
// //       mensagem: 'Dia 15 de junho! Venha com sua roupa caipira!',
// //       cor: '#FEC601'
// //     },
// //     {
// //       tipo: 'lembrete',
// //       icone: '📚',
// //       titulo: 'Biblioteca',
// //       mensagem: 'Não esqueça de devolver os livros emprestados até sexta-feira.',
// //       cor: '#06D6A0'
// //     },
// //     {
// //       tipo: 'informacao',
// //       icone: '💡',
// //       titulo: 'Horário de Verão',
// //       mensagem: 'Lembre-se: o horário de entrada continua sendo 07:00h.',
// //       cor: '#118AB2'
// //     },
// //     {
// //       tipo: 'saude',
// //       icone: '🏥',
// //       titulo: 'Campanha de Vacinação',
// //       mensagem: 'Vacinação contra gripe disponível na enfermaria.',
// //       cor: '#FF6B35'
// //     }
// //   ];

// //   useEffect(() => {
// //     const timer = setInterval(() => {
// //       setAvisoAtual((prev) => (prev + 1) % avisos.length);
// //     }, 8000); // Troca de aviso a cada 8 segundos

// //     return () => clearInterval(timer);
// //   }, [avisos.length]);

// //   const aviso = avisos[avisoAtual];

// //   return (
// //     <div className="card avisos-card">
// //       <h2 className="card-titulo">
// //         <span className="card-icone">📢</span>
// //         Avisos Importantes
// //       </h2>

// //       <div className="aviso-destaque" style={{ borderColor: aviso.cor }}>
// //         <div className="aviso-icone" style={{ backgroundColor: aviso.cor }}>
// //           {aviso.icone}
// //         </div>
// //         <div className="aviso-conteudo">
// //           <h3 className="aviso-titulo" style={{ color: aviso.cor }}>
// //             {aviso.titulo}
// //           </h3>
// //           <p className="aviso-mensagem">{aviso.mensagem}</p>
// //         </div>
// //       </div>

// //       <div className="avisos-lista">
// //         {avisos.map((item, index) => (
// //           <div
// //             key={index}
// //             className={`aviso-mini ${index === avisoAtual ? 'ativo' : ''}`}
// //             onClick={() => setAvisoAtual(index)}
// //             style={{ borderColor: index === avisoAtual ? item.cor : 'transparent' }}
// //           >
// //             <span className="aviso-mini-icone">{item.icone}</span>
// //             <span className="aviso-mini-titulo">{item.titulo}</span>
// //           </div>
// //         ))}
// //       </div>

// //       <div className="avisos-indicadores">
// //         {avisos.map((_, index) => (
// //           <div
// //             key={index}
// //             className={`indicador ${index === avisoAtual ? 'ativo' : ''}`}
// //             onClick={() => setAvisoAtual(index)}
// //             style={{ backgroundColor: index === avisoAtual ? aviso.cor : 'rgba(255, 255, 255, 0.2)' }}
// //           />
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // export default Avisos;

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Avisos.css';

function Avisos() {
  const [avisoAtual, setAvisoAtual] = useState(0);
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para pegar o nome do dia atual em português
  const getDiaSemana = () => {
    const dias = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 
      'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    return dias[new Date().getDay()];
  };

  useEffect(() => {
    fetchAvisos();
    const channel = supabase
      .channel('avisos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avisos' }, () => fetchAvisos())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAvisos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;

      const diaHoje = getDiaSemana();

      // Filtra: mantém avisos que NÃO são cardápio OU que são o cardápio de HOJE
      const avisosFiltrados = data.filter(item => {
        if (item.tipo === 'cardapio') {
          // Verifica se o título contém o dia da semana atual (ex: "Cardápio: Segunda-feira")
          return item.titulo.includes(diaHoje);
        }
        return true; // Mantém avisos normais (reuniões, lembretes)
      });

      setAvisos(avisosFiltrados);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Rotação automática (caso haja mais de um aviso ativo além do cardápio)
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
      const refeicoes = aviso.mensagem.split('|');
      return (
        <div className="cardapio-container">
            <div className="cardapio-hoje-tag">CARDÁPIO DE HOJE</div>
          {refeicoes.map((ref, idx) => {
            const [titulo, itens] = ref.split(':');
            return (
              <div key={idx} className="cardapio-secao">
                <strong className="cardapio-hora">{titulo?.trim()}</strong>
                <p className="cardapio-itens">{itens ? itens.trim() : ''}</p>
              </div>
            );
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

      {avisos.length > 0 ? (
        <div className="aviso-destaque" style={{ borderColor: aviso.cor }}>
          <div className="aviso-header-flex">
              <div className="aviso-icone" style={{ backgroundColor: aviso.cor }}>{aviso.icone}</div>
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
              style={{ backgroundColor: index === avisoAtual ? aviso.cor : 'rgba(0,0,0,0.1)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Avisos;