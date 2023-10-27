import {AiFillDislike, AiFillLike} from "react-icons/ai";

const POIsSidebar = ({selectedPOI}) => {
    if (!selectedPOI) {
        return <div>Select a POI</div>;
    }
    return (
        <div className="sidebar">
            <div className="sidebar-body">
                <div className="sidebar-body-item">
                    {/*<img className="w-fit rounded-xl" src={selectedPOI.picture_url} alt="poi_image"/>*/}
                    <h2 className="mt-4">{selectedPOI.name}</h2>
                    <h5>{selectedPOI.type}</h5>
                    <p className="mt-8">{selectedPOI.description}</p>
                    <div className="flex flex-row gap-3">
                        <button className="bg-green-600 p-3 rounded flex flex-row items-center grow justify-center"><AiFillLike color="white" />
                        <span className="text-white ml-3">{selectedPOI.rating_positive}</span>
                        </button>
                        <button className="bg-red-600 p-3 rounded flex flex-row items-center grow justify-center"><AiFillDislike color="white" />
                            <span className="text-white ml-3">{selectedPOI.rating_positive}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

};
export default POIsSidebar;