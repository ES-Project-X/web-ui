import {Form} from "react-bootstrap";

export default function FilterBoardComponent(
    {
        types,
        updateTypes
    }: {
        types: { label: string, value: string, selected: boolean }[]
        updateTypes: (types: { label: string, value: string, selected: boolean }[]) => void
    }
) {
    return (
        <>
            <Form>
                <Form.Group className="mb-3">
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
                                updateTypes(types)
                            }}
                        />
                    )}
                </Form.Group>
            </Form>
        </>

    )
}