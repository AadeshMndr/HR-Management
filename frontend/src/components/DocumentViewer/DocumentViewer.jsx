import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '900px',
    height: '700px',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontSize: '18px',
  fontWeight: 600,
  fontFamily: 'Inter',
  color: '#101828',
  padding: '24px 24px 16px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: '0 24px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: '16px 24px 24px 24px',
  justifyContent: 'flex-end',
}));

/**
 * Document Viewer Modal Component
 * 
 * Props:
 * - open: Boolean to control modal visibility
 * - onClose: Function to close the modal
 * - document: Object containing document data
 *   - documentName: String - Name of the document
 *   - documentFile: String - Base64 encoded file content
 *   - documentExtension: String - File extension
 *   - dateUploaded: String - Upload date
 */
const DocumentViewer = ({ open, onClose, document }) => {
  if (!document) return null;

  const { documentName, documentFile, documentExtension, dateUploaded } = document;

  // Create data URL for the document
  const createDataUrl = () => {
    const mimeTypes = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      svg: 'image/svg+xml',
    };

    const mimeType = mimeTypes[documentExtension?.toLowerCase()] || 'application/octet-stream';
    return `data:${mimeType};base64,${documentFile}`;
  };

  // Handle download
  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = createDataUrl();
    link.download = `${documentName}.${documentExtension}`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  // Render document based on file type
  const renderDocument = () => {
    const dataUrl = createDataUrl();
    const extension = documentExtension?.toLowerCase();

    if (extension === 'pdf') {
      return (
        <Box
          component="iframe"
          src={dataUrl}
          sx={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px',
          }}
          title={documentName}
        />
      );
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) {
      return (
        <Box
          component="img"
          src={dataUrl}
          alt={documentName}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />
      );
    }

    // For other file types (doc, docx, etc.), show a preview message
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          padding: '40px',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '16px',
            fontWeight: 600,
            fontFamily: 'Inter',
            color: '#101828',
            marginBottom: '8px',
          }}
        >
          Preview not available
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            fontWeight: 400,
            fontFamily: 'Inter',
            color: '#475467',
            marginBottom: '24px',
          }}
        >
          This file type cannot be previewed in the browser. Click download to view the document.
        </Typography>
        <Button
          variant="contained"
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
          sx={{
            backgroundColor: '#7F56D9',
            color: 'white',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '14px',
            textTransform: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            '&:hover': {
              backgroundColor: '#6941C6',
            },
          }}
        >
          Download Document
        </Button>
      </Box>
    );
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      aria-labelledby="document-viewer-title"
    >
      <StyledDialogTitle id="document-viewer-title">
        <Stack>
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: 600,
              fontFamily: 'Inter',
              color: '#101828',
            }}
          >
            {documentName}
          </Typography>
          {dateUploaded && (
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 400,
                fontFamily: 'Inter',
                color: '#475467',
              }}
            >
              Uploaded on {new Date(dateUploaded).toLocaleDateString()}
            </Typography>
          )}
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#475467',
            '&:hover': {
              backgroundColor: '#F3F4F6',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <StyledDialogContent>
        {renderDocument()}
      </StyledDialogContent>

      <StyledDialogActions>
        <Button
          onClick={handleDownload}
          startIcon={<DownloadIcon />}
          sx={{
            color: '#7F56D9',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '14px',
            textTransform: 'none',
            borderRadius: '6px',
            padding: '8px 14px',
            '&:hover': {
              backgroundColor: '#F9F5FF',
            },
          }}
        >
          Download
        </Button>
        <Button
          onClick={onClose}
          sx={{
            color: '#344054',
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '14px',
            textTransform: 'none',
            borderRadius: '6px',
            padding: '8px 14px',
            '&:hover': {
              backgroundColor: '#F9FAFB',
            },
          }}
        >
          Close
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default DocumentViewer;
