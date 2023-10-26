import {Form} from "react-bootstrap";
import {useEffect, useState} from "react";
import {FilterType} from "../structs/poi";

export default function FilterBoardComponent(
    {
        initName = "",
        initTypes = [
            {label: "Bicycle Parking", value: "bicycle-parking", selected: true},
            {label: "Bicycle Shop", value: "bicycle-shop", selected: true},
            {label: "Drinking Water", value: "drinking-water", selected: true},
            {label: "Toilets", value: "toilets", selected: true},
            {label: "Bench", value: "bench", selected: true}
        ],
        filterPOIs
    }: {
        initName?: string,
        initTypes?: FilterType[],
        filterPOIs: (
            name: string,
            types: FilterType[]
        ) => void
    }
) {

    const [name, setName] = useState(initName)
    const [types, setTypes] = useState<FilterType[]>(initTypes);

    useEffect(() => {
        filterPOIs(name, types)
    }, [name, types])

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
                            setName(event.target.value)
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
                                setTypes([...types])
                            }}
                        />
                    )}
                </Form.Group>
            </Form>
        </>

    )
}