import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import { useNotification } from '../hooks/useNotification';
import { useRole } from '../contexts/RoleContext';

function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function DragHandleSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h6M5 8h6M5 12h6"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function ChevronDownSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6l4 4 4-4"/></svg>; }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M3 4v10a1 1 0 001 1h8a1 1 0 001-1V4M5 4V2a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>; }
function LinkSvg() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 8a3 3 0 010-4.2l2-2a3 3 0 014.2 4.2l-1 1"/><path d="M10 8a3 3 0 010 4.2l-2 2a3 3 0 01-4.2-4.2l1-1"/></svg>; }
function GearSvg() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.8 3.8l1.1 1.1M11.1 11.1l1.1 1.1M3.8 12.2l1.1-1.1M11.1 4.9l1.1-1.1"/></svg>; }
function BranchSvg() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="3" r="1.5"/><path d="M8 4.5v3"/><path d="M8 7.5L4 12"/><path d="M8 7.5L12 12"/></svg>; }

interface ModuleItem {
  id: number;
  title: string;
  type: string;
  published: boolean;
  completion_requirement?: { type: string; min_score?: number };
  position: number;
}

interface Module {
  id: number;
  name: string;
  published: boolean;
  position: number;
  prerequisite_module_ids?: number[];
  items?: ModuleItem[];
}

interface CanvasAssignment {
  id: number;
  name: string;
}

interface MasteryPathRule {
  minScore: number;
  maxScore: number;
  itemIds: number[];
}

interface MasteryPathConfig {
  baseAssessmentId: number | null;
  remedial: MasteryPathRule;
  standard: MasteryPathRule;
  advanced: MasteryPathRule;
}

const defaultMasteryConfig = (): MasteryPathConfig => ({
  baseAssessmentId: null,
  remedial: { minScore: 0, maxScore: 59, itemIds: [] },
  standard: { minScore: 60, maxScore: 79, itemIds: [] },
  advanced: { minScore: 80, maxScore: 100, itemIds: [] },
});

export default function ModulesPage() {
  const { courseId } = useParams();
  const { showToast, showConfirm } = useNotification();
  const { role } = useRole();
  const isTeacher = role === 'teacher' || role === 'admin';
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  
  // Modals state
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState<number | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('Assignment');

  // Drag and Drop state
  const [draggingItemId, setDraggingItemId] = useState<number | null>(null);
  const [draggingModuleId, setDraggingModuleId] = useState<number | null>(null);
  const [mutatingModuleId, setMutatingModuleId] = useState<number | null>(null);
  const [mutatingItemId, setMutatingItemId] = useState<number | null>(null);

  // Prerequisites state
  const [editingPrereqsModuleId, setEditingPrereqsModuleId] = useState<number | null>(null);
  const [selectedPrereqIds, setSelectedPrereqIds] = useState<number[]>([]);
  const [savingPrereqsModuleId, setSavingPrereqsModuleId] = useState<number | null>(null);

  // Completion requirement state
  const [editingCompletionItem, setEditingCompletionItem] = useState<{ moduleId: number; itemId: number } | null>(null);
  const [completionType, setCompletionType] = useState<'none' | 'must_view' | 'must_submit' | 'min_score'>('none');
  const [completionMinScore, setCompletionMinScore] = useState<string>('');
  const [savingCompletionItemId, setSavingCompletionItemId] = useState<number | null>(null);

  // Mastery Paths state
  const [editingMasteryPathsModuleId, setEditingMasteryPathsModuleId] = useState<number | null>(null);
  const [masteryPathsConfig, setMasteryPathsConfig] = useState<Record<number, MasteryPathConfig>>({});

  // Fetch modules with items
  const { data: modules, isLoading, isError, refetch } = useCanvasQuery<Module[]>(
    `/api/v1/courses/${courseId}/modules`,
    { 'include[]': 'items' } as any
  );

  // Fetch assignments for base assessment selector
  const { data: assignments } = useCanvasQuery<CanvasAssignment[]>(
    `/api/v1/courses/${courseId}/assignments`,
    { per_page: 100 } as any
  );

  const toggleExpand = (modId: number) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleCreateModule = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules`, {
        method: 'POST',
        body: { module: { name: newModuleName } }
      });
      showToast({ title: 'Success', message: 'Module created successfully', type: 'success' });
      setNewModuleName('');
      setShowAddModuleModal(false);
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to create module', type: 'error' });
    }
  }, [courseId, newModuleName, showToast, refetch]);

  const handleTogglePublishModule = useCallback(async (mod: Module) => {
    const nextPublished = !mod.published;
    setMutatingModuleId(mod.id);
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${mod.id}`, {
        method: 'PUT',
        body: { module: { published: nextPublished } }
      });
      showToast({ title: 'Success', message: `Module ${nextPublished ? 'published' : 'unpublished'}`, type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to update module', type: 'error' });
    } finally {
      setMutatingModuleId(null);
    }
  }, [courseId, showToast, refetch]);

  const handleDeleteModule = useCallback(async (modId: number) => {
    const confirmed = await showConfirm({
      title: 'Delete Module',
      message: 'Are you sure you want to delete this module and all its items?',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    setMutatingModuleId(modId);
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${modId}`, {
        method: 'DELETE'
      });
      showToast({ title: 'Success', message: 'Module deleted', type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to delete module', type: 'error' });
    } finally {
      setMutatingModuleId(null);
    }
  }, [courseId, showConfirm, showToast, refetch]);

  const handleCreateItem = useCallback(async (e: React.FormEvent, modId: number) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${modId}/items`, {
        method: 'POST',
        body: { module_item: { title: newItemTitle, type: newItemType } }
      });
      showToast({ title: 'Success', message: 'Module item added', type: 'success' });
      setNewItemTitle('');
      setShowAddItemModal(null);
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to add item', type: 'error' });
    }
  }, [courseId, newItemTitle, newItemType, showToast, refetch]);

  const handleTogglePublishItem = useCallback(async (modId: number, item: ModuleItem) => {
    const nextPublished = !item.published;
    setMutatingItemId(item.id);
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${modId}/items/${item.id}`, {
        method: 'PUT',
        body: { module_item: { published: nextPublished } }
      });
      showToast({ title: 'Success', message: `Item ${nextPublished ? 'published' : 'unpublished'}`, type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to update item', type: 'error' });
    } finally {
      setMutatingItemId(null);
    }
  }, [courseId, showToast, refetch]);

  const handleDeleteItem = useCallback(async (modId: number, itemId: number) => {
    const confirmed = await showConfirm({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from the module?',
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    setMutatingItemId(itemId);
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${modId}/items/${itemId}`, {
        method: 'DELETE'
      });
      showToast({ title: 'Success', message: 'Item removed', type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to remove item', type: 'error' });
    } finally {
      setMutatingItemId(null);
    }
  }, [courseId, showConfirm, showToast, refetch]);

  const handleSavePrerequisites = useCallback(async (modId: number) => {
    setSavingPrereqsModuleId(modId);
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${modId}`, {
        method: 'PUT',
        body: { module: { prerequisite_module_ids: selectedPrereqIds } }
      });
      showToast({ title: 'Success', message: 'Prerequisites updated', type: 'success' });
      setEditingPrereqsModuleId(null);
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to update prerequisites', type: 'error' });
    } finally {
      setSavingPrereqsModuleId(null);
    }
  }, [courseId, selectedPrereqIds, showToast, refetch]);

  const handleOpenPrereqsModal = (mod: Module) => {
    setSelectedPrereqIds(mod.prerequisite_module_ids || []);
    setEditingPrereqsModuleId(mod.id);
  };

  const handleSaveCompletionRequirement = useCallback(async (moduleId: number, itemId: number) => {
    setSavingCompletionItemId(itemId);
    try {
      const body: any = { module_item: {} };
      if (completionType === 'none') {
        body.module_item.completion_requirement = null;
      } else {
        body.module_item.completion_requirement = { type: completionType };
        if (completionType === 'min_score') {
          body.module_item.completion_requirement.min_score = Number(completionMinScore);
        }
      }
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${moduleId}/items/${itemId}`, {
        method: 'PUT',
        body
      });
      showToast({ title: 'Success', message: 'Completion requirement updated', type: 'success' });
      setEditingCompletionItem(null);
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to update completion requirement', type: 'error' });
    } finally {
      setSavingCompletionItemId(null);
    }
  }, [courseId, completionType, completionMinScore, showToast, refetch]);

  const handleOpenCompletionModal = (moduleId: number, item: ModuleItem) => {
    setEditingCompletionItem({ moduleId, itemId: item.id });
    if (item.completion_requirement?.type === 'must_view') setCompletionType('must_view');
    else if (item.completion_requirement?.type === 'must_submit') setCompletionType('must_submit');
    else if (item.completion_requirement?.type === 'min_score') {
      setCompletionType('min_score');
      setCompletionMinScore(String(item.completion_requirement.min_score || ''));
    } else {
      setCompletionType('none');
      setCompletionMinScore('');
    }
  };

  // Mastery Paths handlers
  const handleOpenMasteryPathsModal = (mod: Module) => {
    setEditingMasteryPathsModuleId(mod.id);
    setMasteryPathsConfig(prev => {
      if (prev[mod.id]) return prev;
      return { ...prev, [mod.id]: defaultMasteryConfig() };
    });
  };

  const handleUpdateMasteryPath = (modId: number, pathKey: 'remedial' | 'standard' | 'advanced', updates: Partial<MasteryPathRule>) => {
    setMasteryPathsConfig(prev => {
      const existing = prev[modId] || defaultMasteryConfig();
      return {
        ...prev,
        [modId]: {
          ...existing,
          [pathKey]: { ...existing[pathKey], ...updates }
        }
      };
    });
  };

  const handleToggleMasteryPathItem = (modId: number, pathKey: 'remedial' | 'standard' | 'advanced', itemId: number) => {
    setMasteryPathsConfig(prev => {
      const existing = prev[modId] || defaultMasteryConfig();
      const currentItemIds = existing[pathKey].itemIds;
      const newItemIds = currentItemIds.includes(itemId)
        ? currentItemIds.filter(id => id !== itemId)
        : [...currentItemIds, itemId];
      return {
        ...prev,
        [modId]: {
          ...existing,
          [pathKey]: { ...existing[pathKey], itemIds: newItemIds }
        }
      };
    });
  };

  const handleSetBaseAssessment = (modId: number, assessmentId: number | null) => {
    setMasteryPathsConfig(prev => {
      const existing = prev[modId] || defaultMasteryConfig();
      return {
        ...prev,
        [modId]: { ...existing, baseAssessmentId: assessmentId }
      };
    });
  };

  // Drag and Drop reordering handlers
  const handleDragStart = useCallback((e: React.DragEvent, itemId: number) => {
    e.dataTransfer.setData('text/plain', String(itemId));
    setDraggingItemId(itemId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDropItem = useCallback(async (e: React.DragEvent, targetModuleId: number, targetPosition: number) => {
    e.preventDefault();
    const draggedId = Number(e.dataTransfer.getData('text/plain'));
    if (!draggedId || draggedId === draggingItemId) return;

    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${targetModuleId}/items/${draggedId}`, {
        method: 'PUT',
        body: { module_item: { position: targetPosition } }
      });
      showToast({ title: 'Reordered', message: 'Module item order updated', type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to reorder item', type: 'error' });
    } finally {
      setDraggingItemId(null);
    }
  }, [courseId, draggingItemId, showToast, refetch]);

  // Module-level drag and drop
  const handleModuleDragStart = useCallback((e: React.DragEvent, moduleId: number) => {
    e.dataTransfer.setData('module/plain', String(moduleId));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingModuleId(moduleId);
  }, []);

  const handleModuleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleModuleDrop = useCallback(async (e: React.DragEvent, targetPosition: number) => {
    e.preventDefault();
    const draggedId = Number(e.dataTransfer.getData('module/plain'));
    if (!draggedId || draggedId === draggingModuleId) return;

    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${draggedId}`, {
        method: 'PUT',
        body: { module: { position: targetPosition } }
      });
      showToast({ title: 'Reordered', message: 'Module order updated', type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to reorder module', type: 'error' });
    } finally {
      setDraggingModuleId(null);
    }
  }, [courseId, draggingModuleId, showToast, refetch]);

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'page': return '📄';
      case 'discussion': return '💬';
      case 'assignment': return '📝';
      case 'quiz': return '🚀';
      case 'file': return '📎';
      case 'externalurl': return '🔗';
      default: return '📦';
    }
  };

  const getMasteryPathBadges = (modId: number, itemId: number) => {
    const config = masteryPathsConfig[modId];
    if (!config) return [];
    const badges: { label: string; color: string; bg: string; border: string }[] = [];
    if (config.remedial.itemIds.includes(itemId)) badges.push({ label: 'Remedial', color: '#c2410c', bg: '#fff7ed', border: '#fdba74' });
    if (config.standard.itemIds.includes(itemId)) badges.push({ label: 'Standard', color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' });
    if (config.advanced.itemIds.includes(itemId)) badges.push({ label: 'Advanced', color: '#15803d', bg: '#f0fdf4', border: '#86efac' });
    return badges;
  };

  if (isLoading) {
    return (
      <div className="cx-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <div className="cx-loading-ring" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="cx-page">
        <div className="cx-notification cx-notification--danger">Failed to load modules list.</div>
      </div>
    );
  }

  const sortedModules = [...(modules || [])].sort((a, b) => a.position - b.position);

  const editingMasteryModule = editingMasteryPathsModuleId !== null ? sortedModules.find(m => m.id === editingMasteryPathsModuleId) : undefined;
  const editingMasteryItems = editingMasteryModule ? [...(editingMasteryModule.items || [])].sort((a, b) => a.position - b.position) : [];
  const currentMasteryConfig = editingMasteryModule ? masteryPathsConfig[editingMasteryModule.id] : null;

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Modules</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--cx-text-secondary)', margin: '4px 0 0' }}>Organize your course content sequentially.</p>
        </div>
        {isTeacher && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="cx-btn cx-btn--primary" onClick={() => setShowAddModuleModal(true)}><PlusSvg /> Module</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sortedModules.map((mod) => {
          const isExpanded = expandedModules[mod.id] !== false; // expanded by default
          const items = [...(mod.items || [])].sort((a, b) => a.position - b.position);

          return (
            <div 
              key={mod.id} 
              draggable
              onDragStart={(e) => handleModuleDragStart(e, mod.id)}
              onDragOver={handleModuleDragOver}
              onDrop={(e) => handleModuleDrop(e, mod.position)}
              style={{ 
                border: '1px solid var(--cx-border-subtle)', 
                borderRadius: 8, 
                background: 'var(--cx-bg-surface)', 
                overflow: 'hidden',
                opacity: draggingModuleId === mod.id ? 0.5 : 1,
                cursor: 'grab'
              }}
            >
              <div 
                style={{ padding: '16px', background: 'var(--cx-bg-surface-sunken)', display: 'flex', alignItems: 'center', borderBottom: isExpanded ? '1px solid var(--cx-border-subtle)' : 'none', cursor: 'pointer' }}
                onClick={() => toggleExpand(mod.id)}
              >
                <div style={{ marginRight: 12, color: 'var(--cx-text-tertiary)', cursor: 'grab' }}><DragHandleSvg /></div>
                <div style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', marginRight: 8, color: 'var(--cx-text-secondary)' }}><ChevronDownSvg /></div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)' }}>{mod.name}</h3>
                  {isExpanded && mod.prerequisite_module_ids && mod.prerequisite_module_ids.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                      {mod.prerequisite_module_ids.map(prereqId => {
                        const prereqMod = sortedModules.find(m => m.id === prereqId);
                        return prereqMod ? (
                          <span key={prereqId} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--cx-bg-surface-sunken)', borderRadius: 4, color: 'var(--cx-text-secondary)', border: '1px solid var(--cx-border-subtle)' }}>
                            {prereqMod.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={e => e.stopPropagation()}>
                  {isTeacher && (
                    <>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setShowAddItemModal(mod.id)} disabled={mutatingModuleId === mod.id}><PlusSvg /></button>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleOpenPrereqsModal(mod)} disabled={mutatingModuleId === mod.id || savingPrereqsModuleId === mod.id} title="Prerequisites"><LinkSvg /></button>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleOpenMasteryPathsModal(mod)} disabled={mutatingModuleId === mod.id} title="Mastery Paths"><BranchSvg /></button>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleTogglePublishModule(mod)} disabled={mutatingModuleId === mod.id} style={{ color: mod.published ? 'var(--cx-color-success)' : 'var(--cx-text-tertiary)' }}><CheckSvg /></button>
                      <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteModule(mod.id)} disabled={mutatingModuleId === mod.id} style={{ color: 'var(--cx-color-danger)' }}><TrashSvg /></button>
                    </>
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div style={{ padding: '8px 16px' }}>
                  {items.map((item, idx) => {
                    const badges = getMasteryPathBadges(mod.id, item.id);
                    return (
                      <div 
                        key={item.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropItem(e, mod.id, item.position)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '12px 8px', 
                          borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--cx-border-subtle)',
                          opacity: draggingItemId === item.id ? 0.4 : 1,
                          cursor: 'grab'
                        }}
                      >
                        <div style={{ marginRight: 12, color: 'var(--cx-text-tertiary)' }}><DragHandleSvg /></div>
                        <span style={{ marginRight: 12 }}>{getIconForType(item.type)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, color: 'var(--cx-text-primary)' }}>{item.title}</div>
                          {item.completion_requirement && <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Must {item.completion_requirement.type}{item.completion_requirement.min_score !== undefined ? ` ≥ ${item.completion_requirement.min_score}` : ''}</div>}
                          {badges.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                              {badges.map(b => (
                                <span key={b.label} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, color: b.color, background: b.bg, border: `1px solid ${b.border}`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                  {b.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={e => e.stopPropagation()}>
                          {isTeacher && (
                            <>
                              <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleTogglePublishItem(mod.id, item)} disabled={mutatingItemId === item.id} style={{ color: item.published ? 'var(--cx-color-success)' : 'var(--cx-text-tertiary)' }}><CheckSvg /></button>
                              <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleOpenCompletionModal(mod.id, item)} disabled={mutatingItemId === item.id || savingCompletionItemId === item.id} title="Completion Requirement"><GearSvg /></button>
                              <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteItem(mod.id, item.id)} disabled={mutatingItemId === item.id} style={{ color: 'var(--cx-color-danger)' }}><TrashSvg /></button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {items.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--cx-text-tertiary)', fontSize: '0.875rem', border: '1px dashed var(--cx-border-subtle)', borderRadius: 6, margin: '8px 0' }}>
                      No items in this module. Click "+" to add content.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Module Modal */}
      {showAddModuleModal && (
        <div className="cx-modal-overlay" onClick={() => setShowAddModuleModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Create Module</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowAddModuleModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateModule}>
              <div className="cx-modal__body">
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>Module Name</label>
                  <input 
                    type="text" 
                    className="cx-search__input" 
                    style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }} 
                    value={newModuleName} 
                    onChange={e => setNewModuleName(e.target.value)} 
                    placeholder="e.g. Week 1: Introduction" 
                    required 
                  />
                </div>
              </div>
              <div className="cx-modal__footer">
                <button type="button" className="cx-btn cx-btn--secondary" onClick={() => setShowAddModuleModal(false)}>Cancel</button>
                <button type="submit" className="cx-btn cx-btn--primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal !== null && (
        <div className="cx-modal-overlay" onClick={() => setShowAddItemModal(null)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Add Item to Module</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowAddItemModal(null)}>&times;</button>
            </div>
            <form onSubmit={(e) => handleCreateItem(e, showAddItemModal)}>
              <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>Type</label>
                  <select 
                    className="cx-select" 
                    style={{ width: '100%' }} 
                    value={newItemType} 
                    onChange={e => setNewItemType(e.target.value)}
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Discussion">Discussion</option>
                    <option value="Page">Content Page</option>
                    <option value="ExternalUrl">External URL</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>Item Title</label>
                  <input 
                    type="text" 
                    className="cx-search__input" 
                    style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }} 
                    value={newItemTitle} 
                    onChange={e => setNewItemTitle(e.target.value)} 
                    placeholder="e.g. Reading Assignment" 
                    required 
                  />
                </div>
              </div>
              <div className="cx-modal__footer">
                <button type="button" className="cx-btn cx-btn--secondary" onClick={() => setShowAddItemModal(null)}>Cancel</button>
                <button type="submit" className="cx-btn cx-btn--primary">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prerequisites Modal */}
      {editingPrereqsModuleId !== null && (
        <div className="cx-modal-overlay" onClick={() => setEditingPrereqsModuleId(null)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Edit Prerequisites</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setEditingPrereqsModuleId(null)}>&times;</button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedModules.filter(m => m.id !== editingPrereqsModuleId).map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedPrereqIds.includes(m.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedPrereqIds(prev => [...prev, m.id]);
                        } else {
                          setSelectedPrereqIds(prev => prev.filter(id => id !== m.id));
                        }
                      }}
                    />
                    <span>{m.name}</span>
                  </label>
                ))}
                {sortedModules.filter(m => m.id !== editingPrereqsModuleId).length === 0 && (
                  <p style={{ color: 'var(--cx-text-secondary)', fontSize: '0.875rem' }}>No other modules available.</p>
                )}
              </div>
            </div>
            <div className="cx-modal__footer">
              <button type="button" className="cx-btn cx-btn--secondary" onClick={() => setEditingPrereqsModuleId(null)}>Cancel</button>
              <button
                type="button"
                className="cx-btn cx-btn--primary"
                onClick={() => handleSavePrerequisites(editingPrereqsModuleId)}
                disabled={savingPrereqsModuleId === editingPrereqsModuleId}
              >
                {savingPrereqsModuleId === editingPrereqsModuleId ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Requirement Modal */}
      {editingCompletionItem !== null && (
        <div className="cx-modal-overlay" onClick={() => setEditingCompletionItem(null)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Completion Requirement</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setEditingCompletionItem(null)}>&times;</button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="radio" name="completionType" checked={completionType === 'none'} onChange={() => setCompletionType('none')} />
                <span>None</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="radio" name="completionType" checked={completionType === 'must_view'} onChange={() => setCompletionType('must_view')} />
                <span>Must view</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="radio" name="completionType" checked={completionType === 'must_submit'} onChange={() => setCompletionType('must_submit')} />
                <span>Must submit</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="radio" name="completionType" checked={completionType === 'min_score'} onChange={() => setCompletionType('min_score')} />
                <span>Must score at least</span>
              </label>
              {completionType === 'min_score' && (
                <input
                  type="number"
                  className="cx-search__input"
                  style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }}
                  value={completionMinScore}
                  onChange={e => setCompletionMinScore(e.target.value)}
                  placeholder="Minimum score"
                  min={0}
                />
              )}
            </div>
            <div className="cx-modal__footer">
              <button type="button" className="cx-btn cx-btn--secondary" onClick={() => setEditingCompletionItem(null)}>Cancel</button>
              <button
                type="button"
                className="cx-btn cx-btn--primary"
                onClick={() => handleSaveCompletionRequirement(editingCompletionItem.moduleId, editingCompletionItem.itemId)}
                disabled={savingCompletionItemId === editingCompletionItem.itemId}
              >
                {savingCompletionItemId === editingCompletionItem.itemId ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mastery Paths Modal */}
      {editingMasteryPathsModuleId !== null && editingMasteryModule && currentMasteryConfig && (
        <div className="cx-modal-overlay" onClick={() => setEditingMasteryPathsModuleId(null)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()} style={{ maxWidth: 780 }}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Mastery Paths — {editingMasteryModule.name}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setEditingMasteryPathsModuleId(null)}>&times;</button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', margin: 0 }}>
                Define conditional release rules. Students will see different content based on their performance.
              </p>
              
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.875rem', fontWeight: 600 }}>Base Assessment</label>
                <select 
                  className="cx-select" 
                  style={{ width: '100%' }} 
                  value={currentMasteryConfig.baseAssessmentId ?? ''} 
                  onChange={e => handleSetBaseAssessment(editingMasteryModule.id, e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">— Select an assignment or quiz —</option>
                  {(assignments || []).map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {([
                  { key: 'remedial' as const, label: 'Remedial', color: '#c2410c', bg: '#fff7ed', border: '#fdba74' },
                  { key: 'standard' as const, label: 'Standard', color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd' },
                  { key: 'advanced' as const, label: 'Advanced', color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
                ]).map(path => (
                  <div key={path.key} style={{ flex: 1, minWidth: 180, border: `1px solid ${path.border}`, borderRadius: 8, padding: 12, background: path.bg }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: path.color, marginBottom: 10, textAlign: 'center' }}>
                      {path.label}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, color: 'var(--cx-text-secondary)' }}>Min %</label>
                        <input
                          type="number"
                          className="cx-search__input"
                          style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }}
                          min={0}
                          max={100}
                          value={currentMasteryConfig[path.key].minScore}
                          onChange={e => handleUpdateMasteryPath(editingMasteryModule.id, path.key, { minScore: Number(e.target.value) })}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, color: 'var(--cx-text-secondary)' }}>Max %</label>
                        <input
                          type="number"
                          className="cx-search__input"
                          style={{ width: '100%', border: '1px solid var(--cx-border-subtle)' }}
                          min={0}
                          max={100}
                          value={currentMasteryConfig[path.key].maxScore}
                          onChange={e => handleUpdateMasteryPath(editingMasteryModule.id, path.key, { maxScore: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cx-text-secondary)', marginBottom: 6 }}>Released Items</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
                      {editingMasteryItems.length === 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>No items in this module.</span>
                      )}
                      {editingMasteryItems.map(item => (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer', color: 'var(--cx-text-primary)' }}>
                          <input
                            type="checkbox"
                            checked={currentMasteryConfig[path.key].itemIds.includes(item.id)}
                            onChange={() => handleToggleMasteryPathItem(editingMasteryModule.id, path.key, item.id)}
                          />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--cx-text-secondary)', background: 'var(--cx-bg-surface-sunken)', padding: 12, borderRadius: 6, border: '1px solid var(--cx-border-subtle)' }}>
                <strong>Note:</strong> These rules are displayed for instructional planning. Canvas conditional release is managed via Assignment Overrides.
              </div>
            </div>
            <div className="cx-modal__footer">
              <button type="button" className="cx-btn cx-btn--secondary" onClick={() => setEditingMasteryPathsModuleId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
