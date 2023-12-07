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
        <div className={"flex flex-col items-center"}>
            <button onClick={toggleOpen} className="z-10">
                {open ?
                    <div className="absolute -left-6">
                        <div className={"py-3 border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700"}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </div>
                    </div>
                    :
                    <div className="absolute -right-2">
                        <div className={"py-3 border border-gray-200 shadow dark:bg-gray-800 dark:border-gray-700"}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                }
            </button>
            {open &&
                <div className={"p-3 border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 z-20"}>
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
            }
        </div>
    )
}