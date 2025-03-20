import React from 'react';
import PropTypes from 'prop-types';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

// alert wrapper component for consistent styling
const Alert = React.forwardRef((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

Alert.displayName = 'Alert';

// displays temporary notification messages
const NotificationSnackbar = ({
    open,
    onClose,
    message,
    severity = 'success',
    autoHideDuration = 3000,
    anchorOrigin = { vertical: 'bottom', horizontal: 'center' },
}) => (
    <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
    >
        <Alert onClose={onClose} severity={severity}>
            {message}
        </Alert>
    </Snackbar>
);

NotificationSnackbar.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    severity: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
    autoHideDuration: PropTypes.number,
    anchorOrigin: PropTypes.shape({
        vertical: PropTypes.oneOf(['top', 'bottom']),
        horizontal: PropTypes.oneOf(['left', 'center', 'right']),
    }),
};

export default NotificationSnackbar;
