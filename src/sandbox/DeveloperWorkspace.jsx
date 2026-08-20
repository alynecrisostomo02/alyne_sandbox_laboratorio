"use client";

import { useState } from "react";

export function DeveloperWorkspace({
  modules,
  snapshots,
  onSelectModule,
  onUpdateModule,
  onDeleteModule,
  onCreateSnapshot,
  onRestoreSnapshot,
  onNavigateToSandbox
}) {
  const [activeFilter, setActiveFilter] = useState("all"); // all, testing, active_sandbox, inactive_sandbox, deployed, archived
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [newSnapshotName, setNewSnapshotName] = useState("");
  const [newSnapshotDesc, setNewSnapshotDesc] = useState("");
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [snapshotToRestore, setSnapshotToRestore] = useState(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [devToast, setDevToast] = useState("");

  const showDevToast = (msg) => {
    setDevToast(msg);
    setTimeout(() => setDevToast(""), 3500);
  };

  const filteredModules = modules.filter((m) => {
    const matchesFilter = activeFilter === "all" || m.status === activeFilter;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const countByStatus = {
    all: modules.length,
    testing: modules.filter((m) => m.status === "testing").length,
    active_sandbox: modules.filter((m) => m.status === "active_sandbox").length,
    inactive_sandbox: modules.filter((m) => m.status === "inactive_sandbox").length,
    deployed: modules.filter((m) => m.status === "deployed").length,
    archived: modules.filter((m) => m.status === "archived").length
  };

  const handleToggleStatus = (module) => {
    let nextStatus;
    if (module.status === "active_sandbox") nextStatus = "inactive_sandbox";
    else if (module.status === "inactive_sandbox") nextStatus = "active_sandbox";
    else if (module.status === "archived") nextStatus = "testing";
    else nextStatus = "active_sandbox";

    onUpdateModule({ ...module, status: nextStatus, updatedAt: new Date().toISOString() });
  };

  const handleArchive = (module) => {
    const nextStatus = module.status === "archived" ? "testing" : "archived";
    onUpdateModule({ ...module, status: nextStatus, updatedAt: new Date().toISOString() });
  };

  const handleExportBackupJson = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      app: "Alyne Crisóstomo Imóveis - Sandbox Lab",
      version: "2026.1",
      modules,
      snapshots
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-sandbox-alyne-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackupJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result);
        if (Array.isArray(data.modules)) {
          data.modules.forEach((mod) => onUpdateModule(mod));
        }
        if (Array.isArray(data.snapshots)) {
          data.snapshots.forEach((snp) => onCreateSnapshot(snp));
        }
        showDevToast("Backup JSON importado com sucesso para a Sandbox!");
      } catch (err) {
        showDevToast("Erro ao processar o arquivo de backup JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCreateSnapshotSubmit = (e) => {
    e.preventDefault();
    if (!newSnapshotName) return;
    onCreateSnapshot({
      name: newSnapshotName,
      description: newSnapshotDesc || "Snapshot manual criado pela área de Desenvolvedor.",
      createdBy: "admin@alynecrisostomo.com.br",
      fileCount: 142,
      size: "4.8 MB",
      type: "manual"
    });
    setNewSnapshotName("");
    setNewSnapshotDesc("");
    setSnapshotModalOpen(false);
  };

  const handleConfirmRestore = () => {
    if (!snapshotToRestore) return;
    onRestoreSnapshot(snapshotToRestore);
    setRestoreSuccess(true);
    setTimeout(() => {
      setRestoreModalOpen(false);
      setRestoreSuccess(false);
      setSnapshotToRestore(null);
    }, 2000);
  };

  return (
    <div className="dev-workspace">
      {/* Header */}
      <div className="sandbox-header-banner">
        <div className="sandbox-header-copy">
          <div className="sandbox-pill-label">Hub Técnico & Ciclo de Vida</div>
          <h2>Painel do Desenvolvedor</h2>
          <p>
            Gerencie o ciclo de vida completo dos módulos: em teste, ativos na sandbox,
            desativados, implantados em produção e histórico arquivado.
          </p>
        </div>

        <div className="sandbox-header-actions" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={() => onNavigateToSandbox()}
          >
            ← Ir para a Sandbox
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => setSnapshotModalOpen(true)}
          >
            + Criar Snapshot
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={handleExportBackupJson}
            title="Baixar cópia de segurança em formato JSON para o seu computador"
          >
            ⬇ Exportar Backup JSON
          </button>
          <label className="admin-btn admin-btn-secondary" style={{ cursor: "pointer", margin: 0 }}>
            ⬆ Importar Backup
            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleImportBackupJson}
            />
          </label>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="dev-filters-bar">
        <div className="dev-status-tabs">
          <button
            type="button"
            className={activeFilter === "all" ? "active" : ""}
            onClick={() => setActiveFilter("all")}
          >
            Todos ({countByStatus.all})
          </button>
          <button
            type="button"
            className={activeFilter === "testing" ? "active" : ""}
            onClick={() => setActiveFilter("testing")}
          >
            Em Teste ({countByStatus.testing})
          </button>
          <button
            type="button"
            className={activeFilter === "active_sandbox" ? "active" : ""}
            onClick={() => setActiveFilter("active_sandbox")}
          >
            Ativos na Sandbox ({countByStatus.active_sandbox})
          </button>
          <button
            type="button"
            className={activeFilter === "inactive_sandbox" ? "active" : ""}
            onClick={() => setActiveFilter("inactive_sandbox")}
          >
            Desativados ({countByStatus.inactive_sandbox})
          </button>
          <button
            type="button"
            className={activeFilter === "deployed" ? "active" : ""}
            onClick={() => setActiveFilter("deployed")}
          >
            Implantados ({countByStatus.deployed})
          </button>
          <button
            type="button"
            className={activeFilter === "archived" ? "active" : ""}
            onClick={() => setActiveFilter("archived")}
          >
            Arquivados ({countByStatus.archived})
          </button>
        </div>

        <div className="dev-search-box">
          <input
            type="text"
            placeholder="Buscar por nome, autor ou ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Modules List Grid */}
      <div className="dev-modules-grid">
        {filteredModules.length > 0 ? (
          filteredModules.map((module) => (
            <div key={module.id} className="dev-module-card">
              <div className="dev-module-header">
                <span className={`sandbox-status-badge ${module.status}`}>
                  {module.status === "active_sandbox" && "Ativo na Sandbox"}
                  {module.status === "testing" && "Em Teste"}
                  {module.status === "inactive_sandbox" && "Desativado"}
                  {module.status === "deployed" && "Implantado"}
                  {module.status === "archived" && "Arquivado"}
                </span>
                <span className="dev-version-tag">v{module.version}</span>
              </div>

              <h3 className="dev-module-title">{module.name}</h3>
              <p className="dev-module-desc">{module.description}</p>

              <div className="dev-module-meta">
                <div>
                  <small>Arquivos</small>
                  <strong>{module.fileCount}</strong>
                </div>
                <div>
                  <small>Avaliação</small>
                  <strong className={`risk-text ${module.riskLevel || "low"}`}>
                    {module.riskLevel === "high" ? "Alto" : module.riskLevel === "medium" ? "Médio" : "Seguro"}
                  </strong>
                </div>
                <div>
                  <small>Atualizado</small>
                  <strong>{new Date(module.updatedAt || module.createdAt).toLocaleDateString("pt-BR")}</strong>
                </div>
              </div>

              <div className="dev-module-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => {
                    onSelectModule(module.id);
                    onNavigateToSandbox();
                  }}
                >
                  Abrir na Sandbox
                </button>

                {module.status !== "deployed" && module.status !== "archived" && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => handleToggleStatus(module)}
                  >
                    {module.status === "active_sandbox" ? "Desativar" : "Ativar"}
                  </button>
                )}

                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => handleArchive(module)}
                >
                  {module.status === "archived" ? "Desarquivar" : "Arquivar"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="dev-empty-state">
            <h4>Nenhum módulo encontrado nesta categoria</h4>
            <p>Importe pacotes ZIP na Sandbox ou ajuste os filtros de busca.</p>
          </div>
        )}
      </div>

      {/* Snapshots & Backups Section */}
      <div className="dev-snapshots-section">
        <div className="sandbox-card">
          <div className="sandbox-card-header">
            <h4>Snapshots e Pontos de Restauração do Sistema</h4>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => setSnapshotModalOpen(true)}
            >
              + Novo Snapshot Manual
            </button>
          </div>

          <div className="sandbox-card-body">
            <p className="sandbox-card-subtitle">
              Backups do estado da aplicação gerados antes de implantações ou manualmente para garantir recuperação instantânea.
            </p>

            <div className="dev-snapshots-list">
              {snapshots.map((snp) => (
                <div key={snp.id} className="dev-snapshot-row">
                  <div className="snapshot-icon">🛡️</div>
                  <div className="snapshot-details">
                    <strong>{snp.name}</strong>
                    <p>{snp.description}</p>
                    <div className="snapshot-sub">
                      <span>Criado em: {new Date(snp.createdAt).toLocaleString("pt-BR")}</span>
                      <span>Responsável: {snp.createdBy}</span>
                      <span>{snp.fileCount} arquivos ({snp.size})</span>
                    </div>
                  </div>
                  <div className="snapshot-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => {
                        setSnapshotToRestore(snp);
                        setRestoreModalOpen(true);
                      }}
                    >
                      Restaurar Versão
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Snapshot Modal */}
      {snapshotModalOpen && (
        <div className="sandbox-modal-backdrop">
          <div className="sandbox-modal-dialog">
            <div className="sandbox-modal-header">
              <h3>Criar Novo Snapshot do Sistema</h3>
              <button
                type="button"
                className="sandbox-modal-close"
                onClick={() => setSnapshotModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSnapshotSubmit} className="sandbox-modal-body">
              <div className="sandbox-input-group">
                <label>Nome do Snapshot:</label>
                <input
                  type="text"
                  placeholder="Ex: Antes da atualização de agosto 2026"
                  value={newSnapshotName}
                  onChange={(e) => setNewSnapshotName(e.target.value)}
                  required
                />
              </div>

              <div className="sandbox-input-group">
                <label>Descrição / Motivo:</label>
                <textarea
                  rows={3}
                  placeholder="Descreva o propósito deste backup de segurança..."
                  value={newSnapshotDesc}
                  onChange={(e) => setNewSnapshotDesc(e.target.value)}
                />
              </div>

              <div className="sandbox-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setSnapshotModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Gravar Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restore Snapshot Modal */}
      {restoreModalOpen && (
        <div className="sandbox-modal-backdrop">
          <div className="sandbox-modal-dialog">
            <div className="sandbox-modal-header">
              <h3>Restaurar Snapshot de Sistema</h3>
              <button
                type="button"
                className="sandbox-modal-close"
                onClick={() => setRestoreModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {restoreSuccess ? (
              <div className="sandbox-modal-success">
                <div className="sandbox-check-big">✓</div>
                <h4>Sistema Restaurado com Sucesso!</h4>
                <p>O estado dos arquivos e módulos foi revertido para o ponto do snapshot selecionado.</p>
              </div>
            ) : (
              <div className="sandbox-modal-body">
                <p>
                  Você está prestes a restaurar o snapshot <strong>{snapshotToRestore?.name}</strong>
                  gerado em {snapshotToRestore ? new Date(snapshotToRestore.createdAt).toLocaleString("pt-BR") : ""}.
                </p>
                <div className="sandbox-alert warning" style={{ marginTop: "12px" }}>
                  <strong>Aviso de Segurança:</strong> As alterações e módulos não salvos após a data do snapshot serão revertidos.
                </div>

                <div className="sandbox-modal-footer" style={{ marginTop: "24px" }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    onClick={() => setRestoreModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={handleConfirmRestore}
                  >
                    Confirmar Restauração Segura
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {devToast && (
        <div className="admin-toast show" style={{ zIndex: 9999 }}>
          {devToast}
        </div>
      )}
    </div>
  );
}
