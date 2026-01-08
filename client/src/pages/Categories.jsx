import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

export default function Categories() {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const { data } = await api.get('/categories');
        setCategories(data);
    };

    const handleDelete = async (id) => {
        if (confirm('Delete category?')) {
            await api.delete(`/categories/${id}`);
            loadData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', formData);
            setShowModal(false);
            setFormData({ name: '', description: '' });
            loadData();
        } catch (err) { alert(err.response?.data?.error); }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Categories</h1>
                {user.role === 'admin' && (
                    <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add Category
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {categories.map(c => (
                    <div key={c.id} className="card relative group">
                        <h3 className="font-bold text-lg mb-2">{c.name}</h3>
                        <p className="text-gray-500 text-sm mb-4">{c.description || 'No description'}</p>
                        <div className="text-sm font-medium bg-gray-100 inline-block px-2 py-1 rounded">
                            {c.Products?.length || 0} Products
                        </div>
                        {user.role === 'admin' && (
                            <button className="absolute top-4 right-4 text-red-400 hover:text-red-600" onClick={() => handleDelete(c.id)}>
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                        <h2 className="text-xl font-bold mb-4">Add Category</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input placeholder="Name" className="input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <textarea placeholder="Description" className="input" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" className="btn" style={{ background: '#f3f4f6' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
