import { useState } from "react";
import { AiFillCloseCircle, AiFillDislike, AiFillLike } from "react-icons/ai";
import LineChart from "react-linechart";

// @ts-ignore
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
}: {
  selectedPOI: any;
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
}) => {
  if (!selectedPOI) return;

  // mock data for graph
  const data = [
    {
      color: "steelblue",
      points: [
        { x: 1, y: 2 },
        { x: 3, y: 5 },
        { x: 7, y: -3 },
      ],
    },
  ];

  const hideCard = () => {
    document
      .getElementById("poi-sidebar")
      ?.style.setProperty("display", "none");
    setShowDetails(false);
  };

  async function handleClick(rate: boolean) {
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
        }
      } else {
        alert("You new rate is the same as the previous one");
      }
    }
  }

  async function handleClickStatus(rate: boolean) {
    if (selectedPOI.status === null) {
      rateStatusFunction(selectedPOI.id, rate);
      if (rate) {
        setRatingPositiveStat(ratingPositiveStat + 1);
      } else {
        setRatingNegativeStat(ratingNegativeStat + 1);
      }
      selectedPOI.status = rate;
    } else {
      if (rate !== selectedPOI.status) {
        if (await rateStatusFunction(selectedPOI.id, rate)) {
          if (rate) {
            setRatingPositiveStat(ratingPositiveStat + 1);
            setRatingNegativeStat(ratingNegativeStat - 1);
          } else {
            setRatingNegativeStat(ratingNegativeStat + 1);
            setRatingPositiveStat(ratingPositiveStat - 1);
          }
          selectedPOI.status = rate;
        }
      } else {
        alert("You new rate is the same as the previous one");
      }
    }
  }

  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

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
              <LineChart width={400} height={210} data={data} />
            </div>
          </div>
        </div>

        <div
          className="rate-status-buttons"
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            paddingTop: "20px",
          }}
        >
          {" "}
          {/* Added display flex and gap */}
          <button
            className="btn btn-success"
            style={{ flex: 1 }}
            onClick={() => handleClickStatus(true)}
          >
            Exists
          </button>
          <button
            className="btn btn-error"
            style={{ flex: 1 }}
            onClick={() => handleClickStatus(false)}
          >
            FakeNews
          </button>
        </div>
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
