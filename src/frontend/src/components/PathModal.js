import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
} from '@mui/material';

// displays pathfinding results in a modal dialog
const PathModal = ({
    open,
    onClose,
    optimalPath = [],
    alternativePath = [],
    loading = false,
    currentMap,
}) => {
    // get appropriate loading message based on map size
    const getLoadingMessage = () => {
        const mapSize = parseInt(currentMap);
        if (mapSize >= 50000) {
            return 'Finding the best route... This is a very large map and may take several minutes';
        }
        if (mapSize >= 1000) {
            return 'Finding the best route... This is a large map and may take up to a minute';
        }
        return 'Finding the best route...';
    };

    // render path information
    const PathInfo = ({ title, path, bgColor }) => (
        <div>
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <div className={`p-3 ${bgColor} rounded`}>{path.join(' → ')}</div>
            <p className="mt-1 text-sm text-gray-600">
                Length: {path.length - 1} hops
            </p>
        </div>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="path-results-title"
        >
            <DialogTitle id="path-results-title">Path Results</DialogTitle>

            <DialogContent>
                {loading ? (
                    <div className="flex flex-col justify-center items-center p-8 space-y-4">
                        <CircularProgress />
                        <p className="text-sm text-center text-gray-600">
                            {getLoadingMessage()}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <PathInfo
                            title="Optimal Path"
                            path={optimalPath}
                            bgColor="bg-green-50"
                        />

                        {alternativePath?.length > 0 && (
                            <PathInfo
                                title="Alternative Path"
                                path={alternativePath}
                                bgColor="bg-yellow-50"
                            />
                        )}
                    </div>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PathModal;
