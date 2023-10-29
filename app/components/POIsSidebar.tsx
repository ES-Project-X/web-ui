import {AiFillCloseCircle, AiFillDislike, AiFillLike} from "react-icons/ai";
import React, { useState } from 'react';

// @ts-ignore
const POIsSidebar = ({selectedPOI}) => {
    
    if (!selectedPOI) return ;

    const hideCard = () => {
        document.getElementById("poi-sidebar")?.style.setProperty("display", "none");
    }

    return (
        <div className="sidebar" data-testid="poi-sidebar" id="poi-sidebar">
            <div className="sidebar-body">
                <div className="sidebar-body-item">
                    <div className={"flex justify-end pb-2"}>
                    <button className="close-button" data-testid="close-button"><AiFillCloseCircle onClick={() => {hideCard()} } />
                    </button></div>
                    <img className="w-fit rounded-xl" src={"https://picsum.photos/200"} alt="poi_image"/>
                    <h2 className="mt-4">{selectedPOI.name}</h2>
                    <h5>{selectedPOI.type}</h5>
                    <p className="mt-8">{selectedPOI.description}</p>
                    <div className="flex flex-row gap-3">
                        <button className="bg-green-600 p-3 rounded flex flex-row items-center grow justify-center"><AiFillLike color="white" />
                        <span className="text-white ml-3">{selectedPOI.rating_positive}</span>
                        </button>
                        <button className="bg-red-600 p-3 rounded flex flex-row items-center grow justify-center"><AiFillDislike color="white" />
                            <span className="text-white ml-3">{selectedPOI.rating_negative}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

};
export default POIsSidebar;

