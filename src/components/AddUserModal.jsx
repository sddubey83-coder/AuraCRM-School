import React, { useState } from 'react';
import axios from 'axios';

const AddUserModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({ email: '', password: '', role: 'Staff' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Yahan apna backend URL dalo
            const res = await axios.post('https://your-api-url.com/add-user', formData);
            alert("Bhai, User ban gaya!");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Lafda ho gaya: " + err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-[#1a1c23] p-6 rounded-lg border border-gray-700 w-96">
                <h2 className="text-white text-xl mb-4 font-bold">Add New Demo User</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email" placeholder="Email"
                        className="w-full p-2 mb-3 bg-gray-800 text-white border border-gray-600 rounded"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <input
                        type="password" placeholder="Password"
                        className="w-full p-2 mb-3 bg-gray-800 text-white border border-gray-600 rounded"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <select
                        className="w-full p-2 mb-4 bg-gray-800 text-white border border-gray-600 rounded"
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="Staff">Staff</option>
                        <option value="Admin">Admin</option>
                    </select>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="text-gray-400">Cancel</button>
                        <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white font-bold hover:bg-blue-700">
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;