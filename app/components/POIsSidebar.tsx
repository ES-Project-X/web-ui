import { AiFillCloseCircle, AiFillDislike, AiFillLike } from "react-icons/ai";

// @ts-ignore
const POIsSidebar = ({
    selectedPOI,
    rateExistenceFunction,
    ratingPositive,
    setRatingPositive,
    ratingNegative,
    setRatingNegative
}: {
    selectedPOI: any,
    rateExistenceFunction: Function
    ratingPositive: number,
    setRatingPositive: Function,
    ratingNegative: number,
    setRatingNegative: Function
}) => {

    if (!selectedPOI) return;

    const hideCard = () => {
        document.getElementById("poi-sidebar")?.style.setProperty("display", "none");
    }

    async function handleClick(rate: boolean) {
        if (selectedPOI.rate === null) {
            rateExistenceFunction(selectedPOI.id, rate);
            if (rate) {
                setRatingPositive(ratingPositive + 1);
            }
            else {
                setRatingNegative(ratingNegative + 1);
            }
            selectedPOI.rate = rate;
        }
        else {
            if (rate !== selectedPOI.rate) {
                if (await rateExistenceFunction(selectedPOI.id, rate)) {
                    if (rate) {
                        setRatingPositive(ratingPositive + 1);
                        setRatingNegative(ratingNegative - 1);
                    }
                    else {
                        setRatingNegative(ratingNegative + 1);
                        setRatingPositive(ratingPositive - 1);
                    }
                    selectedPOI.rate = rate;
                }
            } else {
                alert("You new rate is the same as the previous one");
            }
        }
    }

    return (
        <div className="sidebar" data-testid="poi-sidebar" id="poi-sidebar">
            <div className="sidebar-body">
                <div className="sidebar-body-item">
                    <div className={"flex justify-end pb-2"}>
                        <button className="close-button" data-testid="close-button"><AiFillCloseCircle onClick={() => { hideCard() }} />
                        </button></div>
                    <div style={{ width: "300px", height: "300px", overflow: "cover", display: "flex", alignItems: "center" }}>
                        <img style={{ width: "100%", height: "auto" }} className="w-fit rounded-xl" src={selectedPOI.picture_url} alt="poi_image" />
                    </div>
                    <h2 className="mt-4">{selectedPOI.name}</h2>
                    <h5>{selectedPOI.type}</h5>
                    <p className="mt-8">{selectedPOI.description}</p>
                    <div className="flex flex-row gap-3">
                        {selectedPOI.rate ?
                            <>
                                <button style={{borderWidth: "2px", borderStyle: "solid"}} className={"bg-white border-green-600 p-3 rounded flex flex-row items-center grow justify-center"} onClick={() => { handleClick(true) }}>
                                    <AiFillLike color="green" />
                                    <span className="text-green-600 ml-3">{ratingPositive}</span>
                                </button>
                            </>
                            :
                            <>
                                <button style={{borderWidth: "2px", borderStyle: "solid"}}  className={"bg-green-600 p-3 rounded flex flex-row items-center grow justify-center"} onClick={() => { handleClick(true) }}>
                                    <AiFillLike color="white" />
                                    <span className="text-white ml-3">{ratingPositive}</span>
                                </button>
                            </>
                        }
                        {selectedPOI.rate === false ?
                            <>
                                <button style={{borderWidth: "2px", borderStyle: "solid"}} className="bg-white border-red-600 p-3 rounded flex flex-row items-center grow justify-center" onClick={() => { handleClick(false) }}>
                                    <AiFillDislike color="red" /> 
                                    <span className="text-red-600 ml-3">{ratingNegative}</span>
                                </button>
                            </>
                            :
                            <>
                                <button style={{borderWidth: "2px", borderStyle: "solid"}} className="bg-red-600 p-3 rounded flex flex-row items-center grow justify-center" onClick={() => { handleClick(false) }}>
                                    <AiFillDislike color="white" />
                                    <span className="text-white ml-3">{ratingNegative}</span>
                                </button>
                            </>
                        }
                    </div>
                </div>
            </div>
        </div>
    );

};

export default POIsSidebar;
