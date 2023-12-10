import { Form } from "react-bootstrap";
import { useState } from "react";
import { useEffect } from "react";
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
                    <div className={"py-3 rounded-s-lg border border-gray-200 dark:border-gray-700 shadow bg-white dark:bg-black"}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>
                    :
                    <div className={"py-3 rounded-s-lg border border-gray-200 shadow bg-primary dark:border-gray-700"}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </div>
                }
            </button>

            {open &&
                <div className="pr-2">
                    <div className={"p-3 border border-gray-200 rounded-lg shadow bg-primary dark:border-gray-700 z-20"}>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>POI Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="filter-name"
                                    placeholder="Enter POI Name"
                                    onChange={event => {
                                        setFilterName(event.target.value);
                                    }} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>POI Types</Form.Label>
                                {types.map(type => <Form.Check
                                    type="checkbox"
                                    id={`filter-type-${type.value}`}
                                    key={type.value}
                                    label={type.label}
                                    defaultChecked={type.selected}
                                    onChange={() => {
                                        type.selected = !type.selected;
                                        setFilterTypes([...types]);
                                    }} />
                                )}
                            </Form.Group>
                        </Form>
                    </div>
                </div>
            }
        </div >
    )
}