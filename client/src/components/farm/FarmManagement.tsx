// components/farm/FarmManagement.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MyFarmsList from './MyFarmsList';
import CreateFarmForm from './CreateFarmForm';
import FarmDetails from './FarmDetials';
import EditFarmForm from './EditFarmForm';

const FarmManagement: React.FC = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MyFarmsList />} />
        <Route path="/create" element={<CreateFarmForm />} />
        <Route path="/:id" element={<FarmDetails />} />
        <Route path="/:id/edit" element={<EditFarmForm />} />
        <Route path="*" element={<Navigate to="/dashboard/farms" replace />} />
      </Routes>
    </div>
  );
};

export default FarmManagement;