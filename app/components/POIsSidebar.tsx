import { getDistanceFrom } from "../utils/functions";
import { POI } from "../structs/poi";
import { SetStateAction, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import Cookies from "js-cookie";
import { URL_API } from "../utils/constants";
import { padTo2Digits } from "../utils/time";
import { Coordinate } from "../structs/SearchComponent";
// import { LineChart } from "react-linechart";

const TOKEN = Cookies.get("COGNITO_TOKEN");

const POIsSidebar = ({
  isLoggedIn,
  selectedPOI,
  ratingPositive,
  setRatingPositive,
  ratingNegative,
  setRatingNegative,
  hideCard,
  showDetails,
  setShowDetails,
  getPosition,
}: {
    isLoggedIn: boolean;
    selectedPOI: POI;
    ratingPositive: number;
    setRatingPositive: (ratingPositive: number) => void;
    ratingNegative: number;
    setRatingNegative: (ratingNegative: number) => void;
    hideCard: () => void;
    showDetails: boolean;
    setShowDetails: (showDetails: boolean) => void;
    getPosition: (callback: (position: Coordinate) => void) => void;
}) => {
    const [closeEnough, setCloseEnough] = useState(false);
    const [position, setPosition] = useState<Coordinate>();
    const [selectedTimePeriod, setSelectedTimePeriod] = useState("today");
    const [showData, setShowData] = useState<string>("");
    const [fullData, setFullData] = useState<any>({});

  const [existsClicked, setExistsClicked] = useState(false);
  const [fakeNewsClicked, setFakeNewsClicked] = useState(false);

    const [sign, setSign] = useState("");
    const [colorClass, setColorClass] = useState("");

    const [currentLocation, setCurrentLocation] = useState<Coordinate>();

    useEffect(() => {
        if (isMobile) {
            getPosition(setCurrentLocation);
        }
    }, [selectedPOI]);

    useEffect(() => {
        if (currentLocation) {
            setPosition(currentLocation);
        }
    }, [currentLocation]);

    useEffect(() => {
        if (position) {
            const distance = getDistanceFrom({
                currentLocation: {
                    latitude: position.getLat(),
                    longitude: position.getLng(),
                },
                point: selectedPOI,
            });
            if (distance < 50) {
                setCloseEnough(true);
            } else {
                alert(distance)
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
    if (!showDetails) {
      fetch(URL_API + "poi/status/" + selectedPOI.id, {
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setFullData(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
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
        setExistsClicked(true);
      } else {
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

  useEffect(() => {
    const balance = fullData[selectedTimePeriod];
    setShowData(balance);
    if (balance > 0) {
      setSign("+");
      setColorClass("text-green-600");
    } else if (balance < 0) {
      setSign("-");
      setColorClass("text-red-600");
    } else {
      setSign("");
      setColorClass("text-black");
    }
  }, [selectedTimePeriod, fullData]);

  const duplicatedSVG = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
    >
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
        clipRule="evenodd"
      />
    </svg>
  );

  const displayMainContent = (
    <div className="main-content" style={{ width: 250 }}>
      <div className="sidebar-body">
        <div className="sidebar-body-item">
          <div className={"flex justify-end pb-2"}>
            <button className="close-button" onClick={hideCard}>
              {duplicatedSVG}
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
          <h2 className="mt-2 font-semibold text-lg">{selectedPOI.name}</h2>
          <h5 className="uppercase text-base">{selectedPOI.type}</h5>
          <p className="my-2">{selectedPOI.description}</p>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-green-600"
                  >
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-white"
                  >
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-red-600"
                  >
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-white"
                  >
                    <path d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218C7.74 15.724 7.366 15 6.748 15H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 13.773c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.959 8.959 0 01-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227z" />
                  </svg>
                  <span className="text-white ml-3">{ratingNegative}</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="text-center">
          <button
            className="show-details underline mt-2"
            onClick={toggleDetails}
          >
            Show Details
          </button>
        </div>
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

  const buttonStyle = {
    border: "none",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "black",
  };

  const selectedButtonStyle = {
    ...buttonStyle,
    backgroundColor: "green",
    color: "white",
  };

  const displayDetails = (
    <div className="additional-details text-center" style={{ width: 250 }}>
      {/* Display detailed view */}
      <div className="detailed-view">
        <div className={"flex justify-end pb-2"}>
          <button
            className="close-button"
            data-testid="close-button"
            onClick={hideCard}
          >
            {duplicatedSVG}
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
        <h2 className="mt-2 font-semibold text-lg">{selectedPOI.name}</h2>
        <div className="flex flex-col items-center">
          <div
            className={`justify-center mt-2 font-bold text-3xl ${colorClass}`}
          >
            {`${sign}${showData}`}
          </div>
          <span>{"(balance)"}</span>
        </div>
        <div className="time-period-buttons mt-2">
          <button
            style={
              selectedTimePeriod === "today" ? selectedButtonStyle : buttonStyle
            }
            onClick={() => handleTimePeriodChange("today")}
          >
            Today
          </button>
          {" | "}
          <button
            style={
              selectedTimePeriod === "yesterday"
                ? selectedButtonStyle
                : buttonStyle
            }
            onClick={() => handleTimePeriodChange("yesterday")}
          >
            Yesterday
          </button>
          {" | "}
          <button
            style={
              selectedTimePeriod === "7_days"
                ? selectedButtonStyle
                : buttonStyle
            }
            onClick={() => handleTimePeriodChange("7_days")}
          >
            7 Days
          </button>
        </div>
        <div className="time-period-buttons mb-2">
          <button
            style={
              selectedTimePeriod === "1_month"
                ? selectedButtonStyle
                : buttonStyle
            }
            onClick={() => handleTimePeriodChange("1_month")}
          >
            1 Month
          </button>
          |{" "}
          <button
            style={
              selectedTimePeriod === "all_time"
                ? selectedButtonStyle
                : buttonStyle
            }
            onClick={() => handleTimePeriodChange("all_time")}
          >
            All Time
          </button>
        </div>
        {selectedPOI.rate ? (
          <div className="rate-status-buttons flex">
            {selectedPOI.status ? (
              <span>
                You have already rated this POI! Try again in the next day.
              </span>
            ) : (
              <>
                <button
                  className="btn btn-success w-1/2 mx-1"
                  style={buttonStyleExists}
                  onClick={() => handleClickStatus(true)}
                >
                  Available
                </button>
                <button
                  className="btn btn-error w-1/2 mx-1"
                  style={buttonStyleFakeNews}
                  onClick={() => handleClickStatus(false)}
                >
                  Not Available
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div
              className="rate-status-buttons text-red-600"
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                paddingTop: "20px",
              }}
            >
              Must rate its existence first!
            </div>
          </>
        )}
      </div>

      <button className="show-details underline mt-2" onClick={toggleDetails}>
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
