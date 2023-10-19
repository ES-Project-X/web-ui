import {Form} from "react-bootstrap";

export default function FilterBoard({fetchPOIs}: { fetchPOIs: (types :string[]) => void }) {
    const typesForm = [
        {label: "Bicycle Parking", value: "bicycle_parking", selected: true},
        {label: "Bicycle Shop", value: "bicycle_shop", selected: true},
        {label: "Drinking Water", value: "drinking_water", selected: true},
        {label: "Toilets", value: "toilets", selected: true},
        {label: "Bench", value: "bench", selected: true}
    ]

    return (
        <>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>POI Types</Form.Label>
                    {typesForm.map(type =>
                        <Form.Check
                            type="checkbox"
                            id={`filter-type-${type.value}`}
                            key={type.value}
                            label={type.label}
                            defaultChecked={type.selected}
                            onChange={() => {
                                type.selected = !type.selected
                                const types = typesForm
                                    .filter(type => type.selected)
                                    .map(type => type.value)
                                fetchPOIs(types)
                            }}
                        />
                    )}
                </Form.Group>
            </Form>
        </>

    )
}