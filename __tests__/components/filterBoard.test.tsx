import FilterBoardComponent from "../../app/components/FilterBoard";
import {fireEvent, render} from "@testing-library/react"

describe("FilterBoardComponent", () => {

    let component: HTMLElement

    const findById = (id: string) => {
        return component.querySelector(`#${id}`) ?? undefined
    }

    beforeEach(() => {
        component = render(
            <FilterBoardComponent
                types={[
                    {label: "Bicycle Parking", value: "bicycle-parking", selected: true},
                    {label: "Bicycle Shop", value: "bicycle-shop", selected: true},
                    {label: "Drinking Water", value: "drinking-water", selected: true},
                    {label: "Toilets", value: "toilets", selected: true},
                    {label: "Bench", value: "bench", selected: true}
                ]}
                updateTypes={() => {}}
            />).container
    })

    it("updates checkbox", () => {
        const checkbox = findById("filter-type-bicycle-parking")
        expect(checkbox).toBeDefined()
        expect(checkbox).toBeChecked()

        fireEvent.click(checkbox!)

        expect(checkbox).not.toBeChecked()
    })
})