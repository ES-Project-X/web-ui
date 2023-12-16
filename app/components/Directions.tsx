import { Direction } from "../structs/direction";
import { convertMsToTime } from "../utils/time";

export default function DirectionsComponent(
    {
        handleNext,
        handleBefore,
        currentIndex,
        directions,
        closeDirections
    }: {
        handleNext: () => void,
        handleBefore: () => void,
        currentIndex: number,
        directions: Direction[],
        closeDirections: () => void
    }
) {
    return (
        <div className="card p-3">
            <div className="flex items-start">
                <label className="text-xl font-bold">{directions[currentIndex].direction}</label>
                <button className="ml-auto" onClick={closeDirections}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <span>Distance: {directions[currentIndex].distance} m</span>
            <span>Time: {convertMsToTime(directions[currentIndex].duration)}</span>
            {currentIndex < directions.length - 1 && (
                <button
                    id={"next-ins-btn"}
                    onClick={handleNext}
                    className="my-1 btn"
                >
                    Next
                </button>
            )}
            {currentIndex > 0 && (
                <button
                    id={"before-ins-btn"}
                    onClick={handleBefore}
                    className="mt-1 btn"
                >
                    Before
                </button>
            )}
        </div>
    )
}