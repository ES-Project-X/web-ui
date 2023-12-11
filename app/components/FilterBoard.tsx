import { useState, useEffect } from "react";
import { FilterType } from "../structs/poi";

export default function FilterBoardComponent(
    {
        setFilterName,
        setFilterTypes,
        types,
        filterPOIs,
    }: {
        setFilterName: (name: string) => void,
        setFilterTypes: (types: FilterType[]) => void,
        types: FilterType[],
        filterPOIs: () => void
    }
) {

    const [open, setOpen] = useState(false);

    useEffect(() => {
        filterPOIs();
    })

    function toggleOpen() {
        setOpen(!open);
    }

    return (
        <div className="flex">
            <button onClick={toggleOpen} className="z-10">
                {open ?
                    <div className={"py-3 rounded-s-xl border border-gray-200 dark:border-gray-700 shadow bg-white dark:bg-black"}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black dark:text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>
                    :
                    <div className={"py-3 rounded-s-xl border border-gray-200 shadow dark:border-gray-700 bg-white dark:bg-black"}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black dark:text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </div>
                }
            </button>

            {open &&
                <div className="pr-2">
                    <div className={"p-3 border border-gray-200 rounded-xl shadow dark:border-gray-700 z-20 bg-white dark:bg-black text-black dark:text-white"}>
                        <div>
                            <div className="flex flex-col mb-2">
                                <label className="font-semibold mb-2 text-black dark:text-white text-lg">POI Name</label>
                                <input
                                    type="text"
                                    id="filter-name"
                                    placeholder="Enter POI Name"
                                    onChange={event => {
                                        setFilterName(event.target.value);
                                    }}
                                    className="bg-white dark:bg-black shadow appearance-none border rounded w-full py-2 px-3 text-black dark:text-white leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-black dark:text-white font-semibold text-lg mb-2">POI Name</label>
                                {types.map(type => {
                                    return (
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`filter-type-${type.value}`}
                                                key={type.value}
                                                defaultChecked={type.selected}
                                                onChange={() => {
                                                    type.selected = !type.selected;
                                                    setFilterTypes([...types]);
                                                }}
                                                className="mr-2 w-4 h-4"
                                                />
                                            <label className="text-base">{type.label}</label>
                                        </div>
                                    )
                                }
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div >
    )
}