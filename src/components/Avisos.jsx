import React, { useState, useEffect, useMemo } from 'react';
import './Avisos.css';

function Avisos({ tipoExibicao, horaAtual = new Date() }) {
  const [avisoAtual, setAvisoAtual] = useState(0);
  const [todosAvisos, setTodosAvisos] = useState([]);
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
    
    // Atualiza os avisos a cada 5 segundos para refletir alterações rapidamente
    const interval = setInterval(() => {
      fetchAvisos();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchAvisos = async () => {
    try {
      setLoading(true);
      
      // Busca primeiro os avisos direto do Supabase
      const supabaseRes = await fetch(
        `https://qfnibnhjdnczxoublxif.supabase.co/rest/v1/avisos?select=*&ativo=eq.true&order=ordem.asc`,
        {
          headers: {
            "apikey": "sb_publishable_rZf4HnUkAiO16oaQwserjg_Axj-2BwL",
            "Authorization": "Bearer sb_publishable_rZf4HnUkAiO16oaQwserjg_Axj-2BwL"
          }
        }
      );
      if (supabaseRes.ok) {
        const supabaseData = await supabaseRes.json();
        setTodosAvisos(supabaseData || []);
        setError(null);
        return;
      }
      throw new Error('Erro na resposta do Supabase');
    } catch (sbErr) {
      console.warn('Supabase indisponível. Buscando do arquivo avisos.json local...', sbErr.message);
      try {
        const response = await fetch(`/avisos.json?_t=${Date.now()}`);
        const contentType = response.headers.get('content-type');
        
        if (!response.ok || (contentType && contentType.includes('text/html'))) {
          throw new Error('Arquivo avisos.json não disponível.');
        }
        
        const data = await response.json();
        setTodosAvisos(data || []);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar avisos locais e no Supabase:', err);
        setError('Erro ao carregar dados do servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  const diaHoje = getDiaSemana();

  // Memoiza a filtragem dos avisos para evitar recriar a referência do array no render
  const avisos = useMemo(() => {
    return todosAvisos.filter(item => {
      if (item.tipo === 'cardapio') {
        return item.titulo && item.titulo.includes(diaHoje);
      }
      return true; 
    });
  }, [todosAvisos, diaHoje]);

  const proxAviso = () => {
    if (avisos.length > 1) {
      setAvisoAtual((prev) => (prev + 1) % avisos.length);
    }
  };

  // Escuta o término de vídeos do YouTube via Iframe postMessage API
  useEffect(() => {
    const handleYouTubeMessage = (event) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        
        // YouTube envia mensagens quando o estado do player muda.
        // State 0 (ou playerState 0) significa ENDED (Vídeo finalizado)
        const isEnded = 
          (data?.event === 'onStateChange' && data?.info === 0) ||
          (data?.event === 'infoDelivery' && (data?.info?.playerState === 0 || data?.info === 0)) ||
          (data?.info === 0) ||
          (data?.info?.playerState === 0);

        if (isEnded) {
          console.log('Vídeo do YouTube finalizou! Avançando para o próximo aviso...');
          proxAviso();
        }
      } catch (e) {
        // Ignora mensagens não-JSON
      }
    };

    window.addEventListener('message', handleYouTubeMessage);
    return () => window.removeEventListener('message', handleYouTubeMessage);
  }, [avisos.length]);

  // Rotação automática (limite máximo de 15 segundos para cada aviso: vídeo, imagem ou cardápio)
  useEffect(() => {
    if (avisos.length <= 1) return;
    
    const avisoAtualObj = avisos[avisoAtual % avisos.length];
    
    // Calcula a duração em milissegundos, com limite máximo estrito de 15 segundos (15000ms)
    let duracao = avisoAtualObj?.duracao ? avisoAtualObj.duracao * 1000 : 15000;
    if (!duracao || duracao > 15000 || duracao <= 0) {
      duracao = 15000;
    }

    const timer = setInterval(() => {
      setAvisoAtual((prev) => (prev + 1) % avisos.length);
    }, duracao);
    return () => clearInterval(timer);
  }, [avisos.length, avisoAtual]);

  if (loading && todosAvisos.length === 0) return <div className="avisos-loading">Carregando...</div>;
  
  const aviso = avisos.length > 0 ? avisos[avisoAtual % avisos.length] : {};

  const getYouTubeEmbedUrl = (rawUrl) => {
    if (!rawUrl) return '';
    let videoId = null;

    if (rawUrl.includes('/shorts/')) {
      videoId = rawUrl.split('/shorts/')[1]?.split('?')[0]?.split('&')[0];
    } else if (rawUrl.includes('watch?v=')) {
      videoId = rawUrl.split('v=')[1]?.split('&')[0]?.split('?')[0];
    } else if (rawUrl.includes('v=')) {
      videoId = rawUrl.split('v=')[1]?.split('&')[0]?.split('?')[0];
    } else if (rawUrl.includes('youtu.be/')) {
      videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
    } else if (rawUrl.includes('/embed/')) {
      videoId = rawUrl.split('/embed/')[1]?.split('?')[0]?.split('&')[0];
    } else if (rawUrl.includes('/live/')) {
      videoId = rawUrl.split('/live/')[1]?.split('?')[0]?.split('&')[0];
    }

    if (videoId) {
      const cleanId = videoId.trim();
      const origin = window.location.origin;
      return `https://www.youtube.com/embed/${cleanId}?autoplay=1&mute=1&enablejsapi=1&origin=${origin}&rel=0`;
    }

    return rawUrl;
  };

  const convertDriveUrl = (rawUrl) => {
    if (!rawUrl) return '';
    if (rawUrl.includes('drive.google.com')) {
      let fileId = null;
      if (rawUrl.includes('/file/d/')) {
        fileId = rawUrl.split('/file/d/')[1]?.split('/')[0]?.split('?')[0];
      } else if (rawUrl.includes('id=')) {
        fileId = rawUrl.split('id=')[1]?.split('&')[0];
      }
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId.trim()}`;
      }
    }
    return rawUrl;
  };

  const renderMidia = (aviso) => {
    const tipoMidia = aviso.tipo_midia || aviso.midia_tipo || aviso.tipo;
    
    // Tenta encontrar a URL da mídia a partir de todas as propriedades possíveis
    const rawUrl = aviso.video_url || 
      (tipoMidia === 'video' ? aviso.midia_url : null) || 
      aviso.imagem_url || 
      aviso.midia_url || 
      (aviso.mensagem && (aviso.mensagem.startsWith('http://') || aviso.mensagem.startsWith('https://') || aviso.mensagem.startsWith('/')) ? aviso.mensagem : null);

    if (!rawUrl) return null;
    const url = convertDriveUrl(rawUrl);

    // Detecta se é vídeo pelo tipo explícito ou pela extensão/domínio da URL
    const isVideo = tipoMidia === 'video' || 
      Boolean(aviso.video_url) || 
      Boolean(url.match(/\.(mp4|webm|ogv)(\?.*)?$/i)) || 
      url.includes('youtube.com') || 
      url.includes('youtu.be') || 
      url.includes('vimeo.com');

    if (isVideo) {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const embedUrl = getYouTubeEmbedUrl(url);
        return (
          <div className="aviso-midia-container">
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={aviso.titulo || "Vídeo Informativo"}
              className="aviso-midia-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        );
      }

      return (
        <div className="aviso-midia-container">
          <video
            key={url}
            src={url}
            autoPlay
            muted
            playsInline
            onEnded={proxAviso}
            className="aviso-midia-video"
          />
        </div>
      );
    }

    return (
      <div className="aviso-midia-container">
        <img
          key={url}
          src={url}
          alt={aviso.titulo || "Banner Informativo"}
          className="aviso-midia-img"
        />
      </div>
    );
  };

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

    const temMidiaLocal = Boolean(
      (aviso.tipo_midia && aviso.tipo_midia !== 'nenhum') ||
      aviso.imagem_url ||
      aviso.video_url ||
      aviso.midia_url ||
      aviso.midia_tipo === 'imagem' ||
      aviso.midia_tipo === 'video' ||
      aviso.tipo === 'imagem' ||
      aviso.tipo === 'video' ||
      (aviso.mensagem && (aviso.mensagem.startsWith('http://') || aviso.mensagem.startsWith('https://') || aviso.mensagem.startsWith('/')))
    );
    return (
      <div className="aviso-body-wrapper">
        {temMidiaLocal && renderMidia(aviso)}
        {aviso.mensagem && (!temMidiaLocal || (aviso.imagem_url || aviso.video_url || aviso.midia_url)) && (
          <p className="aviso-mensagem">{aviso.mensagem}</p>
        )}
      </div>
    );
  };

  const temMidia = Boolean(
    aviso && (
      (aviso.tipo_midia && aviso.tipo_midia !== 'nenhum') ||
      aviso.imagem_url ||
      aviso.video_url ||
      aviso.midia_url ||
      aviso.midia_tipo === 'imagem' ||
      aviso.midia_tipo === 'video' ||
      aviso.tipo === 'imagem' ||
      aviso.tipo === 'video' ||
      (aviso.mensagem && (aviso.mensagem.startsWith('http://') || aviso.mensagem.startsWith('https://') || aviso.mensagem.startsWith('/')))
    )
  );

  return (
    <div className="card avisos-card">
      <h2 className="card-titulo">
        <span className="card-icone">📢</span>
        Informativos Escolares
      </h2>

      {error && todosAvisos.length === 0 && (
        <div className="avisos-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {avisos.length > 0 ? (
        <div className={`aviso-destaque ${temMidia ? 'com-midia' : ''}`} style={{ borderColor: aviso.cor }}>
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