import {POI} from "@/app/structs/poi";
import {AiFillDislike, AiFillLike} from "react-icons/ai";


const POIsSidebar = () => {
    const poi_mockup : POI = {
        id: "3278f14c-67bc-474a-9485-f4655e17a6d3",
        name: "Test POI",
        description: "This is a test POI",
        type: "test",
        picture_url: "https://picsum.photos/200",
        rating_negative: 0,
        rating_positive: 0,
    }

    return (
        <div className="sidebar">
            <div className="sidebar-body">
                <div className="sidebar-body-item">
                    <img className="w-fit rounded-xl" src={poi_mockup.picture_url} alt="poi_image"/>
                    <h2 className="mt-4">{poi_mockup.name}</h2>
                    <h5>{poi_mockup.type}</h5>
                    <p className="mt-8">{poi_mockup.description}</p>
                    <div className="flex flex-row gap-3">
                        <button className="bg-green-600 p-3 rounded flex flex-row items-center grow justify-center"><AiFillLike color="white" />
                        <span className="text-white ml-3">{poi_mockup.rating_positive}</span>
                        </button>
                        <button className="bg-red-600 p-3 rounded flex flex-row items-center grow justify-center"><AiFillDislike color="white" />
                            <span className="text-white ml-3">{poi_mockup.rating_positive}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default POIsSidebar;