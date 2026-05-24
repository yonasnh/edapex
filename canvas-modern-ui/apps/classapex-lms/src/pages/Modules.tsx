import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCanvasQuery, canvasFetch } from '../hooks/useCanvasQuery';
import { useNotification } from '../hooks/useNotification';

function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function DragHandleSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 4h6M5 8h6M5 12h6"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function ChevronDownSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6l4 4 4-4"/></svg>; }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M3 4v10a1 1 0 001 1h8a1 1 0 001-1V4M5 4V2a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>; }

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

export default function ModulesPage() {
  const { courseId } = useParams();
  const { showToast } = useNotification();
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  
  // Modals state
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState<number | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('Assignment');

  // Drag and Drop state
  const [draggingItemId, setDraggingItemId] = useState<number | null>(null);

  // Fetch modules with items
  const { data: modules, isLoading, isError, refetch } = useCanvasQuery<Module[]>(
    `/api/v1/courses/${courseId}/modules`,
    { 'include[]': 'items' } as any
  );

  const toggleExpand = (modId: number) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleCreateModule = async (e: React.FormEvent) => {
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
  };

  const handleTogglePublishModule = async (mod: Module) => {
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${mod.id}`, {
        method: 'PUT',
        body: { module: { published: !mod.published } }
      });
      showToast({ title: 'Success', message: `Module ${!mod.published ? 'published' : 'unpublished'}`, type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to update module', type: 'error' });
    }
  };

  const handleDeleteModule = async (modId: number) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${modId}`, {
        method: 'DELETE'
      });
      showToast({ title: 'Success', message: 'Module deleted', type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to delete module', type: 'error' });
    }
  };

  const handleCreateItem = async (e: React.FormEvent, modId: number) => {
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
  };

  const handleTogglePublishItem = async (modId: number, item: ModuleItem) => {
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${modId}/items/${item.id}`, {
        method: 'PUT',
        body: { module_item: { published: !item.published } }
      });
      showToast({ title: 'Success', message: `Item ${!item.published ? 'published' : 'unpublished'}`, type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to update item', type: 'error' });
    }
  };

  const handleDeleteItem = async (modId: number, itemId: number) => {
    if (!confirm('Are you sure you want to remove this item?')) return;
    try {
      await canvasFetch(`/api/v1/courses/${courseId}/modules/${modId}/items/${itemId}`, {
        method: 'DELETE'
      });
      showToast({ title: 'Success', message: 'Item removed', type: 'success' });
      refetch();
    } catch (err: any) {
      showToast({ title: 'Error', message: err.message || 'Failed to remove item', type: 'error' });
    }
  };

  // Drag and Drop reordering handlers
  const handleDragStart = (e: React.DragEvent, itemId: number) => {
    e.dataTransfer.setData('text/plain', String(itemId));
    setDraggingItemId(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetModuleId: number, targetPosition: number) => {
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
  };

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

  return (
    <div className="cx-page">
      <div className="cx-page__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--cx-text-primary)', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>Modules</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--cx-text-secondary)', margin: '4px 0 0' }}>Organize your course content sequentially.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="cx-btn cx-btn--primary" onClick={() => setShowAddModuleModal(true)}><PlusSvg /> Module</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {sortedModules.map((mod) => {
          const isExpanded = expandedModules[mod.id] !== false; // expanded by default
          const items = [...(mod.items || [])].sort((a, b) => a.position - b.position);

          return (
            <div key={mod.id} style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 8, background: 'var(--cx-bg-surface)', overflow: 'hidden' }}>
              <div 
                style={{ padding: '16px', background: 'var(--cx-bg-surface-sunken)', display: 'flex', alignItems: 'center', borderBottom: isExpanded ? '1px solid var(--cx-border-subtle)' : 'none', cursor: 'pointer' }}
                onClick={() => toggleExpand(mod.id)}
              >
                <div style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', marginRight: 8, color: 'var(--cx-text-secondary)' }}><ChevronDownSvg /></div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, flex: 1, color: 'var(--cx-text-primary)' }}>{mod.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={e => e.stopPropagation()}>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setShowAddItemModal(mod.id)}><PlusSvg /></button>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleTogglePublishModule(mod)} style={{ color: mod.published ? 'var(--cx-color-success)' : 'var(--cx-text-tertiary)' }}><CheckSvg /></button>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteModule(mod.id)} style={{ color: 'var(--cx-color-danger)' }}><TrashSvg /></button>
                </div>
              </div>
              
              {isExpanded && (
                <div style={{ padding: '8px 16px' }}>
                  {items.map((item, idx) => (
                    <div 
                      key={item.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, mod.id, item.position)}
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
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, color: 'var(--cx-text-primary)' }}>{item.title}</div>
                        {item.completion_requirement && <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>Must {item.completion_requirement.type}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={e => e.stopPropagation()}>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleTogglePublishItem(mod.id, item)} style={{ color: item.published ? 'var(--cx-color-success)' : 'var(--cx-text-tertiary)' }}><CheckSvg /></button>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleDeleteItem(mod.id, item.id)} style={{ color: 'var(--cx-color-danger)' }}><TrashSvg /></button>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}
