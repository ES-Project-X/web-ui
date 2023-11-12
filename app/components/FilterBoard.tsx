import {Form} from "react-bootstrap";
import { useEffect } from "react";
import {FilterType} from "../structs/poi";

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

    useEffect(() => {
        filterPOIs()
    })

    return (
        <>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>POI Name</Form.Label>
                    <Form.Control
                        type="text"
                        id="filter-name"
                        placeholder="Enter POI Name"
                        onChange={event => {
                            setFilterName(event.target.value)
                        }}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>POI Types</Form.Label>
                    {types.map(type =>
                        <Form.Check
                            type="checkbox"
                            id={`filter-type-${type.value}`}
                            key={type.value}
                            label={type.label}
                            defaultChecked={type.selected}
                            onChange={() => {
                                type.selected = !type.selected
                                setFilterTypes([...types])
                            }}
                        />
                    )}
                </Form.Group>
            </Form>
        </>

    )
}