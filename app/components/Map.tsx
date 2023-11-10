"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  Form,
  Card,
  Row,
  CloseButton,
  Container,
  Col,
} from "react-bootstrap";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { LatLng } from "leaflet";
import "leaflet-rotate";

import LocateControl from "./LocateControl";
import MarkersManager from "./MarkersManager";
import FilterBoardComponent from "./FilterBoard";
import { BasicPOI, FilterType } from "../structs/poi";
import RedMarker from "./icons/RedMarker";
import {
  BicycleParkingMarker,
  BicycleShopMarker,
  DrinkingWaterMarker,
  ToiletsMarker,
  BenchMarker,
} from "./icons/TypeMarkers";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";

export default function MapComponent({
  tileLayerURL,
}: {
  tileLayerURL?: string;
}) {
  const mapRef = useRef(null);
  const center = new LatLng(40.64427, -8.64554);

  const [userPosition, setUserPosition] = useState<{
    [key: string]: undefined | number;
  }>({
    latitude: undefined,
    longitude: undefined,
  });
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [odmap, setodmap] = useState(false);

  const [basicPOIs, setBasicPOIs] = useState<BasicPOI[]>([]);

  const API_KEY = process.env.PUBLIC_KEY_HERE;
  const URL_API = "http://127.0.0.1:8000/"; // TODO: put in .env
  const URL_GEO =
    "https://geocode.search.hereapi.com/v1/geocode?apiKey=" +
    API_KEY +
    "&in=countryCode:PRT";
  const URL_REV =
    "https://revgeocode.search.hereapi.com/v1/revgeocode?apiKey=" + API_KEY;

  useEffect(() => {
    navigator.geolocation.watchPosition((location) => {
      const { latitude, longitude } = location.coords;
      setUserPosition({ latitude, longitude });
    });
  }, []);

  const addToBearing = (amount: number) => {
    if (mapRef.current) {
      // @ts-ignore
      const nextBearing = mapRef.current.getBearing() + (amount % 360);
      // @ts-ignore
      mapRef.current.setBearing(nextBearing);
    }
  };

  const fetchPOIs = (name: string, types: FilterType[]) => {
    const typesFetch = types
      .filter((type) => type.selected)
      .map((type) => type.value);

    const url = new URL(URL_API + "poi");
    name.length > 0 && url.searchParams.append("name", name);
    typesFetch.forEach((type) => url.searchParams.append("type", type));

    fetch(url.toString())
      .then((response) => response.json())
      .then((data) => setBasicPOIs(data))
      .catch(() => {});
  };

  const getIcon = (poiType: string) => {
    switch (poiType) {
      case "bicycle-parking":
        return BicycleParkingMarker;
      case "bicycle-shop":
        return BicycleShopMarker;
      case "drinking-water":
        return DrinkingWaterMarker;
      case "toilets":
        return ToiletsMarker;
      case "bench":
        return BenchMarker;
      default:
        return RedMarker;
    }
  };

  const getGeoLocation = (query: string) => {
    fetch(query)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.items.length === 0) {
          window.alert("No results");
          return;
        }
        const lat = data.items[0].position.lat;
        // @ts-ignore
        document.getElementById("lat-text").innerHTML = "Latitude: " + lat;
        const lng = data.items[0].position.lng;
        // @ts-ignore
        document.getElementById("lng-txt").innerHTML = "Longitude: " + lng;
        const address = data.items[0].address.label;
        // @ts-ignore
        document.getElementById("location-text").innerHTML = address;
        // @ts-ignore
        document.getElementById("card-info").style.display = "block";
        // @ts-ignore
        mapRef.current.flyTo(new LatLng(lat, lng), 15);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const query = (event.target as HTMLInputElement).value;
      if (query.match(/-?[0-9]{1,3}[.][0-9]+,-?[0-9]{1,3}[.][0-9]+/)) {
        getGeoLocation(URL_REV + "&at=" + query);
      } else {
        getGeoLocation(URL_GEO + "&q=" + query);
      }
    }
  };

  const createRoute = () => {
    var card = document.getElementById("card-ori-dest");
    // @ts-ignore
    if (card.style.display === "none") {
      // @ts-ignore
      card.style.display = "block";
    } else {
      // @ts-ignore
      card.style.display = "none";
    }
  };

  const getFromMap = () => {
    if (odmap) {
      console.log("odmap");
      setodmap(false);
      setCreatingRoute(false);
      setOrigin("");
      setDestination("");
      // @ts-ignore
      document.getElementById("origin-input").value = "";
      // @ts-ignore
      document.getElementById("origin-input").style.readonly = false;
      // @ts-ignore
      document.getElementById("destination-input").value = "";
      // @ts-ignore
      document.getElementById("destination-input").style.readonly = false;
    } else {
      console.log("not odmap");
      setodmap(true);
      setCreatingRoute(true);
      setOrigin("");
      setDestination("");
      // @ts-ignore
      document.getElementById("origin-input").value = "";
      // @ts-ignore
      document.getElementById("origin-input").style.readonly = true;
      // @ts-ignore
      document.getElementById("destination-input").value = "";
      // @ts-ignore
      document.getElementById("destination-input").style.readonly = true;
    }
  };

  const hidecard = () => {
    // @ts-ignore
    document.getElementById("card-info").style.display = "none";
  };

  const updateOrigin = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrigin(event.target.value);
  };

  const updateDestination = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(event.target.value);
  };

  // FETCHE THE USER HERE AND STORE IT TO PASS IT TO THE PROFILE PAGE
  /* GUI */
  const userMock = {
    name: "John Doexxx",
    email: "johndoe@example.com",
    username: "johndoe",
    profilePictureUrl:
      "https://i.imgur.com/8Km9tLL.png",
  };

  const TOKEN =
    "eyJraWQiOiJSc0d4ckllKzZFXC9SVVlPOUFxU1RVaXJCZ2lvamZFUUZucGpXN0FTQVFDWT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzMGM4NjM5Yy1jMGE0LTQ0ZjktYjNhZC04MDU5NTk0MTAzZDQiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV9kemdZTDhmUFgiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI1ZzRic2ZzbHFhOTV1NHBkMnBvc2JuMHJudSIsImV2ZW50X2lkIjoiNTBkZTM4YzUtZTJmZi00YjQ0LWFmMDQtYzhjYjk5OTg1NjcxIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJvcGVuaWQgZW1haWwiLCJhdXRoX3RpbWUiOjE2OTk2MTM0NzEsImV4cCI6MTY5OTYxNzA3MSwiaWF0IjoxNjk5NjEzNDcxLCJqdGkiOiIxNmVkZjY3OC00MWU5LTQyZjYtOGQ0Yi02ZWJjOTUxOTMwMjQiLCJ1c2VybmFtZSI6IjMwYzg2MzljLWMwYTQtNDRmOS1iM2FkLTgwNTk1OTQxMDNkNCJ9.HWfnJIbgtu8PyMc4pok6f0XY_nXUG9M0RX7tws6lZXvjRK7QbX7tzcnmDxs9pSVHOTD0T-j7y4cOmYe8apVrrc3Xd9pzggdzRdHw9Vgh7aFwNi41JQm9DyGGO4Eml8YRJfKKhv0F4LI16PK_Q_LdoIJMGYYVuhp7pjJ88VUGDW1cDD_8XwKG83RmniSFiqIdJN1U66jAKusZ0vha07QvegxTnfP5jXv6MWsRXiYg_qWG9nKGj2gS5s5kNHAYvjICYXm3vi6lq02ELUQQ_4g5ab7hWNBoFLn794qYvpy2fqRBM9aoUNdN4e8kGnICUKGLKH2IBp4KGCx5OjDm0YIefQ";
  /* Fetch the user details by username */
  // const res = await fetch(`.../${params.user}`)
  // const data: user = await res.json()
  const URL_USER = process.env.API_URL;
  const [user, setUser] = useState(null);
  useEffect(() => {
    const headers = { Authorization: `Bearer ${TOKEN}` };
    const url = new URL("http://127.0.0.1:8000/user");

    const fetchUser = async () => {
      console.log("fetching user");
      console.log("URL_USER:", URL_USER);
      console.log("TOKEN:", TOKEN);
      try {
        await fetch(url.toString(), { headers })
          .then((res) => res.json())
          .then((data) => {
            setUser(data);
            console.log(data);
            localStorage.setItem("user", JSON.stringify(data));
          });
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  /* flex tape */
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    console.log("user HEY:", user),
    (
      <>
        {/* Sidebar */}

        <Sidebar />

        {/* eventually change this to the main page, but for now fica aqui */}

        <MapContainer
          id={"map-container"}
          ref={mapRef}
          className={"map"}
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          rotate={true}
          bearing={0}
          // @ts-ignore
          rotateControl={{ closeOnZeroBearing: false }}
          touchRotate={true}
        >
          {tileLayerURL !== undefined ? <TileLayer url={tileLayerURL} /> : null}
          <LocateControl />
          <MarkersManager
            setOrigin={setOrigin}
            setDestination={setDestination}
            creatingRoute={creatingRoute}
          />
          {/*
                    DISPLAY POIs
                */}
          {/*  {basicPOIs.map((poi) => {
          return (
            <Marker
              key={poi.id}
              icon={getIcon(poi.type)}
              position={new LatLng(poi.latitude, poi.longitude)}
            >
              <Popup>
                {poi.name} <br /> {poi.type}
              </Popup>
            </Marker>
          );
        })} */}
        </MapContainer>
        <Button
          id={"ori-dst-btn"}
          onClick={createRoute}
          variant={"light"}
          style={{
            zIndex: 1,
            scale: "100%",
            bottom: "6%",
            left: "0.5em",
            position: "absolute",
            border: ".1em solid black",
          }}
        >
          Route
        </Button>
        <Card
          id={"card-ori-dest"}
          style={{
            zIndex: 1,
            top: "1%",
            left: "5%",
            width: "15%",
            position: "absolute",
            display: "none",
          }}
        >
          <Card.Body>
            <Form>
              <Form.Group>
                <Form.Label>Origin</Form.Label>
                <Form.Control
                  id={"origin-input"}
                  type={"text"}
                  placeholder={"Origin"}
                  onChange={updateOrigin}
                  value={origin}
                  readOnly={false}
                />
              </Form.Group>
              <br />
              <Form.Group>
                <Form.Label>Destination</Form.Label>
                <Form.Control
                  id={"destination-input"}
                  type={"text"}
                  placeholder={"Destination"}
                  onChange={updateDestination}
                  value={destination}
                  readOnly={false}
                />
              </Form.Group>
              <br />
              <Form.Group className="mb-3">
                <Form.Check
                  id="mapcbox"
                  type="checkbox"
                  onChange={getFromMap}
                  label="Select in Map"
                />
              </Form.Group>
              <Form.Group>
                <Button
                  id={"get-route-btn"}
                  variant={"light"}
                  style={{ border: ".1em solid black" }}
                >
                  Get Route
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
        <Container className={"map-ui d-flex flex-column h-100"} fluid>
          {/*
                    POPUP CARD
                */}
          <Card
            id={"card-info"}
            style={{
              position: "absolute",
              top: "10em",
              left: "50%",
              display: "none",
            }}
          >
            <Card.Header>
              <CloseButton id={"card-btn"} onClick={hidecard} />
            </Card.Header>
            <Card.Body>
              <Row id={"location-text"}></Row>
              <Row id={"lat-text"}></Row>
              <Row id={"lng-txt"}></Row>
            </Card.Body>
          </Card>
          {/*
                    UPPER PART OF THE UI
                */}
          <Row className={"pt-2"}>
            <Col xs={"auto"} className={"mx-auto"}>
              <Form>
                <Form.Group controlId={"search-bar"}>
                  <Form.Control
                    type={"text"}
                    placeholder={"Search"}
                    onKeyDown={handleKeyDown}
                  />
                </Form.Group>
              </Form>
            </Col>
            <Col xs="auto" className="d-flex align-items-center">
              <ButtonGroup>
                <a
                  href={`/profile/${user.username}`}
                  className="btn-circle-link"
                >
                  <Button
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      padding: "0",
                    }}
                    className="btn-circle"
                  >
                    {user.image_url === "" ? (
                      <img
                        src={userMock.profilePictureUrl}
                        alt={`${user.first_name}'s profile`}
                        className="rounded-circle"
                      />
                    ) : (
                      <img
                        src={user.image_url}
                        alt={`${user.first_name}'s profile`}
                        className="rounded-circle"
                      />
                    )}
                  </Button>
                </a>
              </ButtonGroup>
            </Col>
          </Row>
          {/*
                    MIDDLE PART OF THE UI
                */}
          <Row className={"flex-grow-1"}>
            <Col xs={"auto"} className={"flex-grow-1"}></Col>
            <Col xs={"auto"} className={"d-flex align-items-center"}>
              <Card id={"filter-board"}>
                <Card.Body>
                  <FilterBoardComponent fetchPOIs={fetchPOIs} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/*
                    LOWER PART OF THE UI
                */}
          <Row className={"pb-2"}>
            <Col xs={2}></Col>
            <Col xs={"auto"} className={"mx-auto"}>
              <Card className={"text-center"}>
                <Card.Body>
                  <Card.Title>User Position</Card.Title>
                  <Card.Text id={"map-user-position"}>
                    {userPosition.latitude !== undefined &&
                    userPosition.longitude !== undefined
                      ? `Latitude: ${userPosition.latitude} | Longitude: ${userPosition.longitude}`
                      : "Please enable location to see your current location"}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col xs={2} className={"d-flex align-items-end"}>
              <ButtonGroup>
                <Button
                  id={"map-rotate-left-btn"}
                  variant={"light"}
                  onClick={() => addToBearing(-10)}
                >
                  Rotate Left
                </Button>
                <Button
                  id={"map-rotate-right-btn"}
                  variant={"light"}
                  onClick={() => addToBearing(10)}
                >
                  Rotate Right
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Container>
      </>
    )
  );
}
