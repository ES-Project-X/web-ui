"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import { LatLng, LatLngBounds } from "leaflet";
import "leaflet-rotate";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import LocateControl from "./LocateControl";
import MarkersManager from "./MarkersManager";
import FilterBoardComponent from "./FilterBoard";
import { BasicPOI, FilterType } from "../structs/poi";
import { updateClusterGroup } from "./DisplayPOIs";
import Sidebar from "./Sidebar";
import GetClusters from "./GetClusters";
import { Direction } from "../structs/direction";
import RegisterUserModal from "./RegisterUserModal";
import Cookies from "js-cookie";
import { UserData } from "../structs/user";
import { POI } from "../structs/poi";
import { URL_API, URL_GEO, URL_REV, COGNITO_LOGIN_URL } from "../utils/constants";
import { getDistanceFrom } from "../utils/functions";
import RoutingComponent from "./Routing";
import { SearchPoint } from "../structs/SearchComponent";
import "../globals.css";
import DirectionsComponent from "./Directions";
import POIsSidebar from "./POIsSidebar";

const TOKEN = Cookies.get("COGNITO_TOKEN");

export default function MapComponent({
	tileLayerURL,
}: {
	tileLayerURL?: string;
}) {
	const mapRef = useRef(null);
	const center = new LatLng(40.64427, -8.64554);

	const [origin, setOrigin] = useState<SearchPoint>(new SearchPoint(""));
	const [destination, setDestination] = useState<SearchPoint>(
		new SearchPoint("")
	);
	const [intermediates, setIntermediates] = useState<SearchPoint[]>([]);

	const [markers, setMarkers] = useState<BasicPOI[]>([]);
	const [selectedPOI, setSelectedPOI] = useState({
		id: "",
		name: "",
		type: "",
		latitude: 0,
		longitude: 0,
		rating_positive: 0,
		rating_negative: 0,
	} as POI);
	const [filterName, setFilterName] = useState<string>("");
	const [filterTypes, setFilterTypes] = useState<FilterType[]>([
		{ label: "Bicycle Parking", value: "bicycle-parking", selected: true },
		{ label: "Bicycle Shop", value: "bicycle-shop", selected: true },
		{ label: "Drinking Water", value: "drinking-water", selected: true },
		{ label: "Toilets", value: "toilets", selected: true },
		{ label: "Bench", value: "bench", selected: true },
	]);

	const [points, setPoints] = useState<LatLng[][]>([]);

	const [directions, setDirections] = useState<Direction[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);

	const [ratingPositive, setRatingPositive] = useState(0);
	const [ratingNegative, setRatingNegative] = useState(0);

	const [loggedIn, setLoggedIn] = useState<boolean>(false);
	const [avatar, setAvatar] = useState("");
	const [fname, setFname] = useState("");
	const [isRModalOpen, setIsRModalOpen] = useState(false);

	const [routing, setRouting] = useState(false);
	const [addIntermediate, setAddIntermediate] = useState(false);

	const [openRouting, setOpenRouting] = useState(false);
	const [showRouting, setShowRouting] = useState(true);

	const [showDirections, setShowDirections] = useState(false);
	const [POISideBar, setPOISideBar] = useState(false);
	const [searchField, setSearchField] = useState("");

	const [showPOIButton, setShowPOIButton] = useState(false);
	const [showDetails, setShowDetails] = useState(false);

	const [markerCoordinates, setMarkerCoordinates] = useState({
		latitude: 0,
		longitude: 0,
	});

	function getUser() {
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${TOKEN}`,
		};
		const url = new URL(URL_API + "user");

		return fetch(url.toString(), { headers })
			.then(async (res) => {
				if (res.status === 400) {
					setIsRModalOpen(true);
					return undefined;
				} else if (res.status !== 200) {
					return undefined;
				}
				return res.json();
			})
			.then((data: UserData) => {
				setAvatar(data.image_url);
				setFname(data.first_name);
				localStorage.setItem("user", JSON.stringify(data));
				setLoggedIn(true);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	useEffect(() => {
		navigator.permissions.query({ name: "geolocation" }).then((result) => {
			if (result.state === "denied") {
				// @ts-ignore
				const bounds = mapRef.current?.getBounds();
				// @ts-ignore
				mapRef.current?.fireEvent("moveend", {
					target: { getBounds: () => bounds },
				});
			}
		});

		if (!TOKEN) {
			setLoggedIn(false);
			localStorage.removeItem("user");
		} else if (localStorage.getItem("user")) {
			setLoggedIn(true);
			const userLS = JSON.parse(localStorage.getItem("user") || "");
			setAvatar(userLS.image_url);
			setFname(userLS.first_name);
		} else if (TOKEN) {
			getUser();
		}
	}, []);

	function getPosition() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					return ({
						lat: position.coords.latitude,
						lon: position.coords.longitude,
					});
				},
				(error) => {
					console.log(error);
				},
				{ enableHighAccuracy: true }
			);
		} else {
			console.log("Geolocation is not supported by this browser.");
		}
		return null;
	}

	const addToBearing = (amount: number) => {
		if (mapRef.current) {
			// @ts-ignore
			const nextBearing = mapRef.current.getBearing() + (amount % 360);
			// @ts-ignore
			mapRef.current.setBearing(nextBearing);
		}
	};

	function fetchPOIDetails(id: string) {
		// send Token if Token is defined

		let headers = {};
		if (TOKEN !== undefined && TOKEN !== null) {
			headers = {
				"Content-Type": "application/json",
				Authorization: `Bearer ${TOKEN}`,
			};
		}
		const url = new URL(URL_API + "poi/id/" + id);
		fetch(url.toString(), { headers })
			.then((response) => response.json())
			.then((data) => {
				setSelectedPOI(data);
				setRatingPositive(data.rating_positive);
				setRatingNegative(data.rating_negative);
			})
			.catch(() => { });
		return;
	}

	const filterPOIs = () => {
		const filteredMarkers = markers
			.filter((marker) => {
				return filterTypes.some((type) => {
					return type.selected && marker.type === type.value;
				});
			})
			.filter((marker) => {
				return marker.name.toLowerCase().includes(filterName.toLowerCase());
			});
		if (mapRef.current) {
			updateClusterGroup(filteredMarkers, mapRef, fetchPOIDetails, showPOIsSideBar);
		}
	};

	const flyTo = (lat: number, lng: number, zoom: number, dur: number = 4) => {
		// @ts-ignore
		mapRef.current.flyTo(new LatLng(lat, lng), zoom, { duration: dur });
	};

	const fitBounds = (bounds: LatLngBounds) => {
		// @ts-ignore
		mapRef.current.fitBounds(bounds, { padding: [50, 50] });
	};

	const getViewBounds = () => {
		// @ts-ignore
		return mapRef.current.getBounds();
	};

	const getGeoLocation = (query: string) => {
		fetch(query)
			.then((response) => response.json())
			.then((data) => {
				if (data.items.length === 0) {
					window.alert("No results");
					return;
				}
				const lat = data.items[0].position.lat;
				const lng = data.items[0].position.lng;
				// @ts-ignore
				flyTo(lat, lng, 15);
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			const query = searchField;
			if (query.match(/-?[0-9]{1,3}[.][0-9]+,-?[0-9]{1,3}[.][0-9]+/)) {
				getGeoLocation(URL_REV + "&at=" + query);
			} else {
				getGeoLocation(URL_GEO + "&q=" + query);
			}
		}
	};

	const createRoute = () => {
		if (showDirections) {
			closeDirections();
			return;
		}
		else if (openRouting) {
			setPoints([]);
			setOrigin(new SearchPoint(""));
			setDestination(new SearchPoint(""));
			setIntermediates([new SearchPoint("")]);
		}
		setRouting(!routing);
		setOpenRouting(!openRouting);
		closeDirections();
	};

	const handleNext = () => {
		if (currentIndex === directions.length - 1) return;
		setCurrentIndex(currentIndex + 1);
	};

	const handleBefore = () => {
		if (currentIndex === 0) return;
		setCurrentIndex(currentIndex - 1);
	};

	/* Fetch the user details by username */
	// const res = await fetch(`.../${params.user}`)
	// const data: user = await res.json()
	// const URL_USER = process.env.API_URL;

	useEffect(() => {
		const modal = document.getElementById(
			"register_user_modal"
		) as HTMLDialogElement;
		if (modal === null) {
			return;
		}
		if (isRModalOpen) {
			modal.showModal();
		} else {
			modal.close();
			setIsRModalOpen(false);
		}
	}, [isRModalOpen]);

	useEffect(() => {
		setShowPOIButton(canCreatePOI());
	}, [markerCoordinates]);

	const closeModal = () => {
		setIsRModalOpen(false);
	};

	const registerUser = (userData: any) => {
		const headers = {
			"Content-Type": "application/json",
			Authorization: `Bearer ${TOKEN}`,
		};
		const url = new URL(URL_API + "auth/register");

		fetch(url.toString(), {
			headers,
			method: "POST",
			body: JSON.stringify(userData),
		})
			.then((res) => res.json())
			.then((data) => {
				setAvatar(data.image_url);
				setFname(data.first_name);
				localStorage.setItem("user", JSON.stringify(data));
				setLoggedIn(true);
			})
			.catch((err) => {
				console.log("error:", err);
			});

		closeModal();
		window.location.reload();
	};

	function closeDirections() {
		setShowDirections(false);
		setShowRouting(true);
	}

	function openDirections() {
		setShowRouting(false);
		setShowDirections(true);
	}

	function showPOIsSideBar() {
		setPOISideBar(true);
		setShowDetails(false);
	}

	function hidePOIsSideBar() {
		setPOISideBar(false);
	}

	function openCreatePOIModal() {
		window.location.replace(
			`/createpoi?lat=${markerCoordinates.latitude}&lng=${markerCoordinates.longitude}`
		);
	}

	function canCreatePOI() {
		if (!isMobile || !loggedIn) {
			return false;
		}
		const markerLocation = {
			latitude: markerCoordinates.latitude,
			longitude: markerCoordinates.longitude,
		};
		const userLocation = getPosition();
		console.log(userLocation);
		if (userLocation === null) {
			return false;
		}
		const input = {
			currentLocation: userLocation,
			point: markerLocation,
		}
		const distance = getDistanceFrom(input);
		console.log(distance);
		if (distance < 20) {
			return true;
		}
		return false;
	}


	return (
		<>
			{/* Sidebar

			<Sidebar routes={routes} draw={drawRoute} />

			*/}

			<MapContainer
				id={"map-container"}
				ref={mapRef}
				className={"map"}
				center={center}
				zoom={13}
				scrollWheelZoom={true}
				zoomControl={isMobile ? false : true}
				rotate={true}
				bearing={0}
				maxZoom={18}
				minZoom={2}
				maxBounds={[
					[-90, -180],
					[90, 180],
				]}
				// @ts-ignore
				rotateControl={{ closeOnZeroBearing: false }}
				touchRotate={true}
				attributionControl={false}
			>
				{tileLayerURL !== undefined ? <TileLayer url={tileLayerURL} /> : null}
				{tileLayerURL !== undefined ? <Polyline positions={points} weight={7} /> : null}
				<LocateControl />
				<MarkersManager
					origin={origin}
					setOrigin={setOrigin}
					destination={destination}
					setDestination={setDestination}
					intermediates={intermediates}
					setIntermediates={setIntermediates}
					routing={routing}
					setMarkerCoordinates={setMarkerCoordinates}
				/>
				<GetClusters markers={markers} setMarkers={setMarkers} filterPOIs={filterPOIs} />
			</MapContainer>
			<div className="map-ui w-full h-screen flex flex-col">
				{isRModalOpen && (
					<RegisterUserModal
						onClose={closeModal}
						onRegisterUser={registerUser}
					/>
				)}
				{/*
                    	UPPER PART OF THE UI
                	*/}
				<div className="flex pt-2 w-full top-0">
					<div className={"w-48 sm:w-96 mx-auto pt-1"}>
						<input
							type={"text"}
							placeholder={"Search"}
							onKeyDown={handleKeyDown}
							onChange={(event) => setSearchField(event.target.value)}
							className="bg-white dark:bg-black shadow appearance-none border rounded w-full py-2 px-3 mb-2 text-black dark:text-white leading-tight focus:outline-none focus:shadow-outline"
						/>
					</div>
					<div className="absolute right-2">
						{loggedIn ? (
							<a href={`/profile`}>
								<button
									style={{
										backgroundColor: "transparent",
										border: "none",
										padding: "0",
									}}
									className="btn-circle"
								>
									<img
										src={avatar}
										alt={`${fname}'s profile`}
										className="rounded-circle shadow"
										style={{ height: "100%", objectFit: "cover" }}
									/>
								</button>
							</a>
						) : (
							<a
								href={COGNITO_LOGIN_URL}
								className="btn-circle-link"
								target="_self"
							>
								<button className="btn">Login</button>
							</a>
						)}
					</div>
				</div>
				{/*
                    	MIDDLE PART OF THE UI
                	*/}
				<div className="flex h-screen">
					<div className="flex flex-col ml-2 pt-10 sm:pt-32 w-full sm:w-1/5">
						{openRouting && (
							<RoutingComponent
								showRouting={showRouting}
								setShowRouting={setShowRouting}
								loggedIn={loggedIn}
								mapFlyTo={flyTo}
								mapFitBounds={fitBounds}
								getViewBounds={getViewBounds}
								origin={origin}
								setOrigin={setOrigin}
								destination={destination}
								setDestination={setDestination}
								intermediates={intermediates}
								setIntermediates={setIntermediates}
								setPoints={setPoints}
								addIntermediate={addIntermediate}
								setAddIntermediate={setAddIntermediate}
								setDirections={setDirections}
								openDirections={openDirections}
								setCurrentIndex={setCurrentIndex}
							/>
						)}
					</div>
					<div className={"flex items-center ml-auto"}>
						{!POISideBar && (
							<div>
								<FilterBoardComponent
									filterPOIs={filterPOIs}
									setFilterName={setFilterName}
									setFilterTypes={setFilterTypes}
									types={filterTypes}
								/>
							</div>
						)}
						{POISideBar && (
							<div className="pr-2">
								<POIsSidebar
									isLoggedIn={loggedIn}
									selectedPOI={selectedPOI}
									ratingPositive={ratingPositive}
									setRatingPositive={setRatingPositive}
									ratingNegative={ratingNegative}
									setRatingNegative={setRatingNegative}
									hideCard={hidePOIsSideBar}
									showDetails={showDetails}
									setShowDetails={setShowDetails}
									getPosition={getPosition}
								/>
							</div>
						)}
					</div>
				</div>
				{/*
                    	LOWER PART OF THE UI
                	*/}
				<div className="pb-2 mt-auto w-full">
					<div className="mx-auto w-full sm:w-1/2">
						{showDirections && (
							<DirectionsComponent
								directions={directions}
								currentIndex={currentIndex}
								handleNext={handleNext}
								handleBefore={handleBefore}
								closeDirections={closeDirections}
							/>
						)}
					</div>
					<div className="flex w-full">
						<div className="absolute left-2 bottom-2">
							{!isMobile ? (
								<button
									id={"ori-dst-btn"}
									onClick={createRoute}
									className="btn"
								>
									Route
								</button>
							) : (
								showRouting ? (
									<button
										id={"ori-dst-btn"}
										onClick={createRoute}
										className="btn"
									>
										Route
									</button>
								) : (
									<button
										id={"ori-dst-btn"}
										onClick={closeDirections}
										className="btn"
									>
										Show
									</button>
								)
							)}
						</div>
						<div className="mx-auto">
							{showPOIButton && (
								<button
									id={"create-poi-btn"} // Ensure unique IDs for the buttons
									onClick={openCreatePOIModal}
									className="btn bg-green-600 text-white border-white hover:bg-green-700 hover:border-green-700"
								>
									Create POI
								</button>
							)}
						</div>
						<div className={"flex absolute right-2 bottom-2"}>
							{isMobile ? null :
								(
									<>
										<button
											id={"map-rotate-left-btn"}
											onClick={() => addToBearing(-10)}
											className="btn py-3 px-3 border rounded-none rounded-l-xl shadow"
										>
											Rotate Left
										</button>
										<button
											id={"map-rotate-right-btn"}
											onClick={() => addToBearing(10)}
											className="btn py-3 px-3 border rounded-none rounded-r-xl shadow"
										>
											Rotate Right
										</button>
									</>
								)
							}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
