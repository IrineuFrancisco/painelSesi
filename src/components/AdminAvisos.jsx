import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AdminAvisos.css';

function AdminAvisos() {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAviso, setEditingAviso] = useState(null);
  
  const [formData, setFormData] = useState({
    tipo: 'informacao',
    icone: '💡',
    titulo: '',
    mensagem: '',
    cor: '#118AB2',
    ativo: true,
    ordem: 0
  });

  const tiposDisponiveis = [
    { value: 'importante', label: 'Importante', icone: '⚠️', cor: '#EF476F' },
    { value: 'evento', label: 'Evento', icone: '🎉', cor: '#FEC601' },
    { value: 'lembrete', label: 'Lembrete', icone: '📚', cor: '#06D6A0' },
    { value: 'informacao', label: 'Informação', icone: '💡', cor: '#118AB2' },
    { value: 'saude', label: 'Saúde', icone: '🏥', cor: '#FF6B35' }
  ];

  useEffect(() => {
    fetchAvisos();
  }, []);

  const fetchAvisos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('avisos')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setAvisos(data || []);
    } catch (err) {
      console.error('Erro ao buscar avisos:', err);
      alert('Erro ao carregar avisos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAviso) {
        // Atualizar aviso existente
        const { error } = await supabase
          .from('avisos')
          .update(formData)
          .eq('id', editingAviso.id);

        if (error) throw error;
        alert('Aviso atualizado com sucesso!');
      } else {
        // Criar novo aviso
        const { error } = await supabase
          .from('avisos')
          .insert([formData]);

        if (error) throw error;
        alert('Aviso criado com sucesso!');
      }

      resetForm();
      fetchAvisos();
    } catch (err) {
      console.error('Erro ao salvar aviso:', err);
      alert('Erro ao salvar aviso: ' + err.message);
    }
  };

  const handleEdit = (aviso) => {
    setEditingAviso(aviso);
    setFormData({
      tipo: aviso.tipo,
      icone: aviso.icone,
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      cor: aviso.cor,
      ativo: aviso.ativo,
      ordem: aviso.ordem
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este aviso?')) return;

    try {
      const { error } = await supabase
        .from('avisos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Aviso excluído com sucesso!');
      fetchAvisos();
    } catch (err) {
      console.error('Erro ao excluir aviso:', err);
      alert('Erro ao excluir aviso: ' + err.message);
    }
  };

  const toggleAtivo = async (aviso) => {
    try {
      const { error } = await supabase
        .from('avisos')
        .update({ ativo: !aviso.ativo })
        .eq('id', aviso.id);

      if (error) throw error;
      fetchAvisos();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'informacao',
      icone: '💡',
      titulo: '',
      mensagem: '',
      cor: '#118AB2',
      ativo: true,
      ordem: 0
    });
    setEditingAviso(null);
    setShowForm(false);
  };

  const handleTipoChange = (tipo) => {
    const tipoSelecionado = tiposDisponiveis.find(t => t.value === tipo);
    setFormData({
      ...formData,
      tipo,
      icone: tipoSelecionado.icone,
      cor: tipoSelecionado.cor
    });
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🎛️ Gerenciamento de Avisos</h1>
        <button 
          className="btn-novo"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖️ Cancelar' : '➕ Novo Aviso'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingAviso ? '✏️ Editar Aviso' : '➕ Novo Aviso'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  required
                >
                  {tiposDisponiveis.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.icone} {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ícone</label>
                <input
                  type="text"
                  value={formData.icone}
                  onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                  maxLength="10"
                  required
                />
              </div>

              <div className="form-group">
                <label>Cor</label>
                <input
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ordem</label>
                <input
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                maxLength="200"
                required
              />
            </div>

            <div className="form-group">
              <label>Mensagem</label>
              <textarea
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                rows="4"
                required
              />
            </div>

            <div className="form-group-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
                Aviso Ativo
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-salvar">
                💾 {editingAviso ? 'Atualizar' : 'Criar'} Aviso
              </button>
              <button type="button" className="btn-cancelar" onClick={resetForm}>
                ✖️ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="avisos-list">
        <h2>📋 Avisos Cadastrados ({avisos.length})</h2>
        {avisos.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum aviso cadastrado ainda.</p>
            <p>Clique em "Novo Aviso" para começar.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {avisos.map(aviso => (
              <div 
                key={aviso.id} 
                className={`aviso-card ${!aviso.ativo ? 'inativo' : ''}`}
                style={{ borderLeftColor: aviso.cor }}
              >
                <div className="aviso-card-header">
                  <div className="aviso-card-icone" style={{ backgroundColor: aviso.cor }}>
                    {aviso.icone}
                  </div>
                  <div className="aviso-card-info">
                    <h3>{aviso.titulo}</h3>
                    <span className="aviso-tipo">{aviso.tipo}</span>
                  </div>
                  <div className="aviso-ordem">#{aviso.ordem}</div>
                </div>
                
                <p className="aviso-card-mensagem">{aviso.mensagem}</p>
                
                <div className="aviso-card-actions">
                  <button 
                    className={`btn-toggle ${aviso.ativo ? 'ativo' : 'inativo'}`}
                    onClick={() => toggleAtivo(aviso)}
                  >
                    {aviso.ativo ? '👁️ Ativo' : '👁️‍🗨️ Inativo'}
                  </button>
                  <button 
                    className="btn-editar"
                    onClick={() => handleEdit(aviso)}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn-excluir"
                    onClick={() => handleDelete(aviso.id)}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAvisos;
