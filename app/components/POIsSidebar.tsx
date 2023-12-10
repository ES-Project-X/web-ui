import { AiFillCloseCircle, AiFillDislike, AiFillLike } from "react-icons/ai";
import { getDistanceFrom } from "../utils/functions";
import { POI } from "../structs/poi";
import { SetStateAction, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import Cookies from "js-cookie";
import { URL_API } from "../utils/constants";
import { padTo2Digits } from "../utils/time";
import LineChart from "react-linechart";

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
}) => {
  const [closeEnough, setCloseEnough] = useState(false);
  const [position, setPosition] = useState(null) as any;

  function getPosition() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.log(error);
      },
      { enableHighAccuracy: true }
    );
    return null;
  }

  useEffect(() => {
    if (isMobile) {
      getPosition();
    }
  }, [selectedPOI]);

  useEffect(() => {
    if (position) {
      const distance = getDistanceFrom({
        currentLocation: position,
        point: selectedPOI,
      });
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
        } else if (data.time === 0) {
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

  const hideCard = () => {
    document
      .getElementById("poi-sidebar")
      ?.style.setProperty("display", "none");
    setShowDetails(false);
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

  const data = [
    {
      color: "steelblue",
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 },
      ],
    },
  ];

  const data2 = [
    {
      color: "red",
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 5 },
        { x: 7, y: -3 },
      ],
    },
  ];

  const data3 = [
    {
      color: "green",
      points: [
        { x: 1, y: 2 },
        { x: 3, y: -3 },
        { x: 7, y: -5 },
      ],
    },
  ];

  const [selectedTimePeriod, setSelectedTimePeriod] = useState("7 days"); // Default
  let graphData;
  switch (selectedTimePeriod) {
    case "7 days":
      graphData = data;
      break;
    case "1 month":
      graphData = data2;
      break;
    case "all time":
      graphData = data3;
      break;
    default:
      graphData = data;
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

  const handleTimePeriodChange = (period: SetStateAction<string>) => {
    setSelectedTimePeriod(period);
  };

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
              <LineChart width={400} height={210} data={graphData} />
              <p> Graph goes here </p>
            </div>
          </div>
        </div>
        <div className="time-period-buttons mt-4">
          <button
            className={`time-period-button ${
              selectedTimePeriod === "7 days" ? "active" : ""
            }`}
            onClick={() => handleTimePeriodChange("7 days")}
            style={{
              marginRight: "8px",
              backgroundColor:
                selectedTimePeriod === "7 days" ? "blue" : "transparent",
              color: selectedTimePeriod === "7 days" ? "white" : "black",
            }} // Add colors for selected button
          >
            7 Days
          </button>
          <button
            className={`time-period-button ${
              selectedTimePeriod === "1 month" ? "active" : ""
            }`}
            onClick={() => handleTimePeriodChange("1 month")}
            style={{
              marginRight: "8px",
              backgroundColor:
                selectedTimePeriod === "1 month" ? "green" : "transparent",
              color: selectedTimePeriod === "1 month" ? "white" : "black",
            }} // Add colors for selected button
          >
            1 Month
          </button>
          <button
            className={`time-period-button ${
              selectedTimePeriod === "all time" ? "active" : ""
            }`}
            onClick={() => handleTimePeriodChange("all time")}
            style={{
              backgroundColor:
                selectedTimePeriod === "all time" ? "red" : "transparent",
              color: selectedTimePeriod === "all time" ? "white" : "black",
            }} // Add colors for selected button
          >
            All Time
          </button>
        </div>

        {selectedPOI.rate ? (
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
                    Available
                  </button>
                  <button
                    className="btn btn-error"
                    style={buttonStyleFakeNews}
                    onClick={() => handleClickStatus(false)}
                  >
                    Not Available
                  </button>
                </>
              )}
            </div>
          </>
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
