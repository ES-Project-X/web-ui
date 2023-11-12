import { AiFillCloseCircle, AiFillDislike, AiFillLike } from "react-icons/ai";
import { useState } from "react";

// @ts-ignore
export default function POIsSidebar({
    selectedPOI,
    rateExistenceFunction
}: {
    selectedPOI: any,
    rateExistenceFunction: Function
}) {

    if (!selectedPOI) return;

    const [ratingPositive, setRatingPositive] = useState(selectedPOI.rating_positive);
    const [ratingNegative, setRatingNegative] = useState(selectedPOI.rating_negative);

    const hideCard = () => {
        document.getElementById("poi-sidebar")?.style.setProperty("display", "none");
    }

    function handleClick(rate: boolean) {
        if (selectedPOI.rate === undefined) {
            rateExistenceFunction(selectedPOI.id, rate);
            if (rate) {
                setRatingPositive(ratingPositive + 1);
            }
            else {
                setRatingNegative(ratingNegative + 1);
            }
        }
        else {
            if (rate !== selectedPOI.rate && rateExistenceFunction(selectedPOI.id, rate)) {
                if (rate) {
                    setRatingPositive(ratingPositive + 1);
                    setRatingNegative(ratingNegative - 1);
                }
                else {
                    setRatingNegative(ratingNegative + 1);
                    setRatingPositive(ratingPositive - 1);
                }
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
                        <button className="bg-green-600 p-3 rounded flex flex-row items-center grow justify-center " onClick={() => {handleClick(true)}}><AiFillLike color="white" />
                            <span className="text-white ml-3">{ratingPositive}</span>
                        </button>
                        <button className="bg-red-600 p-3 rounded flex flex-row items-center grow justify-center" onClick={() => {handleClick(false)}}><AiFillDislike color="white" />
                            <span className="text-white ml-3">{ratingNegative}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

};

