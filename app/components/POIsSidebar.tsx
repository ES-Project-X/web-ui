import { getDistanceFrom } from "../utils/functions";
import { POI } from "../structs/poi";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import Cookies from "js-cookie";
import { URL_API } from "../utils/constants";
import { padTo2Digits } from "../utils/time";
// import LineChart from "react-linechart";

const TOKEN = Cookies.get("COGNITO_TOKEN");

const POIsSidebar = ({
    isLoggedIn,
    selectedPOI,
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
    hideCard,
}: {
    isLoggedIn: boolean;
    selectedPOI: POI;
    ratingPositive: number;
    setRatingPositive: Function;
    ratingNegative: number;
    setRatingNegative: Function;
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
    hideCard: () => void;
}) => {

    const [closeEnough, setCloseEnough] = useState(false);
    const [position, setPosition] = useState(null) as any;

    function getPosition() {
        navigator.geolocation.getCurrentPosition((position) => {
            setPosition({ lat: position.coords.latitude, lon: position.coords.longitude });
        }, (error) => {
            console.log(error);
        },
            { enableHighAccuracy: true, });
        return null;
    }

    useEffect(() => {
        if (isMobile) {
            getPosition();
        }
    }, [selectedPOI]);

    useEffect(() => {
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
    }, [position]);

    function checkIfCanRate() {
        if (isLoggedIn === false) {
            alert("You must be logged in to rate a POI");
            return false;
        }
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

    async function rateExistenceFunction(id: string, existence: boolean) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        };
        const url = new URL(URL_API + "poi/exists");
        let body = {
            id: id,
            rating: existence,
        };
        return fetch(url.toString(), {
            headers,
            method: "PUT",
            body: JSON.stringify(body),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.time === -1) {
                    window.alert("You cannot rate a POI that you created");
                    return false;
                }
                else if (data.time === 0) {
                    return true;
                } else {
                    // covert seconds in 00h00m00s
                    let seconds = data.time;
                    let minutes = Math.floor(seconds / 60);
                    let hours = Math.floor(minutes / 60);
                    seconds = seconds % 60;
                    minutes = minutes % 60;
                    let time = `${padTo2Digits(hours)}h${padTo2Digits(
                        minutes
                    )}m${padTo2Digits(seconds)}s`;
                    window.alert(
                        "You have already rated this POI, please wait " +
                        time +
                        " to rate again"
                    );
                    return false;
                }
            })
            .catch(() => {
                return false;
            });
    }

    function rateStatusFunction(id: string, status: boolean) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        };
        const url = new URL(URL_API + "poi/status");
        let body = {
            id: id,
            status: status,
        };
        return fetch(url.toString(), {
            headers,
            method: "PUT",
            body: JSON.stringify(body),
        });
    }

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    async function handleClick(rate: boolean) {
        if (!checkIfCanRate()) {
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
        if (!checkIfCanRate()) {
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
                        <button className="close-button" onClick={hideCard}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                            </svg>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-600">
                                        <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                                    </svg>

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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                                        <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                                    </svg>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600">
                                        <path d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218C7.74 15.724 7.366 15 6.748 15H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 13.773c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 01-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227z" />
                                    </svg>

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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                                        <path d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218C7.74 15.724 7.366 15 6.748 15H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 13.773c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 01-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227z" />
                                    </svg>
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
                    <button className="close-button" data-testid="close-button" onClick={hideCard}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                        </svg>
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
        <div className="card p-3">
            <div className="sidebar" data-testid="poi-sidebar" id="poi-sidebar">
                {showDetails ? displayDetails : displayMainContent}
            </div>
        </div>
    );
};

export default POIsSidebar;
