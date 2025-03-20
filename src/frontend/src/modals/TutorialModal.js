// displays a tutorial on how to use the map (pretty self explanatory tbh lol)
function TutorialModal({ setIsTutorialOpen }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-[90%] max-w-lg p-6 bg-white rounded-lg shadow-lg">
                <button
                    onClick={() => setIsTutorialOpen(false)}
                    className="absolute flex items-center justify-center w-8 h-8 text-gray-700 bg-gray-200 rounded-full top-2 right-2 hover:bg-gray-300"
                    aria-label="Close"
                >
                    ✕
                </button>
                <h2 className="mb-6 text-xl font-bold text-gray-800">
                    How to Use the Map
                </h2>
                <ol className="mb-4 space-y-3 text-sm text-gray-700 list-decimal list-inside">
                    <li>
                        <strong>Select the First Pin:</strong> Click on the map
                        to select your starting point.
                    </li>
                    <li>
                        <strong>Select the Second Pin:</strong> Click on another
                        pin to choose your destination.
                    </li>
                    <li>
                        <strong>Click "Start":</strong> The system will
                        calculate and display the path.
                    </li>
                </ol>
                <p className="mb-4 text-sm text-gray-600">
                    Use the <strong>Toggle Graph</strong> button to show or hide
                    the connections between pins. Navigate around the map to
                    explore the wonders of Skyrim!
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={() => setIsTutorialOpen(false)}
                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Got It!
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TutorialModal;
