import React, { createContext, useContext, useState } from 'react';
import { Snackbar } from 'react-native-paper';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showToast = (msg) => {
    setMessage(msg);
    setVisible(true);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
      >
        {message}
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
