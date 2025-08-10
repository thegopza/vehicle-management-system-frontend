import { useContext } from 'react';
import SnackbarContext from '../contexts/SnackbarContext';

const useSnackbar = () => {
  return useContext(SnackbarContext);
};

export default useSnackbar;