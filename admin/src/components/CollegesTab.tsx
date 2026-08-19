import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { QRCodeSVG } from 'qrcode.react';
import { Download, Target, Users, BookOpen, Trash2 } from 'lucide-react';

interface College {
  id: string;
  name: string;
  qrScans: number;
  createdAt: string;
}

export default function CollegesTab() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeId, setNewCollegeId] = useState('');
  const [useLocalHost, setUseLocalHost] = useState(false);
  
  const [metrics, setMetrics] = useState<Record<string, { users: number, blogs: number }>>({});

  useEffect(() => {
    const q = query(collection(db, "colleges"));
    const unsub = onSnapshot(q, (snap) => {
      const list: College[] = [];
      snap.forEach(d => list.push(d.data() as College));
      setColleges(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      const metricsObj: Record<string, { users: number, blogs: number }> = {};
      colleges.forEach(c => metricsObj[c.id] = { users: 0, blogs: 0 });

      try {
        const usersSnap = await getDocs(collection(db, "users"));
        usersSnap.forEach(d => {
          const data = d.data();
          if (data.collegeId && metricsObj[data.collegeId]) {
            metricsObj[data.collegeId].users++;
          }
        });

        const blogsSnap = await getDocs(collection(db, "blogs"));
        blogsSnap.forEach(d => {
          const data = d.data();
          if (data.collegeId && metricsObj[data.collegeId]) {
            metricsObj[data.collegeId].blogs++;
          }
        });

        setMetrics(metricsObj);
      } catch (err) {
        console.error("Error fetching metrics", err);
      }
    };
    if (colleges.length > 0) {
      fetchMetrics();
    }
  }, [colleges]);

  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeId.trim() || !newCollegeName.trim()) return;
    
    const id = newCollegeId.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    try {
      await setDoc(doc(db, "colleges", id), {
        id,
        name: newCollegeName.trim(),
        qrScans: 0,
        createdAt: new Date().toISOString()
      });
      setNewCollegeId('');
      setNewCollegeName('');
      // alert("College added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding college");
    }
  };

  const handleDeleteCollege = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name} (ID: ${id})? This will permanently remove its tracking stats.`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, "colleges", id));
    } catch (err) {
      console.error(err);
      alert("Error deleting college.");
    }
  };

  const downloadQR = (id: string, name: string) => {
    const svg = document.getElementById(`qr-svg-${id}`) as any;
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvasObj = document.createElement("canvas");
    const ctx = canvasObj.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvasObj.width = img.width + 40;
      canvasObj.height = img.height + 80;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasObj.width, canvasObj.height);
        ctx.drawImage(img, 20, 20);
        ctx.font = "bold 24px sans-serif";
        ctx.fillStyle = "#1a2235";
        ctx.textAlign = "center";
        ctx.fillText(name, canvasObj.width / 2, canvasObj.height - 24);
      }
      const pngFile = canvasObj.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Sora', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
          College QR Campaigns
        </h1>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#8B9BBE', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={useLocalHost}
            onChange={(e) => setUseLocalHost(e.target.checked)}
          />
          Test on Localhost
        </label>
      </div>
      <p style={{ color: '#8B9BBE', fontSize: 15, marginBottom: 32 }}>
        Manage unique QR codes for specific colleges and track scans, users, and blogs.
      </p>

      <div style={{ background: '#1a2235', padding: '28px', borderRadius: '24px', border: '1px solid rgba(56,189,248,0.15)', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={18} color="#F59E0B" /> Register New College
        </h3>
        <form onSubmit={handleAddCollege} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#8B9BBE', marginBottom: '8px', fontWeight: 600 }}>College Name (e.g. Sona College)</label>
            <input 
              type="text" 
              value={newCollegeName}
              onChange={e => setNewCollegeName(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(26, 34, 53, 0.4)', border: '1px solid rgba(56,189,248,0.2)', color: '#fff', borderRadius: '12px', outline: 'none' }}
              placeholder="Sona College"
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#8B9BBE', marginBottom: '8px', fontWeight: 600 }}>Tracking ID (e.g. SONA2026)</label>
            <input 
              type="text" 
              value={newCollegeId}
              onChange={e => setNewCollegeId(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(26, 34, 53, 0.4)', border: '1px solid rgba(56,189,248,0.2)', color: '#fff', borderRadius: '12px', outline: 'none' }}
              placeholder="SONA2026"
            />
          </div>
          <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #3B82F6, #38BDF8)', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontFamily: 'Sora', height: '44px' }}>
            Generate QR
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {colleges.map(college => {
          const baseUrl = useLocalHost ? 'http://192.168.1.6:3000' : 'https://laptopkart.in';
          const qrUrl = `${baseUrl}/api/qr/${college.id}`;
          return (
            <div key={college.id} style={{ background: '#1a2235', borderRadius: '24px', padding: '24px', border: '1px solid rgba(56,189,248,0.15)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: 6 }}>{college.name}</h4>
                  <span style={{ fontSize: '12px', color: '#38BDF8', background: 'rgba(56,189,248,0.1)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>ID: {college.id}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleDeleteCollege(college.id, college.name)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#EF4444', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Delete College"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={() => downloadQR(college.id, college.name)}
                    style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38BDF8', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Download High-Res QR"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1 }}>
                <div style={{ padding: '12px', background: '#fff', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <QRCodeSVG 
                    id={`qr-svg-${college.id}`}
                    value={qrUrl} 
                    size={400} 
                    level="H"
                    includeMargin={true}
                    style={{ width: '100px', height: '100px', display: 'block' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '10px' }}>
                      <Target size={18} color="#3b82f6" />
                    </div>
                    <span style={{ fontSize: '15px', color: '#8B9BBE' }}>Scans: <strong style={{ color: '#fff', marginLeft: 6, fontSize: '16px' }}>{college.qrScans}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px' }}>
                      <Users size={18} color="#10b981" />
                    </div>
                    <span style={{ fontSize: '15px', color: '#8B9BBE' }}>Users: <strong style={{ color: '#fff', marginLeft: 6, fontSize: '16px' }}>{metrics[college.id]?.users || 0}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px' }}>
                      <BookOpen size={18} color="#f59e0b" />
                    </div>
                    <span style={{ fontSize: '15px', color: '#8B9BBE' }}>Blogs: <strong style={{ color: '#fff', marginLeft: 6, fontSize: '16px' }}>{metrics[college.id]?.blogs || 0}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {colleges.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#8B9BBE', background: '#1a2235', borderRadius: 24, border: '1px dashed rgba(56,189,248,0.2)' }}>
            <Target size={48} color="rgba(56,189,248,0.2)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 8, fontFamily: 'Sora', fontWeight: 600 }}>No Colleges Registered</h3>
            <p>Generate your first QR code above to start the campaign.</p>
          </div>
        )}
      </div>
    </div>
  );
}
