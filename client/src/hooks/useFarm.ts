// hooks/useFarm.ts
import { useAppSelector, useAppDispatch } from './redux';
import { 
  createFarm, 
  getMyFarms, 
  getFarmById, 
  updateFarm, 
  getVerificationStatus,
  getPendingFarms,
  verifyFarm,
  rejectFarm,
  clearError,
  clearCurrentFarm
} from '../store/slices/farm/farmSlice';
import { useCallback } from 'react';
import type { CreateFarmData, UpdateFarmData } from '../types/farm';

export const useFarm = () => {
  const dispatch = useAppDispatch();
  const { farms, currentFarm, pendingFarms, loading, error, verificationStatus } = useAppSelector((state) => state.farm);

  // Farmer actions
  const createFarmAction = useCallback((farmData: CreateFarmData) => 
    dispatch(createFarm(farmData)), [dispatch]);
  
  const getMyFarmsAction = useCallback(() => 
    dispatch(getMyFarms()), [dispatch]);
  
  const getFarmByIdAction = useCallback((farmId: string) => 
    dispatch(getFarmById(farmId)), [dispatch]);
  
  const updateFarmAction = useCallback((farmId: string, farmData: UpdateFarmData) => 
    dispatch(updateFarm({ farmId, farmData })), [dispatch]);
  
  const getVerificationStatusAction = useCallback((farmId: string) => 
    dispatch(getVerificationStatus(farmId)), [dispatch]);

  // Admin actions
  const getPendingFarmsAction = useCallback(() => 
    dispatch(getPendingFarms()), [dispatch]);
  
  const verifyFarmAction = useCallback((farmId: string) => 
    dispatch(verifyFarm(farmId)), [dispatch]);
  
  const rejectFarmAction = useCallback((farmId: string, rejectionReason: string) => 
    dispatch(rejectFarm({ farmId, rejectionReason })), [dispatch]);

  const clearErrorAction = useCallback(() => 
    dispatch(clearError()), [dispatch]);
  
  const clearCurrentFarmAction = useCallback(() => 
    dispatch(clearCurrentFarm()), [dispatch]);

  return {
    // State
    farms,
    currentFarm,
    pendingFarms,
    loading,
    error,
    verificationStatus,
    
    // Farmer Actions
    createFarm: createFarmAction,
    getMyFarms: getMyFarmsAction,
    getFarmById: getFarmByIdAction,
    updateFarm: updateFarmAction,
    getVerificationStatus: getVerificationStatusAction,
    
    // Admin Actions
    getPendingFarms: getPendingFarmsAction,
    verifyFarm: verifyFarmAction,
    rejectFarm: rejectFarmAction,
    
    // Utility Actions
    clearError: clearErrorAction,
    clearCurrentFarm: clearCurrentFarmAction,
  };
};