import { useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

export default function MigrateData() {
    const migrate = async () => {
        const token = localStorage.getItem('aura_token');
        const headers = { Authorization: `Bearer ${token}` };

        // Firebase se leads fetch karo
        const snapshot = await getDocs(collection(db, 'leads'));
        let success = 0, failed = 0;

        for (const doc of snapshot.docs) {
            const data = doc.data();
            try {
                await axios.post(`${API}/api/migrate/lead`, {
                    firebase_id: doc.id,
                    student_name: data.student_name,
                    parent_phone: data.parent_phone,
                    source: data.source,
                    status: data.status,
                    branch: data.branch,
                }, { headers });
                success++;
            } catch { failed++; }
        }
        alert(`✅ Migration Done! Success: ${success}, Failed: ${failed}`);
    };

    return (
        <div style={{ padding: 40 }}>
            <h2>Firebase → Supabase Migration</h2>
            <button onClick={migrate} style={{ padding: '14px 28px', background: '#4e8ef7', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>
                🚀 Migrate Firebase Leads → Supabase
            </button>
        </div>
    );
}