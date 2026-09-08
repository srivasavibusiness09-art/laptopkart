import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadProductImage } from '../lib/storage';
import { deleteCloudinaryAssets } from '../lib/cloudinaryDelete';
import { Trash2, Plus, Edit2, X, Briefcase, Users } from 'lucide-react';

interface ClientsTabProps {
  triggerAlert: (type: 'success' | 'danger', message: string) => void;
}

export default function ClientsTab({ triggerAlert }: ClientsTabProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [authorImageUploading, setAuthorImageUploading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    logoUrl: '',
    logoPublicId: '',
    deliverableDescription: '',
    quote: '',
    authorName: '',
    authorPosition: '',
    authorImage: '',
    authorImagePublicId: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'clients'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        setClients(list);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        triggerAlert('danger', 'Failed to fetch clients');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const openModal = (item?: any) => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name || '',
        logoUrl: item.logoUrl || '',
        logoPublicId: item.logoPublicId || '',
        deliverableDescription: item.deliverableDescription || '',
        quote: item.testimonial?.quote || '',
        authorName: item.testimonial?.authorName || '',
        authorPosition: item.testimonial?.authorPosition || '',
        authorImage: item.testimonial?.authorImage || '',
        authorImagePublicId: item.testimonial?.authorImagePublicId || ''
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: '',
        name: '',
        logoUrl: '',
        logoPublicId: '',
        deliverableDescription: '',
        quote: '',
        authorName: '',
        authorPosition: '',
        authorImage: '',
        authorImagePublicId: ''
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLogoUploading(true);
      const { url, publicId } = await uploadProductImage(file);
      setFormData((prev) => ({ ...prev, logoUrl: url, logoPublicId: publicId }));
      triggerAlert('success', 'Logo uploaded successfully!');
    } catch (err) {
      triggerAlert('danger', 'Error uploading logo');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleAuthorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAuthorImageUploading(true);
      const { url, publicId } = await uploadProductImage(file);
      setFormData((prev) => ({ ...prev, authorImage: url, authorImagePublicId: publicId }));
      triggerAlert('success', 'Author image uploaded successfully!');
    } catch (err) {
      triggerAlert('danger', 'Error uploading author image');
    } finally {
      setAuthorImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      triggerAlert('danger', 'Company name is required.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        logoUrl: formData.logoUrl,
        logoPublicId: formData.logoPublicId,
        deliverableDescription: formData.deliverableDescription.trim(),
        testimonial: {
          quote: formData.quote.trim(),
          authorName: formData.authorName.trim(),
          authorPosition: formData.authorPosition.trim(),
          authorImage: formData.authorImage,
          authorImagePublicId: formData.authorImagePublicId
        }
      };

      if (isEditing) {
        await updateDoc(doc(db, 'clients', formData.id), payload);
        triggerAlert('success', 'Client updated');
      } else {
        payload.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'clients'), payload);
        triggerAlert('success', 'Client added');
      }
      closeModal();
    } catch (err) {
      triggerAlert('danger', 'Error saving client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, logoPublicId?: string, authorImagePublicId?: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const assetsToDelete = [logoPublicId, authorImagePublicId].filter(Boolean) as string[];
      if (assetsToDelete.length > 0) {
        await deleteCloudinaryAssets(assetsToDelete);
      }
      await deleteDoc(doc(db, 'clients', id));
      triggerAlert('success', 'Client deleted');
    } catch (err) {
      triggerAlert('danger', 'Error deleting client');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80, color: '#8B9BBE' }}>
        Loading clients...
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Clients & Collaborators</h1>
          <p style={{ color: '#8B9BBE', fontSize: 15 }}>Manage your trusted collaborators and their testimonials.</p>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, #8B5CF6, #D946EF)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 22px',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          <Plus size={18} /> Add Client
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ background: '#1a2235', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(139,92,246,0.15)', padding: 10, borderRadius: 12 }}>
            <Briefcase size={18} color="#8B5CF6" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{clients.length}</div>
            <div style={{ fontSize: 12, color: '#8B9BBE' }}>Total Clients</div>
          </div>
        </div>
        <div style={{ background: '#1a2235', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(217,70,239,0.12)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(217,70,239,0.15)', padding: 10, borderRadius: 12 }}>
            <Users size={18} color="#D946EF" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
              {clients.filter(c => c.testimonial?.quote).length}
            </div>
            <div style={{ fontSize: 12, color: '#8B9BBE' }}>With Testimonials</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {clients.map((c) => (
          <div
            key={c.id}
            style={{
              background: '#1a2235',
              borderRadius: 20,
              padding: 24,
              border: '1px solid rgba(139,92,246,0.12)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              {c.logoUrl ? (
                <img src={c.logoUrl} alt={c.name} style={{ width: 60, height: 40, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 4 }} />
              ) : (
                <div style={{ width: 60, height: 40, borderRadius: 8, background: 'linear-gradient(135deg, #8B5CF6, #D946EF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                  {c.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <h3 style={{ color: '#fff', margin: 0, fontSize: 16, fontWeight: 700 }}>{c.name}</h3>
              </div>
            </div>

            {c.testimonial?.quote && (
              <p style={{ color: '#C9D1E0', fontSize: 14, fontStyle: 'italic', margin: 0, padding: '12px 16px', background: 'rgba(13,17,23,0.5)', borderRadius: 12, borderLeft: '3px solid rgba(139,92,246,0.3)' }}>
                "{c.testimonial.quote}"
                <br/>
                <span style={{ fontSize: 12, color: '#8B9BBE', fontStyle: 'normal', marginTop: 4, display: 'block' }}>- {c.testimonial.authorName} ({c.testimonial.authorPosition})</span>
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(139,92,246,0.08)' }}>
              <button onClick={() => openModal(c)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#A78BFA', padding: '9px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <Edit2 size={14} /> Edit
              </button>
              <button onClick={() => handleDelete(c.id, c.logoPublicId, c.testimonial?.authorImagePublicId)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '9px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#8B9BBE', background: '#1a2235', borderRadius: 24, border: '1px dashed rgba(139,92,246,0.2)', marginTop: 20 }}>
          <Briefcase size={48} color="rgba(139,92,246,0.25)" style={{ marginBottom: 16 }} />
          <h3 style={{ color: '#fff', marginBottom: 8 }}>No Clients Yet</h3>
          <p>Add your first client / collaborator.</p>
        </div>
      )}

      {/* ===================== NEW MODAL ===================== */}
      {isModalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0f1623', width: '100%', maxWidth: '600px',
              borderRadius: '16px', border: '1px solid #1e293b',
              display: 'flex', flexDirection: 'column', maxHeight: '90vh',
              overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f1623', flexShrink: 0 }}>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 700 }}>
                {isEditing ? 'Edit Client' : 'Add Client'}
              </h2>
              <button onClick={closeModal} style={{ background: '#1e293b', border: 'none', color: '#94a3b8', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: '1 1 auto' }}>
              
              {/* Company Section */}
              <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16, borderBottom: '1px solid #1e293b', paddingBottom: 8 }}>1. Company Details</h3>
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Company Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Zentrophy"
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Company Logo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {formData.logoUrl && (
                      <div style={{ position: 'relative' }}>
                        <img src={formData.logoUrl} alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 4 }} />
                        <button onClick={() => setFormData((p) => ({ ...p, logoUrl: '', logoPublicId: '' }))} style={{ position: 'absolute', top: -6, right: -6, background: '#EF4444', border: 'none', color: 'white', width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
                      </div>
                    )}
                    <input type="file" accept="image/*" id="logoUpload" onChange={handleLogoUpload} style={{ display: 'none' }} />
                    <label htmlFor="logoUpload" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#A78BFA', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      {logoUploading ? 'Uploading...' : 'Upload Logo'}
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>What did we deliver for them? (Description)</label>
                <textarea
                  value={formData.deliverableDescription}
                  onChange={(e) => setFormData({ ...formData, deliverableDescription: e.target.value })}
                  placeholder="Describe the services or products delivered..."
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              {/* Testimonial Section */}
              <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 16, borderBottom: '1px solid #1e293b', paddingBottom: 8 }}>2. Testimonial (Optional)</h3>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Testimonial Quote</label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="What did they say about us?"
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Author Name</label>
                  <input
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    placeholder="e.g. David Smith"
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Author Position</label>
                  <input
                    value={formData.authorPosition}
                    onChange={(e) => setFormData({ ...formData, authorPosition: e.target.value })}
                    placeholder="e.g. Marketing Director"
                    style={{ width: '100%', padding: '12px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Author Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {formData.authorImage && (
                    <div style={{ position: 'relative' }}>
                      <img src={formData.authorImage} alt="Author" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #1e293b' }} />
                      <button onClick={() => setFormData((p) => ({ ...p, authorImage: '', authorImagePublicId: '' }))} style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', border: 'none', color: 'white', width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
                    </div>
                  )}
                  <input type="file" accept="image/*" id="authorImageUpload" onChange={handleAuthorImageUpload} style={{ display: 'none' }} />
                  <label htmlFor="authorImageUpload" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#A78BFA', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                    {authorImageUploading ? 'Uploading...' : 'Upload Author Image'}
                  </label>
                </div>
              </div>

            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #1e293b', display: 'flex', gap: '12px', backgroundColor: '#0f1623', flexShrink: 0 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #8B5CF6, #D946EF)', border: 'none', color: '#fff', borderRadius: '10px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
