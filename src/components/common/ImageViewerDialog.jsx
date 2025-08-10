import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * A simple dialog component to display an enlarged image.
 * @param {object} props - The component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {Function} props.onClose - Function to call when the dialog should close.
 * @param {string} props.imageUrl - The URL of the image to display.
 */
const ImageViewerDialog = ({ open, onClose, imageUrl }) => {
  if (!imageUrl) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
          },
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' }}>
        <img 
          src={imageUrl} 
          alt="Enlarged view" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '90vh', 
            objectFit: 'contain' 
          }} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerDialog;
