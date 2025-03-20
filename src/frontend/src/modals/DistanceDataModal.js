// displays information on how map weights were calculated
function DistanceDataModal({ setIsDistanceDataOpen }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-[95%] max-w-4xl p-8 bg-white rounded-lg shadow-lg">
                <button
                    onClick={() => setIsDistanceDataOpen(false)}
                    className="absolute flex items-center justify-center w-8 h-8 text-gray-700 bg-gray-200 rounded-full top-2 right-2 hover:bg-gray-300"
                    aria-label="Close"
                >
                    ✕
                </button>
                <h2 className="mb-6 text-2xl font-bold text-gray-800">
                    How We Calculated Map Weights
                </h2>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* explanatory text */}
                    <div>
                        <p className="mb-4 text-sm leading-6 text-gray-700">
                            To ensure accuracy, we based our walking distance
                            calculations on detailed resources and tools. These
                            included:
                        </p>
                        <ul className="mb-6 space-y-3 text-sm text-gray-700 list-disc list-inside">
                            <li>
                                <a
                                    href="https://nuwanders.tumblr.com/post/686409262446051328/i-made-this-map-of-skyrim-travel-times-to-help"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                >
                                    Skyrim Interactive Map
                                </a>
                                : The map from this tumblr post provided us with
                                detailed walking distances and travel times
                                between locations.
                            </li>
                            <li>
                                We also used other interactive maps /
                                fan-created tools with extensive data on
                                Skyrim's in-game terrain and routes to ensure
                                distances were accurate.
                            </li>
                            <li>
                                Our team members then made manual adjustments
                                based on in-game testing and exploration to
                                fine-tune distances.
                            </li>
                        </ul>
                        <p className="mb-6 text-sm text-gray-700">
                            Combining these resources allowed us to create an
                            accurate and reliable system for accurate
                            pathfinding and travel times.
                        </p>
                    </div>
                    {/* map image display */}
                    <div className="flex items-center justify-center">
                        <a
                            href="https://64.media.tumblr.com/8caf532876efcc7a76dd752375e40ba4/f6983c09027f1af7-78/s1280x1920/6c2b489b5a1170ef3f2735322ca132651269e912.png"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src="https://64.media.tumblr.com/8caf532876efcc7a76dd752375e40ba4/f6983c09027f1af7-78/s1280x1920/6c2b489b5a1170ef3f2735322ca132651269e912.png"
                                alt="Skyrim Weighted Map"
                                className="rounded-lg shadow-lg max-h-[70vh]"
                            />
                        </a>
                    </div>
                </div>
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => setIsDistanceDataOpen(false)}
                        className="px-6 py-2 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Got It!
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DistanceDataModal;
