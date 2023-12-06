import { AiFillCloseCircle, AiFillDislike, AiFillLike } from "react-icons/ai";
import { getDistanceFrom } from "../utils/getDistanceFrom";
import { POI } from "../structs/poi";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
// import LineChart from "react-linechart";

const POIsSidebar = ({
    selectedPOI,
    rateExistenceFunction,
    rateStatusFunction,
    ratingPositive,
    setRatingPositive,
    ratingNegative,
    setRatingNegative,
    ratingPositiveStat,
    setRatingPositiveStat,
    ratingNegativeStat,
    setRatingNegativeStat,
    existsClicked,
    setExistsClicked,
    fakeNewsClicked,
    setFakeNewsClicked,
    showDetails,
    setShowDetails,
}: {
    selectedPOI: POI;
    rateExistenceFunction: Function;
    ratingPositive: number;
    setRatingPositive: Function;
    ratingNegative: number;
    setRatingNegative: Function;
    rateStatusFunction: Function;
    ratingPositiveStat: number;
    setRatingPositiveStat: Function;
    ratingNegativeStat: number;
    setRatingNegativeStat: Function;
    existsClicked: boolean;
    setExistsClicked: Function;
    fakeNewsClicked: boolean;
    setFakeNewsClicked: Function;
    showDetails: boolean;
    setShowDetails: Function;
}) => {

    const [closeEnough, setCloseEnough] = useState(false);

    function getPosition() {
        navigator.geolocation.getCurrentPosition((position) => {
            return {lat: position.coords.latitude, lon: position.coords.longitude};
        }, (error) => {
            console.log(error);
        },
        { enableHighAccuracy: true, });
        return null;
    }

    useEffect(() => {
        if (isMobile !== true){
            return;
        }
        const position = getPosition();
        if (position) {
            const distance = getDistanceFrom(
                {
                    currentLocation: position,
                    point: selectedPOI,
                }
            );
            if (distance < 50) {
                setCloseEnough(true);
            } else {
                setCloseEnough(false);
            }
        }
    }, [selectedPOI]);

    function checkIfCloseEnough() {
        if (isMobile !== true) {
            alert("You must be using a mobile device to rate a POI");
            return false;
        }
        if (closeEnough === undefined) {
            alert("You must allow the browser to access your location");
            return false;
        }
        if (!closeEnough) {
            alert("You must be close enough to the POI to rate it");
            return false;
        }
        return true;
    }

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    const hideCard = () => {
        document
            .getElementById("poi-sidebar")
            ?.style.setProperty("display", "none");
        setShowDetails(false);
    };

    async function handleClick(rate: boolean) {
        if (!checkIfCloseEnough()) {
            return;
        }
        if (selectedPOI.rate === null) {
            rateExistenceFunction(selectedPOI.id, rate);
            if (rate) {
                setRatingPositive(ratingPositive + 1);
            } else {
                setRatingNegative(ratingNegative + 1);
            }
            selectedPOI.rate = rate;
        } else {
            if (rate !== selectedPOI.rate) {
                if (await rateExistenceFunction(selectedPOI.id, rate)) {
                    if (rate) {
                        setRatingPositive(ratingPositive + 1);
                        setRatingNegative(ratingNegative - 1);
                    } else {
                        setRatingNegative(ratingNegative + 1);
                        setRatingPositive(ratingPositive - 1);
                    }
                    selectedPOI.rate = rate;
                    alert("You have successfully rated this POI!");
                }
            } else {
                alert("You new rate is the same as the previous one");
            }
        }
    }

    async function handleClickStatus(sx: boolean) {
        if (!checkIfCloseEnough()) {
            return;
        }
        if (selectedPOI.rate === true && selectedPOI.status === false) {
            if (sx) {
                setRatingPositiveStat(ratingPositiveStat + 1);
                setExistsClicked(true);
            } else {
                setRatingNegativeStat(ratingNegativeStat - 1);
                setFakeNewsClicked(true);
            }
            await rateStatusFunction(selectedPOI.id, sx);
            selectedPOI.status = true;
            alert("You have successfully rated this POI!");
        } else if (selectedPOI.rate === true && selectedPOI.status === true) {
            alert("You have already rated this POI! Try again tomorrow.");
        } else {
            alert("You must rate its existence first!");
        }
    }

    const displayMainContent = (
        <div className="main-content text-center">
            <div className="sidebar-body">
                <div className="sidebar-body-item">
                    <div className={"flex justify-end pb-2"}>
                        <button className="close-button" data-testid="close-button">
                            <AiFillCloseCircle
                                onClick={() => {
                                    hideCard();
                                }}
                            />
                        </button>
                    </div>
                    <div
                        style={{
                            width: "250px",
                            height: "250px",
                            overflow: "cover",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <img
                            style={{ height: "100%", objectFit: "cover" }}
                            className="w-fit rounded-xl"
                            src={selectedPOI.picture_url}
                            alt="poi_image"
                        />
                    </div>
                    <h2 className="mt-4">{selectedPOI.name}</h2>
                    <h5>{selectedPOI.type}</h5>
                    <p className="mt-8">{selectedPOI.description}</p>
                    <div className="flex flex-row gap-3">
                        {selectedPOI.rate ? (
                            <>
                                <button
                                    style={{ borderWidth: "2px", borderStyle: "solid" }}
                                    className={
                                        "bg-white border-green-600 p-3 rounded flex flex-row items-center grow justify-center"
                                    }
                                    onClick={() => {
                                        handleClick(true);
                                    }}
                                >
                                    <AiFillLike color="green" />
                                    <span className="text-green-600 ml-3">{ratingPositive}</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    style={{ borderWidth: "2px", borderStyle: "solid" }}
                                    className={
                                        "bg-green-600 p-3 rounded flex flex-row items-center grow justify-center"
                                    }
                                    onClick={() => {
                                        handleClick(true);
                                    }}
                                >
                                    <AiFillLike color="white" />
                                    <span className="text-white ml-3">{ratingPositive}</span>
                                </button>
                            </>
                        )}
                        {selectedPOI.rate === false ? (
                            <>
                                <button
                                    style={{ borderWidth: "2px", borderStyle: "solid" }}
                                    className="bg-white border-red-600 p-3 rounded flex flex-row items-center grow justify-center"
                                    onClick={() => {
                                        handleClick(false);
                                    }}
                                >
                                    <AiFillDislike color="red" />
                                    <span className="text-red-600 ml-3">{ratingNegative}</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    style={{ borderWidth: "2px", borderStyle: "solid" }}
                                    className="bg-red-600 p-3 rounded flex flex-row items-center grow justify-center"
                                    onClick={() => {
                                        handleClick(false);
                                    }}
                                >
                                    <AiFillDislike color="white" />
                                    <span className="text-white ml-3">{ratingNegative}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <button className="show-details text-center" onClick={toggleDetails}>
                    Show Details
                </button>
            </div>
        </div>
    );

    const buttonStyleExists = existsClicked
        ? {
            flex: 1,
            backgroundColor: "white",
            border: "2px solid green",
        }
        : { flex: 1 };
    const buttonStyleFakeNews = fakeNewsClicked
        ? {
            flex: 1,
            backgroundColor: "white",
            border: "2px solid red",
        }
        : { flex: 1 };

    const displayDetails = (
        <div className="additional-details text-center">
            {/* Display detailed view */}
            <div className="detailed-view">
                <div className={"flex justify-end pb-2"}>
                    <button className="close-button" data-testid="close-button">
                        <AiFillCloseCircle
                            onClick={() => {
                                hideCard();
                            }}
                        />
                    </button>
                </div>
                <img
                    style={{ height: "160px", objectFit: "cover", margin: "auto" }}
                    className="w-fit rounded-xl"
                    src={selectedPOI.picture_url}
                    alt="poi_image"
                />
                <h2>{selectedPOI.name}</h2>
                <p>{selectedPOI.description}</p>

                {/* Graph */}
                {/* Add your graph component here */}
                <div className="graph">
                    {" "}
                    {/* Added padding top */}
                    <div style={{ maxHeight: "250px", maxWidth: "400px" }}>
                        <div className="App">
                            {/* <LineChart width={400} height={210} data={data} /> */}
                            <p> Graph goes here </p>
                        </div>
                    </div>
                </div>

                {selectedPOI.rate ? (
                    (
                        <>
                            <div
                                className="rate-status-buttons"
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    justifyContent: "center",
                                    paddingTop: "20px",
                                }}
                            >
                                {selectedPOI.status ? (
                                    <p>
                                        {" "}
                                        You have already rated this POI! Try again in the next day.{" "}
                                    </p>
                                ) : (
                                    <>
                                        <button
                                            className="btn btn-success"
                                            style={buttonStyleExists}
                                            onClick={() => handleClickStatus(true)}
                                        >
                                            Exists
                                        </button>
                                        <button
                                            className="btn btn-error"
                                            style={buttonStyleFakeNews}
                                            onClick={() => handleClickStatus(false)}
                                        >
                                            FakeNews
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )
                ) : (
                    <>
                        <div
                            className="rate-status-buttons"
                            style={{
                                display: "flex",
                                gap: "10px",
                                justifyContent: "center",
                                paddingTop: "20px",
                            }}
                        >
                            <p> Must rate its existence first! </p>
                        </div>
                    </>
                )}
            </div>

            <button className="show-details" onClick={toggleDetails}>
                Hide Details
            </button>
        </div>
    );

    return (
        <div className="sidebar" data-testid="poi-sidebar" id="poi-sidebar">
            {showDetails ? displayDetails : displayMainContent}
        </div>
    );
};

export default POIsSidebar;
